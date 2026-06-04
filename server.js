const fs = require('fs');
const express = require('express');
const chromiumModule = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const { PDFDocument } = require('pdf-lib');

const chromium = chromiumModule.default || chromiumModule.chromium || chromiumModule;

const app = express();
const PORT = process.env.PORT || 3000;
const OWNER_DASHBOARD_USER = process.env.OWNER_DASHBOARD_USER || 'admin';
const OWNER_DASHBOARD_PASS = process.env.OWNER_DASHBOARD_PASS || 'change-me';
const OWNER_DATA_API_URL = process.env.OWNER_DATA_API_URL || '';

const SNAPSHOT_WIDTH = 1280;
const SNAPSHOT_HEIGHT = 950;
const PAGE_SELECTOR = '.report-page';

app.set('trust proxy', true);

function basicAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Iconic Owner Dashboard"');
    return res.status(401).send('Authentication required');
  }

  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const splitAt = decoded.indexOf(':');
  const user = splitAt >= 0 ? decoded.slice(0, splitAt) : '';
  const pass = splitAt >= 0 ? decoded.slice(splitAt + 1) : '';

  if (user === OWNER_DASHBOARD_USER && pass === OWNER_DASHBOARD_PASS) return next();

  res.set('WWW-Authenticate', 'Basic realm="Iconic Owner Dashboard"');
  return res.status(401).send('Invalid credentials');
}

function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  return `${protocol}://${host}`;
}

function authHeaderValue() {
  const token = Buffer.from(`${OWNER_DASHBOARD_USER}:${OWNER_DASHBOARD_PASS}`).toString('base64');
  return `Basic ${token}`;
}

async function resolveChromiumExecutablePath() {
  const candidates = [
    chromium && chromium.executablePath,
    chromiumModule && chromiumModule.executablePath
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (typeof candidate === 'function') {
      const resolved = await candidate.call(chromium);
      if (resolved) return resolved;
    }

    if (typeof candidate === 'string') {
      return candidate;
    }

    if (typeof candidate.then === 'function') {
      const resolved = await candidate;
      if (resolved) return resolved;
    }
  }

  const systemCandidates = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];

  const found = systemCandidates.find(filePath => fs.existsSync(filePath));
  if (found) return found;

  throw new Error(
    `Chromium executable path not found. chromium keys: ${Object.keys(chromium || {}).join(', ') || 'none'}`
  );
}

function chromiumArgs() {
  const baseArgs = Array.isArray(chromium && chromium.args) ? chromium.args : [];

  return [
    ...baseArgs,
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote'
  ];
}

function chromiumHeadlessValue() {
  if (chromium && chromium.headless !== undefined) return chromium.headless;
  return 'new';
}

async function launchSnapshotBrowser() {
  const executablePath = await resolveChromiumExecutablePath();

  return puppeteer.launch({
    args: chromiumArgs(),
    defaultViewport: {
      width: SNAPSHOT_WIDTH,
      height: SNAPSHOT_HEIGHT,
      deviceScaleFactor: 2
    },
    executablePath,
    headless: chromiumHeadlessValue()
  });
}

async function screenshotPagesToPdf(page) {
  const pageHandles = await page.$$(PAGE_SELECTOR);

  if (!pageHandles.length) {
    throw new Error(`No report pages found with selector ${PAGE_SELECTOR}`);
  }

  const pdfDoc = await PDFDocument.create();

  for (let index = 0; index < pageHandles.length; index += 1) {
    const handle = pageHandles[index];

    await handle.evaluate(el => {
      el.scrollIntoView({ block: 'start', inline: 'nearest' });
    });

    await page.waitForTimeout(250);

    const box = await handle.boundingBox();

    if (!box || box.width <= 0 || box.height <= 0) {
      throw new Error(`Could not measure report page ${index + 1}`);
    }

    const imageBuffer = await handle.screenshot({
      type: 'png',
      omitBackground: false
    });

    const pngImage = await pdfDoc.embedPng(imageBuffer);

    const pdfPage = pdfDoc.addPage([pngImage.width, pngImage.height]);

    pdfPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngImage.width,
      height: pngImage.height
    });
  }

  return Buffer.from(await pdfDoc.save());
}

app.use(basicAuth);
app.use(express.static('public', { etag: false, maxAge: 0 }));

app.get('/api/dashboard-data', async (req, res) => {
  try {
    if (!OWNER_DATA_API_URL) {
      return res.status(500).json({ ok: false, error: 'OWNER_DATA_API_URL is missing.' });
    }

    const response = await fetch(OWNER_DATA_API_URL, { headers: { Accept: 'application/json' } });
    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: text.slice(0, 500) });
    }

    return res.json(JSON.parse(text));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
});

app.get('/api/report-pdf', async (req, res) => {
  let browser;

  try {
    const baseUrl = getBaseUrl(req);
    const reportUrl = `${baseUrl}/?snapshot=pdf`;

    browser = await launchSnapshotBrowser();
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      Authorization: authHeaderValue()
    });

    await page.setViewport({
      width: SNAPSHOT_WIDTH,
      height: SNAPSHOT_HEIGHT,
      deviceScaleFactor: 2
    });

    await page.goto(reportUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    await page.waitForFunction(() => {
      const reportPages = document.querySelectorAll('.report-page');
      const cards = document.querySelectorAll('#channelCards .channel-card');
      const text = document.body ? document.body.innerText : '';
      return reportPages.length >= 5 &&
        cards.length >= 4 &&
        text.includes('Meta') &&
        text.includes('Google') &&
        text.includes('Snapchat') &&
        text.includes('TikTok');
    }, { timeout: 45000 });

    await page.addStyleTag({
      content: `
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #07111F !important;
          -webkit-font-smoothing: antialiased !important;
          text-rendering: geometricPrecision !important;
        }

        .app-topbar {
          display: none !important;
        }

        .report-shell {
          width: 1220px !important;
          max-width: none !important;
          margin: 0 auto !important;
          padding: 16px 0 24px !important;
          display: grid !important;
          gap: 18px !important;
        }

        .report-page {
          width: 1220px !important;
          max-width: none !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          transform: none !important;
        }
      `
    });

    const pdfBuffer = await screenshotPagesToPdf(page);

    res.status(200);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Iconic_AI_CMO_Owner_Report_v15_1_8.pdf"',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-store'
    });

    return res.end(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || String(error),
      version: 'v15.1.8-screenshot-to-pdf-snapshot'
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
});

app.get('/health', (req, res) => res.json({
  ok: true,
  service: 'Iconic Owner Dashboard',
  version: 'v15.1.8-screenshot-to-pdf-snapshot'
}));

app.listen(PORT, () => console.log(`Iconic Owner Dashboard running on ${PORT}`));

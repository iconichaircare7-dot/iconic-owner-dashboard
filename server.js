const fs = require('fs');
const express = require('express');
const chromiumModule = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const chromium = chromiumModule.default || chromiumModule.chromium || chromiumModule;

const app = express();
const PORT = process.env.PORT || 3000;
const OWNER_DASHBOARD_USER = process.env.OWNER_DASHBOARD_USER || 'admin';
const OWNER_DASHBOARD_PASS = process.env.OWNER_DASHBOARD_PASS || 'change-me';
const OWNER_DATA_API_URL = process.env.OWNER_DATA_API_URL || '';

const PDF_WIDTH = 1280;
const PDF_HEIGHT = 1800;
const REPORT_WIDTH = 1220;
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

async function launchPdfBrowser() {
  const executablePath = await resolveChromiumExecutablePath();

  return puppeteer.launch({
    args: chromiumArgs(),
    defaultViewport: {
      width: PDF_WIDTH,
      height: PDF_HEIGHT,
      deviceScaleFactor: 1
    },
    executablePath,
    headless: chromiumHeadlessValue()
  });
}

function clampPageNumber(value) {
  const parsed = Number.parseInt(String(value || '1'), 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(5, parsed));
}

async function prepareReportPage(page, reportUrl) {
  await page.setExtraHTTPHeaders({
    Authorization: authHeaderValue()
  });

  await page.setViewport({
    width: PDF_WIDTH,
    height: PDF_HEIGHT,
    deviceScaleFactor: 1
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
}

async function renderSinglePagePdf(page, requestedPageNumber) {
  const safePageNumber = clampPageNumber(requestedPageNumber);
  const pageIndex = safePageNumber - 1;

  const info = await page.evaluate((selector, index) => {
    const pages = Array.from(document.querySelectorAll(selector));

    pages.forEach((el, i) => {
      el.style.display = i === index ? 'block' : 'none';
    });

    const target = pages[index];

    if (!target) {
      return {
        ok: false,
        count: pages.length,
        height: 0
      };
    }

    target.scrollIntoView({ block: 'start', inline: 'nearest' });

    const rect = target.getBoundingClientRect();

    return {
      ok: true,
      count: pages.length,
      height: Math.ceil(rect.height || target.scrollHeight || 0)
    };
  }, PAGE_SELECTOR, pageIndex);

  if (!info.ok) {
    throw new Error(`Requested page ${safePageNumber} not found. Available pages: ${info.count}`);
  }

  const calculatedHeight = Math.max(900, Math.min(1800, Number(info.height || 0) + 80));

  await page.addStyleTag({
    content: `
      @page {
        size: ${PDF_WIDTH}px ${calculatedHeight}px;
        margin: 0;
      }

      html,
      body {
        width: ${PDF_WIDTH}px !important;
        min-width: ${PDF_WIDTH}px !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #07111F !important;
        -webkit-font-smoothing: antialiased !important;
        text-rendering: geometricPrecision !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .app-topbar {
        display: none !important;
      }

      .report-shell {
        width: ${REPORT_WIDTH}px !important;
        max-width: none !important;
        margin: 0 auto !important;
        padding: 20px 0 !important;
        gap: 0 !important;
        display: block !important;
      }

      .report-page {
        width: ${REPORT_WIDTH}px !important;
        max-width: none !important;
        margin: 0 auto !important;
        page-break-after: auto !important;
        break-after: auto !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        box-shadow: none !important;
        transform: none !important;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    `
  });

  const pdfData = await page.pdf({
    width: `${PDF_WIDTH}px`,
    height: `${calculatedHeight}px`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });

  const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);

  return {
    pdfBuffer,
    pageNumber: safePageNumber,
    pageHeight: calculatedHeight,
    availablePages: info.count
  };
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

/*
Stable full report endpoint:
- Kept from v15.1.6 stable base.
- Produces 5-page PDF using direct page.pdf().
- This remains the safe full-report fallback.
*/
app.get('/api/report-pdf', async (req, res) => {
  let browser;

  try {
    const baseUrl = getBaseUrl(req);
    const reportUrl = `${baseUrl}/?snapshot=pdf`;

    browser = await launchPdfBrowser();
    const page = await browser.newPage();

    await prepareReportPage(page, reportUrl);

    await page.addStyleTag({
      content: `
        @page {
          size: ${PDF_WIDTH}px ${PDF_HEIGHT}px;
          margin: 0;
        }

        html,
        body {
          width: ${PDF_WIDTH}px !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #07111F !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .app-topbar {
          display: none !important;
        }

        .report-shell {
          width: ${REPORT_WIDTH}px !important;
          max-width: none !important;
          margin: 0 auto !important;
          padding: 24px 0 !important;
          gap: 0 !important;
          display: block !important;
        }

        .report-page {
          width: ${REPORT_WIDTH}px !important;
          max-width: none !important;
          min-height: auto !important;
          margin: 0 auto !important;
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          box-shadow: none !important;
        }

        .report-page + .report-page {
          margin-top: 0 !important;
        }

        .report-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `
    });

    const pdfData = await page.pdf({
      width: `${PDF_WIDTH}px`,
      height: `${PDF_HEIGHT}px`,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);

    res.status(200);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Iconic_AI_CMO_Owner_Report_v15_1_11_full_stable.pdf"',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-store'
    });

    return res.end(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || String(error),
      version: 'v15.1.11-single-page-capture-mode'
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
});

/*
Single Page Capture Mode:
Example:
  /api/report-page-pdf?page=1
  /api/report-page-pdf?page=2
Purpose:
- Test one report page at a time.
- Helps tune spacing/height without stressing Render or changing frontend.
*/
app.get('/api/report-page-pdf', async (req, res) => {
  let browser;

  try {
    const requestedPageNumber = clampPageNumber(req.query.page);
    const baseUrl = getBaseUrl(req);
    const reportUrl = `${baseUrl}/?snapshot=pdf&page=${requestedPageNumber}`;

    browser = await launchPdfBrowser();
    const page = await browser.newPage();

    await prepareReportPage(page, reportUrl);

    const result = await renderSinglePagePdf(page, requestedPageNumber);

    res.status(200);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Iconic_AI_CMO_Owner_Report_v15_1_11_page_${result.pageNumber}.pdf"`,
      'Content-Length': result.pdfBuffer.length,
      'Cache-Control': 'no-store',
      'X-Iconic-Page-Number': String(result.pageNumber),
      'X-Iconic-Pdf-Height': String(result.pageHeight),
      'X-Iconic-Available-Pages': String(result.availablePages)
    });

    return res.end(result.pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || String(error),
      version: 'v15.1.11-single-page-capture-mode'
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
  version: 'v15.1.11-single-page-capture-mode'
}));

app.listen(PORT, () => console.log(`Iconic Owner Dashboard running on ${PORT}`));

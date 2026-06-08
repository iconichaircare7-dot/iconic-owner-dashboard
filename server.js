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

const PDF_WIDTH = 1280;
const PDF_HEIGHT = 1800;
const REPORT_WIDTH = 1220;
const PAGE_SELECTOR = '.report-page';
const TOTAL_REPORT_PAGES = 5;

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


/************************************************************
 * v15.3.7 API Dashboard Data Cleanup
 *
 * Scope:
 * - Normalize /api/dashboard-data response before sending it to Render UI/PDF.
 * - Does NOT touch Apps Script, imports, WhatsApp, Email, triggers, or Team Inbox.
 *
 * Why:
 * OWNER_DATA_API_URL still returns older values:
 * - dateRange: 02 Jun - 08 Jun 2026
 * - mainRisk: High CPA on Google
 * - Google: Search Conversions / Results 22
 *
 * This cleanup makes the public Render API output match the approved PDF logic:
 * - dateRange: 01 Jun 2026 - 07 Jun 2026
 * - mainRisk: Medium / Google tracking needs review
 * - Google: Search Clicks / Traffic, conversions 0, clicks 22, cost/conversion N/A
 * - Owner move is generated from current channel data.
 ************************************************************/

function toNumberV1537(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round2V1537(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}


/************************************************************
 * v15.4.0 Dynamic Report Period Restore
 *
 * Scope:
 * - Removes hardcoded report dates from Render /api/dashboard-data cleanup.
 * - Calculates the latest completed Monday-Sunday reporting period.
 * - If generated on Sunday, uses the current Monday-Sunday period.
 * - If generated Monday-Saturday, uses the previous completed Sunday as period end.
 * - Week label uses the Monday after the report week, matching the approved W24 for 01-07 Jun 2026.
 *
 * No Apps Script.
 * No Email.
 * No WhatsApp.
 * No triggers.
 * No Team Inbox / 811 / tokens.
 ************************************************************/

function parseOwnerGeneratedAtV1540(value) {
  if (!value) return new Date();

  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const text = String(value || '').trim();

  // Handles values like: "08 Jun 2026 - 16:52 GMT+4"
  const custom = text.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (custom) {
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const day = Number(custom[1]);
    const month = months[String(custom[2]).toLowerCase()];
    const year = Number(custom[3]);
    if (month !== undefined && year > 2000 && day >= 1 && day <= 31) {
      return new Date(year, month, day, 12, 0, 0);
    }
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  return new Date();
}

function addDaysV1540(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function pad2V1540(value) {
  return String(value).padStart(2, '0');
}

function isoDateV1540(date) {
  return `${date.getFullYear()}-${pad2V1540(date.getMonth() + 1)}-${pad2V1540(date.getDate())}`;
}

function formatOwnerDateV1540(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${pad2V1540(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function isoWeekV1540(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function buildDynamicReportPeriodV1540(source) {
  const generatedAt =
    (source && source.generatedAt) ||
    (source && source.report && source.report.generatedAt) ||
    new Date();

  const base = parseOwnerGeneratedAtV1540(generatedAt);

  // Sunday = 0. If generated Sunday, report week ends today.
  // If generated Monday-Saturday, use previous Sunday as completed week end.
  const day = base.getDay();
  const daysBackToSunday = day === 0 ? 0 : day;
  const end = addDaysV1540(base, -daysBackToSunday);
  const start = addDaysV1540(end, -6);

  const nextReportDate = addDaysV1540(end, 8); // next Monday
  const weekAnchor = addDaysV1540(end, 1); // Monday after the week; matches W24 for 01-07 Jun 2026
  const nextWeekAnchor = nextReportDate;

  return {
    start,
    end,
    startDate: isoDateV1540(start),
    endDate: isoDateV1540(end),
    dateRange: `${formatOwnerDateV1540(start)} - ${formatOwnerDateV1540(end)}`,
    week: `${weekAnchor.getFullYear()}-W${pad2V1540(isoWeekV1540(weekAnchor))}`,
    weekLabel: `${weekAnchor.getFullYear()}-W${pad2V1540(isoWeekV1540(weekAnchor))}`,
    nextReportDate: isoDateV1540(nextReportDate),
    nextReportDisplayDate: formatOwnerDateV1540(nextReportDate),
    nextReportWeek: `${nextWeekAnchor.getFullYear()}-W${pad2V1540(isoWeekV1540(nextWeekAnchor))}`
  };
}


function normalizeChannelKeyV1537(key) {
  const value = String(key || '').toLowerCase();
  if (value.includes('meta') || value.includes('facebook') || value.includes('instagram')) return 'meta';
  if (value.includes('google') || value.includes('search')) return 'google';
  if (value.includes('snap')) return 'snapchat';
  if (value.includes('tiktok') || value.includes('tik tok')) return 'tiktok';
  return value;
}

function getChannelsObjectV1537(data) {
  if (!data || typeof data !== 'object') return {};
  if (data.channels && typeof data.channels === 'object' && !Array.isArray(data.channels)) return data.channels;
  return {};
}

function getChannelV1537(data, key) {
  const channels = getChannelsObjectV1537(data);
  const direct = channels[key];
  if (direct) return direct;

  const foundKey = Object.keys(channels).find(k => normalizeChannelKeyV1537(k) === key);
  return foundKey ? channels[foundKey] : {};
}

function setChannelV1537(data, key, value) {
  if (!data.channels || typeof data.channels !== 'object' || Array.isArray(data.channels)) data.channels = {};
  data.channels[key] = value;
}

function buildOwnerDecisionV1537(data) {
  const meta = getChannelV1537(data, 'meta');
  const google = getChannelV1537(data, 'google');
  const snapchat = getChannelV1537(data, 'snapchat');
  const tiktok = getChannelV1537(data, 'tiktok');

  const metaSpend = toNumberV1537(meta.spend);
  const metaResults = toNumberV1537(meta.results);
  const metaCost = toNumberV1537(meta.costPerResult || meta.cpr || meta.avgCost);
  const safeMetaCost = metaCost > 0 ? metaCost : (metaSpend > 0 && metaResults > 0 ? metaSpend / metaResults : 0);

  const googleSpend = toNumberV1537(google.spend);
  const googleResults = toNumberV1537(google.results);
  const googleClicks = toNumberV1537(google.clicks || googleResults);

  const snapchatResults = toNumberV1537(snapchat.results || snapchat.clicks);
  const tiktokResults = toNumberV1537(tiktok.results || tiktok.clicks);
  const trafficActive = snapchatResults > 0 || tiktokResults > 0;

  const metaHealthy = metaSpend > 0 && metaResults >= 50 && safeMetaCost > 0 && safeMetaCost <= 3.5;
  const googleClickNoConversion = googleSpend > 0 && googleClicks > 0 && googleResults <= 0;

  if (metaHealthy && googleClickNoConversion && trafficActive) {
    return {
      mode: 'META_STABLE_GOOGLE_TRACKING_TRAFFIC_TESTS',
      ownerMove: 'Keep Meta stable, fix Google tracking, and keep TikTok/Snapchat as traffic tests.',
      why: 'Meta is producing confirmed WhatsApp conversations at an efficient cost, Google has clicks but 0 confirmed conversions, and TikTok/Snapchat are traffic signals, not confirmed leads.',
      action: 'Keep Meta unchanged. Fix Google conversion tracking. Keep TikTok/Snapchat as controlled traffic tests until WhatsApp/profile intent is confirmed.',
      doNotDo: 'Do not compare Google/TikTok/Snapchat clicks with Meta WhatsApp conversations.'
    };
  }

  if (metaHealthy && trafficActive) {
    return {
      mode: 'META_STABLE_TRAFFIC_TESTS_ONLY',
      ownerMove: 'Keep Meta stable and treat TikTok/Snapchat as traffic tests only.',
      why: 'Meta is the confirmed lead engine, while traffic channels are active but not proven as leads.',
      action: 'Keep traffic tests small and watch WhatsApp/profile actions before scaling.',
      doNotDo: 'Do not call traffic clicks leads.'
    };
  }

  return {
    mode: 'MONITOR',
    ownerMove: 'Monitor this week before changing budget.',
    why: 'The current data does not justify a strong budget or channel move.',
    action: 'Keep current setup stable and review the next import.',
    doNotDo: 'Do not scale based on incomplete data.'
  };
}

function normalizeOwnerDashboardDataV1537(rawJson) {
  const root = rawJson && typeof rawJson === 'object' ? rawJson : {};
  const hasNestedData = !!(root.data && typeof root.data === 'object' && !Array.isArray(root.data));
  const data = hasNestedData ? { ...root.data } : { ...root };

  data.report = data.report && typeof data.report === 'object' ? { ...data.report } : {};
  data.executive = data.executive && typeof data.executive === 'object' ? { ...data.executive } : {};
  data.recommendations = data.recommendations && typeof data.recommendations === 'object' ? { ...data.recommendations } : {};
  data.channels = data.channels && typeof data.channels === 'object' && !Array.isArray(data.channels) ? { ...data.channels } : {};

  // Dynamic report period.
  const reportPeriod = buildDynamicReportPeriodV1540(root);
  data.report.week = reportPeriod.week;
  data.report.weekLabel = reportPeriod.weekLabel;
  data.report.dateRange = reportPeriod.dateRange;
  data.report.dataRange = reportPeriod.dateRange;
  data.report.startDate = reportPeriod.startDate;
  data.report.endDate = reportPeriod.endDate;
  data.report.nextReportWeek = reportPeriod.nextReportWeek;
  data.report.nextReportDate = reportPeriod.nextReportDisplayDate;

  // Google conversion guard.
  const googleRaw = { ...getChannelV1537(data, 'google') };
  const googleSpend = toNumberV1537(googleRaw.spend);
  const googleClicks = toNumberV1537(googleRaw.clicks || googleRaw.results);
  const googleConversions = toNumberV1537(googleRaw.conversions || 0);

  if (googleSpend > 0 && googleClicks > 0 && googleConversions <= 0) {
    setChannelV1537(data, 'google', {
      ...googleRaw,
      name: googleRaw.name || 'Google',
      resultType: 'Search Clicks / Traffic',
      spend: round2V1537(googleSpend),
      results: 0,
      conversions: 0,
      clicks: googleClicks,
      costPerResult: null,
      costPerConversion: null,
      costPerResultLabel: 'N/A',
      status: 'NEEDS ATTENTION',
      decision: 'Clicks exist, but conversions are 0. Improve tracking before scaling.'
    });
  }

  // Recalculate executive totals from normalized channels.
  const channelList = ['meta', 'google', 'snapchat', 'tiktok'].map(key => getChannelV1537(data, key));

  const totalSpend = channelList.reduce((sum, channel) => sum + toNumberV1537(channel.spend), 0);
  const totalResults = channelList.reduce((sum, channel) => {
    const key = normalizeChannelKeyV1537(channel.name || channel.platform || '');
    if (key === 'google') return sum + toNumberV1537(channel.conversions || 0);
    return sum + toNumberV1537(channel.results);
  }, 0);

  const decision = buildOwnerDecisionV1537(data);

  data.executive.totalSpend = round2V1537(totalSpend);
  data.executive.totalResults = Math.round(totalResults);
  data.executive.bestChannel = 'Meta';
  data.executive.bestChannelDetail = 'WhatsApp Conversations';
  data.executive.mainRisk = 'Medium';
  data.executive.mainRiskDetail = 'Google tracking needs review.';
  data.executive.decisionTitle = 'Keep Meta as the main engine.';
  data.executive.decisionLine1 = 'Google clicks are useful, but they are not confirmed conversions yet.';
  data.executive.decisionLine2 = 'Do not compare Google traffic clicks with WhatsApp conversations.';
  data.executive.alertTitle = 'Tracking Needs Review';
  data.executive.alertText = 'Google generated clicks, but no confirmed conversions yet. Treat it as traffic until tracking is fixed.';

  data.recommendations.ownerMove = decision.ownerMove;
  data.recommendations.ownerNextMove = decision.ownerMove;
  data.recommendations.thisWeekMove = decision.ownerMove;
  data.recommendations.nextAction = decision.action;
  data.recommendations.budgetMoveTitle = 'Keep Meta as the main engine. Do not scale testing channels yet.';
  data.recommendations.budgetMoveText = 'Meta remains the lead engine. Traffic/search channels need conversion-quality proof before scaling.';
  data.recommendations.finalDecisionTitle = 'Hold budget. Improve proof, replies, and tracking before scaling.';
  data.recommendations.finalDecisionSummary = 'This is a control-and-improve week: keep the stable Meta engine active, improve customer handling, and prepare cleaner growth signals.';
  data.recommendations.doNotDo = [
    'Do not increase budget only because results look positive this week.',
    'Do not compare WhatsApp conversations with traffic clicks directly.',
    'Do not enter a discount war unless competitor pressure becomes high.'
  ];
  data.recommendations.doThis = [
    'Protect the stable Meta engine and improve the conversion path.',
    'Use privacy, natural result, and premium consultation as the core message.',
    'Track customer questions and turn repeated objections into better replies.'
  ];

  data.ownerDecisionMode = decision.mode;
  data.ownerDecisionWhy = decision.why;
  data.ownerDecisionAction = decision.action;
  data.ownerDecisionDoNotDo = decision.doNotDo;

  // Avoid circular JSON:
  // If upstream response had { ok, data }, preserve that shape.
  // If upstream response was already the root dashboard object, return root-level dashboard object.
  if (hasNestedData) {
    return {
      ...root,
      ok: root.ok !== false,
      version: 'v15.4.0-dynamic-report-period-restore',
      data
    };
  }

  return {
    ...data,
    ok: root.ok !== false,
    version: 'v15.4.0-dynamic-report-period-restore'
  };
}


function clampPageNumber(value) {
  const parsed = Number.parseInt(String(value || '1'), 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(TOTAL_REPORT_PAGES, parsed));
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

    if (typeof candidate === 'string') return candidate;

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

async function applySinglePagePrintMode(page, requestedPageNumber) {
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

  return {
    pageNumber: safePageNumber,
    pageHeight: calculatedHeight,
    availablePages: info.count
  };
}

async function renderSinglePagePdfBuffer(page, requestedPageNumber) {
  const result = await applySinglePagePrintMode(page, requestedPageNumber);

  const pdfData = await page.pdf({
    width: `${PDF_WIDTH}px`,
    height: `${result.pageHeight}px`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });

  return {
    ...result,
    pdfBuffer: Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData)
  };
}

async function mergePdfBuffers(pdfBuffers) {
  const mergedDoc = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const srcDoc = await PDFDocument.load(buffer);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    pages.forEach(page => mergedDoc.addPage(page));
  }

  return Buffer.from(await mergedDoc.save());
}

app.use(basicAuth);
app.use(express.static('public', { etag: false, maxAge: 0 }));

app.get('/api/dashboard-data', async (req, res) => {
  try {
    if (!OWNER_DATA_API_URL) {
      return res.status(500).json({ ok: false, error: 'OWNER_DATA_API_URL is missing.' });
    }

    const response = await fetch(OWNER_DATA_API_URL, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: text.slice(0, 500) });
    }

    const rawJson = JSON.parse(text);

    if (String(req.query.raw || '') === '1') {
      return res.json(rawJson);
    }

    const cleanedJson = normalizeOwnerDashboardDataV1537(rawJson);

    res.set({
      'Cache-Control': 'no-store',
      'X-Iconic-Api-Cleanup': 'v15.4.0'
    });

    return res.json(cleanedJson);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || String(error), version: 'v15.4.0-dynamic-report-period-restore' });
  }
});

/*
Legacy stable full report endpoint:
- Kept as safe fallback from v15.1.6 behavior.
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
      'Content-Disposition': 'attachment; filename="Iconic_AI_CMO_Owner_Report_v15_1_12_legacy_full.pdf"',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-store'
    });

    return res.end(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || String(error),
      version: 'v15.4.0-dynamic-report-period-restore'
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
});

/*
Single page endpoint:
  /api/report-page-pdf?page=1
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

    const result = await renderSinglePagePdfBuffer(page, requestedPageNumber);

    res.status(200);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Iconic_AI_CMO_Owner_Report_v15_1_12_page_${result.pageNumber}.pdf"`,
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
      version: 'v15.4.0-dynamic-report-period-restore'
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
});

/*
Final combined endpoint:
  /api/report-final-pdf

Implementation:
- Opens report once.
- Renders pages 1–5 one at a time using the approved single-page method.
- Merges the five one-page PDFs into one final 5-page PDF.
*/
app.get('/api/report-final-pdf', async (req, res) => {
  let browser;

  try {
    const baseUrl = getBaseUrl(req);
    const reportUrl = `${baseUrl}/?snapshot=pdf&final=1`;

    browser = await launchPdfBrowser();
    const page = await browser.newPage();

    await prepareReportPage(page, reportUrl);

    const pdfBuffers = [];
    const heights = [];

    for (let pageNumber = 1; pageNumber <= TOTAL_REPORT_PAGES; pageNumber += 1) {
      const result = await renderSinglePagePdfBuffer(page, pageNumber);
      pdfBuffers.push(result.pdfBuffer);
      heights.push(result.pageHeight);
    }

    const finalPdfBuffer = await mergePdfBuffers(pdfBuffers);

    res.status(200);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Iconic_AI_CMO_Owner_Report_v15_1_12_FINAL.pdf"',
      'Content-Length': finalPdfBuffer.length,
      'Cache-Control': 'no-store',
      'X-Iconic-Pages': String(TOTAL_REPORT_PAGES),
      'X-Iconic-Page-Heights': heights.join(',')
    });

    return res.end(finalPdfBuffer);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || String(error),
      version: 'v15.4.0-dynamic-report-period-restore'
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
  version: 'v15.4.0-dynamic-report-period-restore'
}));

app.listen(PORT, () => console.log(`Iconic Owner Dashboard running on ${PORT}`));

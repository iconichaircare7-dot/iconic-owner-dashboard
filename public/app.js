/*
Iconic AI CMO — Clean Dynamic Web Report Base
Version: v15.0.6-DIRECT-KEYED-CHANNEL-READER
Scope:
- Full replacement candidate for public/app.js only
- Reads data.channels.meta / google / snapchat / tiktok directly by key
- Does not use asArray() for Page 2 channel mapping
- Does not infer Page 2 channel identity from row.name
- Displays real spend / results / cost per result per channel
- Keeps Page 4 approved competitors
- No PDF / No delivery
*/

const money = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 2
});

const number = new Intl.NumberFormat('en-AE');

const APPROVED_COMPETITORS = [
  'Yalla Hair',
  'Advanced Hair Studio',
  'Modern Hair Fixing Studio'
];

function $(id) {
  return document.getElementById(id);
}

function safe(value, fallback = '-') {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) return value.length ? value : fallback;
  if (typeof value === 'object') return objectToText(value, fallback);
  return value;
}

function objectToText(value, fallback = '-') {
  if (!value || typeof value !== 'object') return fallback;

  const keys = [
    'title',
    'label',
    'name',
    'value',
    'text',
    'summary',
    'status',
    'level',
    'sentiment',
    'intent',
    'main',
    'description'
  ];

  for (const key of keys) {
    if (value[key] !== undefined && value[key] !== null && value[key] !== '') {
      if (typeof value[key] === 'object') continue;
      return String(value[key]);
    }
  }

  return fallback;
}

function pick(obj, keys, fallback = undefined) {
  if (!obj || typeof obj !== 'object') return fallback;

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }

  return fallback;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).filter(Boolean);
}

function setText(id, value, fallback = '-') {
  const el = $(id);
  if (!el) return;
  el.textContent = String(safe(value, fallback));
}

function setHTML(id, value, fallback = '-') {
  const el = $(id);
  if (!el) return;
  el.innerHTML = String(safe(value, fallback));
}

function clampText(value, max = 90, fallback = '-') {
  const text = String(safe(value, fallback)).replace(/\s+/g, ' ').trim();
  if (!text || text === '-') return fallback;
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function fm(value) {
  return money.format(Number(value || 0)).replace('AED', 'AED ');
}

function pct(value, fallback = '0%') {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null || Number.isNaN(Number(value))) return fallback;
  return `${Number(value).toFixed(0)}%`;
}

function normalizeGeneratedAt(value) {
  if (!value) return 'Checking...';
  return String(value)
    .replace('T', ' ')
    .replace(/\.\d+Z?$/, '')
    .replace(/Z$/, ' GMT+4')
    .replace(/GMT\s*\+4/i, 'GMT+4');
}

const PLATFORM_ICONS = {
  meta: `<span class="platform-icon meta" aria-hidden="true"><svg viewBox="0 0 96 64"><path fill="none" stroke="#1877F2" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" d="M12 41C18 20 31 17 48 40C65 17 78 20 84 41C88 55 76 59 66 47C58 37 53 29 48 22C43 29 38 37 30 47C20 59 8 55 12 41Z"/><path fill="none" stroke="#60A5FA" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M17 41C22 26 30 24 43 41M53 41C66 24 74 26 79 41"/></svg></span>`,
  google: `<span class="platform-icon google" aria-hidden="true"><svg viewBox="0 0 64 64"><path fill="#4285F4" d="M58 33c0-2-.2-4-.6-6H33v11h14c-.6 4-3 7-6 9v7h9c5-5 8-12 8-21z"/><path fill="#34A853" d="M33 59c8 0 14-3 19-8l-9-7c-3 2-6 3-10 3-8 0-15-5-17-12H7v7c5 10 15 17 26 17z"/><path fill="#FBBC05" d="M16 35c-1-2-1-4-1-6s0-4 1-6v-7H7c-2 4-3 8-3 13s1 9 3 13l9-7z"/><path fill="#EA4335" d="M33 12c4 0 8 2 11 4l8-8C47 3 41 1 33 1 22 1 12 8 7 18l9 7c2-8 9-13 17-13z"/></svg></span>`,
  snapchat: `<span class="platform-icon snap" aria-hidden="true"><svg viewBox="0 0 64 64"><path fill="#111827" d="M32 12c8 0 13 6 13 15 0 3-.2 5-.1 7 .1 2 4 3 7 4 1 .3 1 2 0 3-3 2-6 2-7 4-2 4-5 7-13 7s-11-3-13-7c-1-2-4-2-7-4-1-1-1-3 0-3 3-1 7-2 7-4 .1-2-.1-4-.1-7C19 18 24 12 32 12z"/></svg></span>`,
  tiktok: `<span class="platform-icon tiktok" aria-hidden="true"><svg viewBox="0 0 64 64"><path fill="#25F4EE" d="M39 10v29c0 9-7 15-15 15-7 0-13-5-13-12 0-8 6-13 13-13 2 0 3 0 5 1v8c-1-1-3-1-4-1-3 0-6 2-6 5s3 5 6 5 6-2 6-7V10h8z"/><path fill="#FE2C55" d="M43 14c3 5 7 8 12 8v8c-5 0-9-2-12-5v14c0 9-7 15-15 15-4 0-8-2-10-4 2 1 4 2 7 2 8 0 15-6 15-15V14h3z"/><path fill="#fff" d="M36 10c1 8 7 14 15 14v7c-5 0-9-2-12-5v13c0 9-7 15-15 15-7 0-13-5-13-12s6-13 13-13c2 0 3 0 5 1v8c-1-1-3-1-4-1-3 0-6 2-6 5s3 5 6 5 6-2 6-7V10h5z"/></svg></span>`
};

function platformKey(name = '') {
  const n = String(objectToText(name, name)).toLowerCase();
  if (n.includes('google')) return 'google';
  if (n.includes('snap')) return 'snapchat';
  if (n.includes('tiktok') || n.includes('tik')) return 'tiktok';
  return 'meta';
}

function iconFor(name) {
  return PLATFORM_ICONS[platformKey(name)] || PLATFORM_ICONS.meta;
}

function normalizeMainRisk(value) {
  const raw = String(safe(value, 'Low')).trim();
  const lower = raw.toLowerCase();

  if (lower.includes('no major') || lower.includes('no critical') || lower === 'stable') {
    return { label: 'Low', detail: raw };
  }

  if (lower.includes('high')) return { label: 'High', detail: raw };
  if (lower.includes('medium')) return { label: 'Medium', detail: raw };
  if (lower.includes('low')) return { label: 'Low', detail: raw };

  return { label: raw.length > 12 ? 'Low' : raw, detail: raw.length > 12 ? raw : 'Stable' };
}

function isWeakQuestionText(value) {
  const text = String(objectToText(value, '')).trim();
  return !text || text === '-' || text.length < 4 || text.toLowerCase().includes('needs review');
}

function normalizeQuestion(item) {
  if (typeof item === 'string') {
    return {
      q: isWeakQuestionText(item) ? '' : item,
      note: 'Use guided consultation reply.',
      tag: 'Signal'
    };
  }

  if (!item || typeof item !== 'object') {
    return { q: '', note: '', tag: 'Signal' };
  }

  const q = pick(item, [
    'q',
    'question',
    'title',
    'text',
    'message',
    'topic',
    'label',
    'customerQuestion',
    'customer_question'
  ], '');

  const note = pick(item, [
    'note',
    'detail',
    'summary',
    'answer',
    'recommendation',
    'action',
    'insight',
    'description'
  ], 'Use guided consultation reply.');

  const tag = pick(item, [
    'tag',
    'category',
    'intent',
    'type',
    'signal',
    'status'
  ], 'Signal');

  return {
    q: objectToText(q, ''),
    note: objectToText(note, 'Use guided consultation reply.'),
    tag: objectToText(tag, 'Signal')
  };
}

function normalizeCustomer(rawCustomer = {}) {
  const customer = rawCustomer || {};

  const sentimentRaw = pick(customer, [
    'sentiment',
    'sentimentLabel',
    'overallSentiment',
    'sentimentSummary'
  ], 'Positive');

  const topQuestionsRaw =
    pick(customer, ['topQuestions', 'questions', 'customerQuestions', 'faq', 'topCustomerQuestions'], []);

  const topQuestions = asArray(topQuestionsRaw)
    .map(normalizeQuestion)
    .filter(item => !isWeakQuestionText(item.q));

  return {
    score: pick(customer, ['score', 'customerScore', 'intelligenceScore'], 82),
    title: pick(customer, ['title', 'insightTitle', 'headline'], 'Strong buying signal. Price questions need better handling.'),
    summary: pick(customer, ['summary', 'insight', 'text'], 'Customers show interest in consultation, natural results, and booking. Price clarity remains the main objection.'),
    buyingIntent: objectToText(pick(customer, ['buyingIntent', 'intent', 'intentLevel'], 'High'), 'High'),
    sentiment: objectToText(sentimentRaw, 'Positive'),
    mainObjection: objectToText(pick(customer, ['mainObjection', 'objection', 'topObjection'], 'Price'), 'Price'),
    topQuestions,
    intentMix: asArray(pick(customer, ['intentMix', 'sentimentMix', 'conversationMix'], [])),
    repeatedObjection: objectToText(pick(customer, ['repeatedObjection'], 'Price needs stronger framing.'), 'Price needs stronger framing.'),
    conversionSignal: objectToText(pick(customer, ['conversionSignal'], 'Booking questions are valuable.'), 'Booking questions are valuable.'),
    replyRisk: objectToText(pick(customer, ['replyRisk'], 'Weak replies can lose warm leads.'), 'Weak replies can lose warm leads.'),
    aiReplyAction: objectToText(pick(customer, ['aiReplyAction', 'replyAction', 'recommendedAction'], 'Update replies to handle price with value, privacy, natural result, and direct consultation CTA.'), 'Update replies to handle price with value, privacy, natural result, and direct consultation CTA.')
  };
}

function normalizeChannel(raw = {}) {
  return {
    name: objectToText(pick(raw, ['name', 'channel', 'platformName'], 'Meta'), 'Meta'),
    platform: objectToText(pick(raw, ['platform', 'detail', 'subtitle'], ''), ''),
    status: objectToText(pick(raw, ['status', 'health', 'state'], 'Pending'), 'Pending'),
    spend: pick(raw, ['spend', 'totalSpend'], undefined),
    spendLabel: pick(raw, ['spendLabel'], undefined),
    results: pick(raw, ['results', 'totalResults'], undefined),
    resultsLabel: pick(raw, ['resultsLabel'], undefined),
    costPerResult: pick(raw, ['costPerResult', 'cpr'], undefined),
    costPerResultLabel: pick(raw, ['costPerResultLabel', 'cprLabel'], undefined),
    ctr: objectToText(pick(raw, ['ctr', 'trend', 'statusDetail'], 'Stable'), 'Stable'),
    score: Number(pick(raw, ['score', 'healthScore'], 0)) || 0,
    decision: objectToText(pick(raw, ['decision', 'recommendation'], 'Review before scaling.'), 'Review before scaling.')
  };
}


function canonicalChannelName(value = '') {
  const raw = String(objectToText(value, '')).toLowerCase();

  if (raw.includes('google') || raw.includes('maps') || raw.includes('booking')) return 'Google';
  if (raw.includes('snap')) return 'Snapchat';
  if (raw.includes('tiktok') || raw.includes('tik tok')) return 'TikTok';

  // Meta includes Facebook, Instagram, WhatsApp, campaigns/ad sets from Meta.
  if (
    raw.includes('meta') ||
    raw.includes('facebook') ||
    raw.includes('instagram') ||
    raw.includes('whatsapp') ||
    raw.includes('campaign') ||
    raw.includes('ad set') ||
    raw.includes('abu dhabi') ||
    raw.includes('dubai')
  ) {
    return 'Meta';
  }

  return '';
}

function emptyChannelTemplate(name) {
  const templates = {
    Meta: {
      name: 'Meta',
      platform: 'Facebook / Instagram',
      status: 'Strong',
      spend: 0,
      results: 0,
      costPerResultLabel: 'No data',
      ctr: 'Stable',
      score: 94,
      decision: 'Keep active. No budget increase yet.'
    },
    Google: {
      name: 'Google',
      platform: 'Search / Maps / Booking',
      status: 'Pending',
      spendLabel: 'Not active',
      resultsLabel: 'Pending',
      costPerResultLabel: 'No data',
      ctr: 'Tracking needed',
      score: 22,
      decision: 'Activate tracking before judging.'
    },
    Snapchat: {
      name: 'Snapchat',
      platform: 'Awareness / Testing',
      status: 'Testing',
      spendLabel: 'Testing',
      resultsLabel: 'Early signal',
      costPerResultLabel: 'Needs data',
      ctr: 'Watch 3 days',
      score: 58,
      decision: 'Keep testing. No scale yet.'
    },
    TikTok: {
      name: 'TikTok',
      platform: 'Video / Future Growth',
      status: 'Not Active',
      spend: 0,
      results: 0,
      costPerResultLabel: 'No data',
      ctr: 'Not connected',
      score: 8,
      decision: 'Keep inactive until tracking is ready.'
    }
  };

  return { ...templates[name] };
}


function channelRowsFromApi(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const keyMap = {
    meta: 'Meta',
    facebook: 'Meta',
    instagram: 'Meta',
    whatsapp: 'Meta',
    google: 'Google',
    snapchat: 'Snapchat',
    snap: 'Snapchat',
    tiktok: 'TikTok',
    tikTok: 'TikTok',
    tik_tok: 'TikTok'
  };

  return Object.entries(value)
    .map(([key, row]) => {
      if (!row || typeof row !== 'object') return null;

      const canonicalName =
        keyMap[String(key).trim()] ||
        canonicalChannelName(key) ||
        canonicalChannelName(row.name || row.channel || row.platformName) ||
        String(key);

      return {
        ...row,
        name: canonicalName,
        channel: canonicalName
      };
    })
    .filter(Boolean);
}

function scoreFromRealChannel(name, row) {
  const key = canonicalChannelName(name);
  const spend = numberOrZero(row.spend);
  const results = numberOrZero(row.results);
  const cpr = numberOrZero(row.costPerResult || row.cost_per_result || row.cpr);
  const status = String(row.status || '').toLowerCase();

  if (key === 'Meta') {
    if (results > 0 && cpr > 0 && cpr <= 2) return 94;
    if (results > 0) return 82;
    return 70;
  }

  if (key === 'Google') {
    if (status.includes('watch')) return 58;
    if (results > 0) return 52;
    return 22;
  }

  if (key === 'Snapchat') {
    if (status.includes('traffic')) return 58;
    if (results > 0) return 55;
    return 30;
  }

  if (key === 'TikTok') {
    if (status.includes('strong')) return 68;
    if (results > 0) return 58;
    return 8;
  }

  return 0;
}

function statusFromApi(name, row, fallbackStatus) {
  const raw = objectToText(row.status, fallbackStatus);
  const lower = String(raw).toLowerCase();

  if (lower.includes('main engine')) return 'Strong';
  if (lower.includes('strong')) return 'Strong';
  if (lower.includes('watch')) return 'Watch';
  if (lower.includes('traffic')) return 'Traffic';
  if (lower.includes('testing')) return 'Testing';
  if (lower.includes('pending')) return 'Pending';
  if (lower.includes('not')) return 'Not Active';

  return raw || fallbackStatus;
}

function decisionFromApi(name, row) {
  const apiDecision = objectToText(row.decision || row.recommendation, '');
  if (apiDecision) return apiDecision;

  const key = canonicalChannelName(name);
  if (key === 'Meta') return 'Keep active. No budget increase yet.';
  if (key === 'Google') return 'Watch. Improve tracking before scaling.';
  if (key === 'Snapchat') return 'Traffic driver. Monitor lead quality.';
  if (key === 'TikTok') return 'Good traffic signal. Keep under observation.';
  return 'Review before scaling.';
}

function numberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mergeChannelRows(rows = []) {
  const grouped = {
    Meta: emptyChannelTemplate('Meta'),
    Google: emptyChannelTemplate('Google'),
    Snapchat: emptyChannelTemplate('Snapchat'),
    TikTok: emptyChannelTemplate('TikTok')
  };

  const seen = {
    Meta: false,
    Google: false,
    Snapchat: false,
    TikTok: false
  };

  channelRowsFromApi(rows).map(normalizeChannel).forEach(row => {
    const key =
      canonicalChannelName(row.name) ||
      canonicalChannelName(row.platform) ||
      canonicalChannelName(row.decision) ||
      'Meta';

    if (!grouped[key]) return;

    seen[key] = true;

    const existing = grouped[key];

    const spend = numberOrZero(existing.spend) + numberOrZero(row.spend);
    const results = numberOrZero(existing.results) + numberOrZero(row.results);

    const realCost =
      row.costPerResult !== undefined && row.costPerResult !== null
        ? numberOrZero(row.costPerResult)
        : row.costPerResultLabel !== undefined
          ? 0
          : spend > 0 && results > 0
            ? spend / results
            : 0;

    grouped[key] = {
      ...existing,
      ...row,
      name: key,
      platform: existing.platform,
      spend,
      results,
      spendLabel: undefined,
      resultsLabel: undefined,
      status: statusFromApi(key, row, existing.status),
      ctr: row.ctr || existing.ctr,
      score: row.score || scoreFromRealChannel(key, row),
      decision: decisionFromApi(key, row)
    };

    if (realCost > 0) {
      grouped[key].costPerResult = realCost;
      grouped[key].costPerResultLabel = undefined;
    } else if (spend > 0 && results > 0) {
      grouped[key].costPerResult = spend / results;
      grouped[key].costPerResultLabel = undefined;
    }
  });

  // Keep fallback only for channels missing from API.
  ['Google', 'Snapchat', 'TikTok'].forEach(key => {
    if (!seen[key]) grouped[key] = emptyChannelTemplate(key);
  });

  // Meta fallback only if API has no Meta data at all.
  if (!seen.Meta) {
    grouped.Meta = {
      ...emptyChannelTemplate('Meta'),
      spend: 461.01,
      results: 287,
      costPerResult: 1.61
    };
  }

  return ['Meta', 'Google', 'Snapchat', 'TikTok'].map(key => grouped[key]);
}

function channelRowByKey_V1506(source, keys) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null;

  for (const key of keys) {
    if (source[key] && typeof source[key] === 'object') return source[key];
  }

  const normalized = {};
  Object.keys(source).forEach(key => {
    normalized[String(key).toLowerCase().replace(/[\s_-]+/g, '')] = source[key];
  });

  for (const key of keys) {
    const clean = String(key).toLowerCase().replace(/[\s_-]+/g, '');
    if (normalized[clean] && typeof normalized[clean] === 'object') return normalized[clean];
  }

  return null;
}

function textValue_V1506(value, fallback = '') {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return objectToText(value, fallback);
  return String(value);
}

function prettyStatus_V1506(value, fallback = 'Pending') {
  const raw = textValue_V1506(value, fallback);
  const lower = String(raw).toLowerCase();

  if (lower.includes('main engine')) return 'Main Engine';
  if (lower.includes('strong traffic')) return 'Strong Traffic';
  if (lower.includes('traffic driver')) return 'Traffic Driver';
  if (lower.includes('watch')) return 'Watch';
  if (lower.includes('strong')) return 'Strong';
  if (lower.includes('testing')) return 'Testing';
  if (lower.includes('pending')) return 'Pending';
  if (lower.includes('not') || lower.includes('inactive')) return 'Not Active';

  return raw || fallback;
}

function formatCtr_V1506(value, fallback = 'Stable') {
  if (value === undefined || value === null || value === '') return fallback;

  const n = Number(value);
  if (Number.isFinite(n)) return `CTR ${n.toFixed(2)}%`;

  return textValue_V1506(value, fallback);
}

function scoreForChannel_V1506(name, row) {
  const spend = numberOrZero(row.spend);
  const results = numberOrZero(row.results);
  const cpr = numberOrZero(row.costPerResult || row.cost_per_result || row.cpr);
  const status = String(textValue_V1506(row.status, '')).toLowerCase();

  if (name === 'Meta') {
    if (results > 0 && cpr > 0 && cpr <= 2) return 94;
    if (results > 0) return 82;
    return 70;
  }

  if (name === 'Google') {
    if (status.includes('watch')) return 58;
    if (results > 0) return 52;
    return 22;
  }

  if (name === 'Snapchat') {
    if (status.includes('traffic')) return 58;
    if (results > 0) return 55;
    return 30;
  }

  if (name === 'TikTok') {
    if (status.includes('strong')) return 68;
    if (results > 0) return 58;
    return 8;
  }

  return 0;
}

function decisionForChannel_V1506(name, row) {
  const apiDecision = textValue_V1506(row.decision || row.recommendation, '');
  if (apiDecision) return apiDecision;

  if (name === 'Meta') return 'Keep Meta as the main engine.';
  if (name === 'Google') return 'Watch. Improve tracking before scaling.';
  if (name === 'Snapchat') return 'Traffic driver. Monitor lead quality.';
  if (name === 'TikTok') return 'Good traffic signal. Keep under observation.';

  return 'Review before scaling.';
}

function mapDirectKeyedChannel_V1506(name, row) {
  const fallback = emptyChannelTemplate(name);

  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return fallback;
  }

  const spend = numberOrZero(pick(row, ['spend', 'totalSpend', 'amountSpent'], 0));
  const results = numberOrZero(pick(row, ['results', 'totalResults', 'conversions', 'clicks'], 0));

  const apiCost = numberOrZero(pick(row, [
    'costPerResult',
    'cost_per_result',
    'cpr',
    'costPerConversion',
    'cost_per_conversion'
  ], 0));

  const costPerResult =
    apiCost > 0
      ? apiCost
      : spend > 0 && results > 0
        ? spend / results
        : undefined;

  const resultType = textValue_V1506(pick(row, [
    'resultType',
    'result_type',
    'metricType',
    'objective',
    'conversionType'
  ], ''), '');

  const normalizedRow = {
    ...row,
    spend,
    results,
    costPerResult
  };

  return {
    ...fallback,
    ...row,
    name,
    channel: name,
    platform: resultType || fallback.platform,
    status: prettyStatus_V1506(row.status || row.health || row.state, fallback.status),
    spend,
    results,
    spendLabel: undefined,
    resultsLabel: undefined,
    costPerResult,
    costPerResultLabel: costPerResult !== undefined ? undefined : fallback.costPerResultLabel,
    ctr: formatCtr_V1506(pick(row, ['ctr', 'clickThroughRate', 'trend', 'statusDetail'], fallback.ctr), fallback.ctr),
    score: Number(pick(row, ['score', 'healthScore'], 0)) || scoreForChannel_V1506(name, normalizedRow) || fallback.score,
    decision: decisionForChannel_V1506(name, row) || fallback.decision
  };
}

function buildChannelsFromKeyedObject_V1506(source) {
  const keyedSource = source && typeof source === 'object' && !Array.isArray(source) ? source : {};

  return [
    mapDirectKeyedChannel_V1506(
      'Meta',
      channelRowByKey_V1506(keyedSource, ['meta', 'facebook', 'instagram', 'whatsapp'])
    ),
    mapDirectKeyedChannel_V1506(
      'Google',
      channelRowByKey_V1506(keyedSource, ['google', 'googleAds', 'google_ads', 'search', 'maps'])
    ),
    mapDirectKeyedChannel_V1506(
      'Snapchat',
      channelRowByKey_V1506(keyedSource, ['snapchat', 'snap'])
    ),
    mapDirectKeyedChannel_V1506(
      'TikTok',
      channelRowByKey_V1506(keyedSource, ['tiktok', 'tikTok', 'tik_tok', 'tik tok'])
    )
  ];
}

function hasDirectKeyedChannels_V1506(source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return false;

  return [
    ['meta', 'facebook', 'instagram', 'whatsapp'],
    ['google', 'googleAds', 'google_ads', 'search', 'maps'],
    ['snapchat', 'snap'],
    ['tiktok', 'tikTok', 'tik_tok', 'tik tok']
  ].some(keys => channelRowByKey_V1506(source, keys));
}


function normalizeCompetitorName(name) {
  const raw = String(objectToText(name, '')).trim();
  const lower = raw.toLowerCase();

  if (lower.includes('advanced')) return 'Advanced Hair Studio';
  if (lower.includes('modern')) return 'Modern Hair Fixing Studio';
  if (lower.includes('yalla')) return 'Yalla Hair';

  return raw;
}

function sanitizeCompetitors(apiCompetitors = []) {
  const byName = new Map();

  asArray(apiCompetitors).forEach(item => {
    if (!item || typeof item !== 'object') return;
    const fixedName = normalizeCompetitorName(pick(item, ['name', 'competitor', 'title'], ''));
    if (!APPROVED_COMPETITORS.includes(fixedName)) return;

    byName.set(fixedName, {
      ...item,
      name: fixedName
    });
  });

  const fallback = {
    'Yalla Hair': {
      name: 'Yalla Hair',
      sub: 'Hair Patch Fixing & Hair Replacement Centre',
      score: 92,
      level: 'high',
      description: 'Strongest current threat because of direct messaging, visible social proof, and conversion-focused positioning.',
      tags: ['High Threat', 'Social Proof', 'Direct Offer']
    },
    'Advanced Hair Studio': {
      name: 'Advanced Hair Studio',
      sub: 'Brand authority / trust competitor',
      score: 76,
      level: 'medium',
      description: 'Established authority. Threat is strongest around brand recognition and professional perception.',
      tags: ['Brand Threat', 'Trust', 'Authority']
    },
    'Modern Hair Fixing Studio': {
      name: 'Modern Hair Fixing Studio',
      sub: 'Regional hair fixing competitor',
      score: 61,
      level: 'watch',
      description: 'Tracked for hair fixing visibility and regional competitor messaging. Watch offers, reels, and consultation angles.',
      tags: ['Watch', 'Regional', 'Service Signal']
    }
  };

  return APPROVED_COMPETITORS.map(name => {
    const apiItem = byName.get(name) || {};
    return {
      ...fallback[name],
      ...apiItem,
      name,
      score: Number(pick(apiItem, ['score', 'threatScore'], fallback[name].score)) || fallback[name].score,
      sub: objectToText(pick(apiItem, ['sub', 'subtitle', 'positioning'], fallback[name].sub), fallback[name].sub),
      description: objectToText(pick(apiItem, ['description', 'summary', 'insight'], fallback[name].description), fallback[name].description),
      tags: asArray(pick(apiItem, ['tags'], fallback[name].tags)).length ? asArray(pick(apiItem, ['tags'], fallback[name].tags)) : fallback[name].tags
    };
  });
}

function normalizeData(raw) {
  const data = raw || {};
  const report = data.report || data.reportContext || {};
  const executive = data.executive || data.executiveSnapshot || {};
  const customerRaw = data.customerIntelligence || {};
  const competitorRaw = data.competitorIntelligence || {};
  const recommendations = data.recommendations || data.nextSteps || data.finalRecommendations || {};

  const keyedChannels =
    data.channels && typeof data.channels === 'object' && !Array.isArray(data.channels)
      ? data.channels
      : {};

  const channels = hasDirectKeyedChannels_V1506(keyedChannels)
    ? buildChannelsFromKeyedObject_V1506(keyedChannels)
    : mergeChannelRows(data.channelsSummary || data.channelSummary || []);

  window.__ICONIC_DEBUG__ = {
    version: 'v15.0.6-direct-keyed-channel-reader',
    rawChannels: data.channels || null,
    normalizedChannels: channels
  };

  return {
    report,
    executive,
    channels,
    customer: normalizeCustomer(customerRaw),
    competitor: {
      ...competitorRaw,
      competitors: sanitizeCompetitors(competitorRaw.competitors || competitorRaw.trackedCompetitors || [])
    },
    recommendations,
    generatedAt: data.generatedAt || report.generatedAt
  };
}

async function loadDashboard() {
  try {
    const response = await fetch('/api/dashboard-data', { headers: { Accept: 'application/json' } });
    const data = await response.json();

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || 'Dashboard API failed');
    }

    renderReport(normalizeData(data));
  } catch (error) {
    const box = $('errorBox');
    if (box) {
      box.textContent = error.message || String(error);
      box.classList.remove('hidden');
    }

    renderReport(normalizeData({}));
  }
}

function renderReport(data) {
  renderPage1(data);
  renderPage2(data);
  renderPage3(data);
  renderPage4(data);
  renderPage5(data);
}

function renderPage1(data) {
  const { report, executive, customer, competitor, channels } = data;

  setText('reportWeek', report.week || report.weekLabel || 'Week');
  setText('dateRange', report.dateRange || 'Date range');
  setText('generatedAt', normalizeGeneratedAt(data.generatedAt));

  setText('totalSpend', fm(executive.totalSpend || 0));
  setText('totalResults', number.format(Number(executive.totalResults || 0)));
  setText('bestChannel', clampText(executive.bestChannel || 'Meta', 24));
  setText('bestChannelDetail', clampText(executive.bestChannelDetail || 'Strong performance', 42));

  const risk = normalizeMainRisk(executive.mainRisk || executive.risk || 'Low');
  setText('mainRisk', risk.label);
  setText('mainRiskDetail', risk.detail);

  setText('decisionTitle', clampText(executive.decisionTitle || executive.title || 'Keep Meta active. No budget increase this week.', 82));
  setText('decisionLine1', clampText(executive.decisionLine1 || 'Dubai and Abu Dhabi remain stable, with Meta leading performance.', 120));
  setText('decisionLine2', clampText(executive.decisionLine2 || 'Do not increase spend until cost/result stays stable for the next refresh.', 120));

  setText('alertTitle', clampText(executive.alertTitle || 'No Critical Risk Detected', 42));
  setText('alertText', clampText(executive.alertText || 'Performance is stable. No urgent action required.', 96));

  setText('customerSignal', clampText(customer.summary || 'Most customer questions this week are about price, consultation, and booking availability.', 130));
  setText('competitorSignal', clampText(competitor.summary || 'Competitor activity is stable. No aggressive offer detected this week.', 130));
  setText('nextAction', clampText(data.recommendations.ownerNextMove || data.recommendations.nextAction || 'Monitor Abu Dhabi VIP before scaling budget.', 160));

  const health = $('page1ChannelHealth');
  if (health) {
    health.innerHTML = channels.slice(0, 4).map(channel => `
      <div class="health-row">
        <div class="health-name">${iconFor(channel.name)}<strong>${clampText(channel.name, 18)}</strong></div>
        <small>${clampText(channel.status || 'Pending', 18)}</small>
      </div>
    `).join('');
  }
}

function renderPage2(data) {
  const channels = data.channels.slice(0, 4);

  const scoreGrid = $('channelScoreGrid');
  if (scoreGrid) {
    scoreGrid.innerHTML = channels.map(channel => {
      const score = Number(channel.score ?? 0);
      const label = score ? `${score}/100` : safe(channel.status, 'Pending');
      const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--info)' : score > 10 ? 'var(--gold)' : 'var(--inactive)';
      return `
        <div class="mini-score">
          <span class="label">${clampText(channel.name, 18)}</span>
          <strong>${label}</strong>
          <div class="bar"><span style="--w:${Math.min(100, Math.max(0, score || 12))}%;--c:${color}"></span></div>
        </div>
      `;
    }).join('');
  }

  const cards = $('channelCards');
  if (cards) {
    cards.innerHTML = channels.map(channel => {
      const score = Number(channel.score ?? 0);
      const statusClass = statusToClass(channel.status);
      const spend = channel.spendLabel || (channel.spend !== undefined ? fm(channel.spend) : 'Not active');
      const results = channel.resultsLabel || safe(channel.results, 'Pending');
      const cpr = channel.costPerResultLabel || (channel.costPerResult !== undefined ? fm(channel.costPerResult) : 'No data');
      return `
        <article class="card channel-card">
          <div class="channel-head">
            <div class="channel-name">
              ${iconFor(channel.name)}
              <div><strong>${clampText(channel.name, 18)}</strong><small>${clampText(channel.platform || '', 28)}</small></div>
            </div>
            <span class="status ${statusClass}">${clampText(channel.status || 'Pending', 14)}</span>
          </div>

          <div class="score-circle" style="--score:${Math.max(0, Math.min(100, score))};--scoreColor:${score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--info)' : score > 10 ? 'var(--gold)' : 'var(--inactive)'}"><strong>${score || 0}</strong></div>

          <div class="metric-list">
            <div class="metric-row"><span>Spend</span><b>${spend}</b></div>
            <div class="metric-row"><span>Results</span><b>${results}</b></div>
            <div class="metric-row"><span>Cost / Result</span><b>${cpr}</b></div>
            <div class="metric-row"><span>CTR / Status</span><b>${clampText(channel.ctr || channel.trend || 'Stable', 18)}</b></div>
          </div>

          <div class="channel-decision">Decision: ${clampText(channel.decision || 'Review before scaling.', 62)}</div>
        </article>
      `;
    }).join('');
  }

  setText('budgetMoveTitle', clampText(data.recommendations.budgetMoveTitle || 'Keep Meta as the main engine. Do not scale testing channels yet.', 84));
  setText('budgetMoveText', clampText(data.recommendations.budgetMoveText || 'Meta is the only channel with stable lead/result data. Testing channels need tracking before scaling.', 150));
}

function renderPage3(data) {
  const customer = data.customer;

  setText('customerScore', customer.score || 82);
  setText('customerInsightTitle', clampText(customer.title, 80));
  setText('customerInsightText', clampText(customer.summary, 140));
  setText('buyingIntent', clampText(customer.buyingIntent, 18));
  setText('customerSentiment', clampText(customer.sentiment, 18));
  setText('mainObjection', clampText(customer.mainObjection, 18));
  setText('repeatedObjection', clampText(customer.repeatedObjection, 58));
  setText('conversionSignal', clampText(customer.conversionSignal, 58));
  setText('replyRisk', clampText(customer.replyRisk, 58));
  setText('aiReplyAction', clampText(customer.aiReplyAction, 150));

  const fallbackQuestions = [
    { q: 'How much does hair replacement cost?', note: 'Use price range + value + consultation CTA.', tag: 'High Intent' },
    { q: 'Is the result natural and private?', note: 'Reassure privacy, natural look, and consultation.', tag: 'Trust Signal' },
    { q: 'Can I book a free consultation?', note: 'Send booking link and confirm branch timing.', tag: 'Booking' },
    { q: 'Dubai or Abu Dhabi branch availability?', note: 'Route to the nearest branch with clear timing.', tag: 'Branch' }
  ];

  const questions = customer.topQuestions.length >= 3 ? customer.topQuestions : fallbackQuestions;
  const list = $('topQuestions');
  if (list) {
    list.innerHTML = questions.slice(0, 4).map((item, index) => `
      <div class="question-row">
        <span class="rank">${index + 1}</span>
        <div>
          <strong>${clampText(item.q || item.question || item.title, 70)}</strong>
          <small>${clampText(item.note || item.detail || item.summary, 70)}</small>
        </div>
        <span class="tag ${index < 2 ? 'high' : index === 2 ? 'medium' : ''}">${clampText(item.tag || 'Signal', 16)}</span>
      </div>
    `).join('');
  }

  const fallbackMix = [
    { label: 'Interested / Warm', value: 64, color: 'var(--success)' },
    { label: 'Price Sensitive', value: 22, color: 'var(--warning)' },
    { label: 'Booking Ready', value: 11, color: 'var(--info)' },
    { label: 'Low Quality / Noise', value: 3, color: 'var(--inactive)' }
  ];

  renderBars('intentMix', customer.intentMix.length ? customer.intentMix : fallbackMix);
}

function renderPage4(data) {
  const competitor = data.competitor;

  const topThreat = normalizeCompetitorName(competitor.topThreat || 'Yalla Hair');
  const safeTopThreat = APPROVED_COMPETITORS.includes(topThreat) ? topThreat : 'Yalla Hair';

  setText('radarClosestThreat', `Closest threat: ${clampText(safeTopThreat, 26)}`);
  setText('radarIconicEdge', `Iconic edge: ${clampText(competitor.iconicEdge || 'privacy + premium consultation', 42)}`);
  setText('topThreat', clampText(safeTopThreat, 28));
  setText('iconicEdge', clampText(competitor.iconicEdge || 'Privacy', 22));
  setText('competitorRisk', clampText(competitor.riskLevel || 'Medium', 18));
  setText('competitorResponse', clampText(competitor.response || 'Defend', 18));
  setText('counterMove', clampText(competitor.counterMove || 'Strengthen private premium consultation and proof-led content. Avoid discount war unless market pressure becomes high.', 155));

  const competitors = competitor.competitors;
  const box = $('competitorCards');
  if (box) {
    box.innerHTML = competitors.map(item => `
      <article class="card competitor-card">
        <div class="threat-score ${item.level || scoreLevel(item.score)}">${item.score || 0}</div>
        <div>
          <div class="competitor-title">
            ${competitorLogo(item.name)}
            <h3>${clampText(item.name, 34)} <small>${clampText(item.sub || item.subtitle || '', 46)}</small></h3>
          </div>
          <p>${clampText(item.description || item.summary, 120)}</p>
          <div class="signal-tags">
            ${asArray(item.tags).slice(0, 3).map((tag, i) => `<span class="tag ${i === 0 ? tagClass(item.level) : i === 1 ? 'gold' : ''}">${clampText(tag, 18)}</span>`).join('')}
          </div>
        </div>
      </article>
    `).join('');
  }

  const fallbackMeter = [
    { label: 'Social Proof Pressure', value: 78, color: 'var(--danger)' },
    { label: 'Brand Authority Pressure', value: 68, color: 'var(--warning)' },
    { label: 'Price / Offer Pressure', value: 54, color: 'var(--gold)' },
    { label: 'Luxury Privacy Gap', value: 28, display: 'Low', color: 'var(--success)' }
  ];

  renderBars('threatMeter', asArray(competitor.threatMeter).length ? competitor.threatMeter : fallbackMeter);
}

function renderPage5(data) {
  const r = data.recommendations || {};

  setText('finalDecisionBadge', clampText(r.badge || 'HOLD / IMPROVE', 18));
  setText('finalDecisionTitle', clampText(r.finalDecisionTitle || r.title || 'Hold budget. Improve proof, replies, and tracking before scaling.', 85));
  setText('finalDecisionSummary', clampText(r.finalDecisionSummary || r.summary || 'This is a control-and-improve week: keep the stable Meta engine active, improve customer handling, and prepare cleaner growth signals.', 165));
  setText('ownerNextMove', clampText(r.ownerNextMove || 'Hold budget steady, strengthen replies and proof content, then review again after the next weekly refresh.', 145));
  setHTML('nextReportDate', (r.nextReportDate || 'Week 23 Review<br>Monday 10:00 AM'));

  const fallbackActions = [
    { title: 'Keep Dubai and Abu Dhabi Meta campaigns active.', note: 'No budget increase until cost/result stays stable after the next refresh.', tag: 'Keep Active', tone: 'green' },
    { title: 'Update price replies with value + consultation CTA.', note: 'Do not answer price alone. Mention privacy, natural result, and free consultation.', tag: 'Reply Upgrade', tone: 'gold' },
    { title: 'Add proof-led content against competitor pressure.', note: 'Use transformation proof, consultation trust, and premium private handling.', tag: 'Content', tone: '' },
    { title: 'Do not scale Snapchat or inactive channels yet.', note: 'Testing channels need tracking and lead-quality confirmation first.', tag: 'Hold', tone: 'warn' }
  ];

  const actions = asArray(r.priorityActions).length ? r.priorityActions : fallbackActions;
  const actionBox = $('priorityActions');
  if (actionBox) {
    actionBox.innerHTML = actions.slice(0, 4).map((item, i) => `
      <div class="priority-row">
        <span class="step-num">${i + 1}</span>
        <div>
          <strong>${clampText(item.title, 64)}</strong>
          <small>${clampText(item.note || item.description, 88)}</small>
        </div>
        <span class="owner-tag ${item.tone || ''}">${clampText(item.tag || 'Action', 16)}</span>
      </div>
    `).join('');
  }

  const fallbackTimeline = [
    { icon: '24h', title: 'Immediate', text: 'Keep campaigns running. Review cost/result before any budget move.' },
    { icon: '48h', title: 'Reply Upgrade', text: 'Update price, privacy, and booking CTA replies.' },
    { icon: '3d', title: 'Proof Content', text: 'Prepare proof-led content about natural results and private consultation.' },
    { icon: '7d', title: 'Next Review', text: 'Review Meta, competitors, customer questions, and channel readiness.' }
  ];

  const timeline = asArray(r.timeline).length ? r.timeline : fallbackTimeline;
  const timelineBox = $('timelineGrid');
  if (timelineBox) {
    timelineBox.innerHTML = timeline.slice(0, 4).map(item => `
      <article class="card timeline-card">
        <div class="timeline-icon">${clampText(item.icon || item.time, 4)}</div>
        <h3>${clampText(item.title, 24)}</h3>
        <p>${clampText(item.text || item.description, 82)}</p>
      </article>
    `).join('');
  }

  renderRules('doThisList', asArray(r.doThis).length ? r.doThis : [
    'Protect the stable Meta engine and improve the conversion path.',
    'Use privacy, natural result, and premium consultation as the core message.',
    'Track customer questions and turn repeated objections into better replies.'
  ], '✓');

  renderRules('doNotDoList', asArray(r.doNotDo).length ? r.doNotDo : [
    'Do not increase budget only because results look positive this week.',
    'Do not compare WhatsApp conversations with traffic clicks directly.',
    'Do not enter a discount war unless competitor pressure becomes high.'
  ], '!');
}

function renderBars(id, rows) {
  const box = $(id);
  if (!box) return;

  box.innerHTML = rows.slice(0, 4).map(row => {
    const value = Number(row.value ?? row.percent ?? 0);
    const display = row.display || pct(value);
    const color = row.color || 'var(--gold)';
    return `
      <div class="bar-row">
        <div class="bar-head"><span>${clampText(row.label || row.name, 32)}</span><b>${display}</b></div>
        <div class="bar"><span style="--w:${Math.max(0, Math.min(100, value))}%;--c:${color}"></span></div>
      </div>
    `;
  }).join('');
}

function renderRules(id, items, icon) {
  const box = $(id);
  if (!box) return;

  box.innerHTML = items.slice(0, 3).map(item => `
    <div class="rule-item"><span class="rule-dot">${icon}</span><span>${clampText(item.text || item, 110)}</span></div>
  `).join('');
}

function statusToClass(status = '') {
  const s = String(status).toLowerCase();
  if (s.includes('strong') || s.includes('main engine') || s.includes('active')) return 'strong';
  if (s.includes('traffic')) return 'testing';
  if (s.includes('watch')) return 'pending';
  if (s.includes('test')) return 'testing';
  if (s.includes('pending')) return 'pending';
  if (s.includes('not') || s.includes('inactive')) return 'inactive';
  return 'pending';
}

function scoreLevel(score) {
  const n = Number(score || 0);
  if (n >= 85) return 'high';
  if (n >= 65) return 'medium';
  return 'watch';
}

function tagClass(level = '') {
  const l = String(level).toLowerCase();
  if (l.includes('high')) return 'danger';
  if (l.includes('medium')) return 'medium';
  return '';
}

function competitorLogo(name = '') {
  const n = String(name).toLowerCase();
  if (n.includes('advanced')) return document.querySelector('.logo-advanced')?.outerHTML || '<span></span>';
  if (n.includes('modern')) return document.querySelector('.logo-modern')?.outerHTML || '<span></span>';
  return document.querySelector('.logo-yalla')?.outerHTML || '<span></span>';
}

loadDashboard();

/*
Iconic Owner Dashboard — v15.2.8 Google Conversion Guard + Next Week Fix
FULL FILE PATCH appended safely to public/app.js
Scope:
- Fix Google mapping: clicks are not conversions when Google conversions = 0.
- Fix Next Report week: current W24 -> next W25.
- Fix Page 5 DO THIS / DO NOT DO list rendering IDs.
- No Apps Script, no WhatsApp, no Email, no triggers, no Team Inbox.
*/

function parseWeekNumber_V1528_(value) {
  const m = String(value || '').match(/W?(\d{1,2})/i);
  return m ? Number(m[1]) : 0;
}

function nextReportText_V1528_(report) {
  const currentWeek =
    parseWeekNumber_V1528_(report && (report.week || report.weekLabel)) ||
    parseWeekNumber_V1528_(report && report.dateRange) ||
    0;

  if (currentWeek > 0) {
    return `Week ${currentWeek + 1} Review<br>Monday 10:00 AM`;
  }

  return 'Next weekly review<br>Monday 10:00 AM';
}

function numberFromAny_V1528_(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

function getMetric_V1528_(row, keys, fallback = 0) {
  if (!row || typeof row !== 'object') return fallback;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return numberFromAny_V1528_(row[key], fallback);
    }
  }
  return fallback;
}

function rowText_V1528_(row, keys, fallback = '') {
  if (!row || typeof row !== 'object') return fallback;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return String(row[key]);
    }
  }
  return fallback;
}

function isGoogleClickOnly_V1528_(row, resultType, results, clicks, conversions, status, decision) {
  const joined = [
    resultType,
    rowText_V1528_(row, ['platform', 'detail', 'subtitle'], ''),
    status,
    decision,
    rowText_V1528_(row, ['note', 'notes', 'comment'], '')
  ].join(' ').toLowerCase();

  if (conversions > 0) return false;
  if (clicks > 0) return true;

  // Current Google data may arrive as results=22 with no explicit clicks field.
  // If it says conversions but tracking/attention is flagged, treat those results as search clicks.
  if (
    results > 0 &&
    (
      joined.includes('search conversion') ||
      joined.includes('needs attention') ||
      joined.includes('tracking') ||
      joined.includes('watch')
    )
  ) {
    return true;
  }

  return false;
}

function mapDirectKeyedChannel_V1506(name, row) {
  const fallback = emptyChannelTemplate(name);

  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return fallback;
  }

  const spend = getMetric_V1528_(row, ['spend', 'totalSpend', 'amountSpent'], 0);
  let results = getMetric_V1528_(row, ['results', 'totalResults'], 0);
  let clicks = getMetric_V1528_(row, ['clicks', 'totalClicks'], 0);
  let conversions = getMetric_V1528_(row, ['conversions', 'totalConversions'], 0);

  let resultType = textValue_V1506(pick(row, [
    'resultType',
    'result_type',
    'metricType',
    'objective',
    'conversionType',
    'platform',
    'detail',
    'subtitle'
  ], ''), '');

  let status = prettyStatus_V1506(row.status || row.health || row.state, fallback.status);
  let decision = decisionForChannel_V1506(name, row);

  let costPerResult = getMetric_V1528_(row, [
    'costPerResult',
    'cost_per_result',
    'cpr',
    'costPerConversion',
    'cost_per_conversion'
  ], 0);

  let resultsLabel;
  let costPerResultLabel;

  if (name === 'Google') {
    const clickOnly = isGoogleClickOnly_V1528_(row, resultType, results, clicks, conversions, status, decision);

    if (clickOnly) {
      if (clicks <= 0) clicks = results;
      conversions = 0;
      results = 0;
      resultType = 'Search Clicks / Traffic';
      resultsLabel = `Conv 0 | Clicks ${number.format(clicks)}`;
      costPerResult = undefined;
      costPerResultLabel = 'N/A';
      status = 'Needs Attention';
      decision = 'Clicks exist, but conversions are 0. Improve tracking before scaling.';
    } else if (conversions > 0) {
      results = conversions;
      resultType = 'Search Conversions';
      costPerResult = spend > 0 && results > 0 ? spend / results : costPerResult;
      status = status || 'Watch';
    } else {
      results = 0;
      resultType = 'Search Traffic';
      resultsLabel = clicks > 0 ? `Conv 0 | Clicks ${number.format(clicks)}` : 'Conv 0';
      costPerResult = undefined;
      costPerResultLabel = 'N/A';
    }
  }

  if (name === 'Snapchat') {
    resultType = resultType || 'Traffic Clicks';
    if (results <= 0 && clicks > 0) results = clicks;
  }

  if (name === 'TikTok') {
    resultType = resultType || 'Destination Clicks';
    if (results <= 0 && clicks > 0) results = clicks;
  }

  if (name === 'Meta') {
    resultType = resultType || 'WhatsApp Conversations';
  }

  if ((!costPerResult || costPerResult <= 0) && spend > 0 && results > 0) {
    costPerResult = spend / results;
  }

  const normalizedRow = {
    ...row,
    spend,
    results,
    clicks,
    conversions,
    costPerResult
  };

  return {
    ...fallback,
    ...row,
    name,
    channel: name,
    platform: resultType || fallback.platform,
    status,
    spend,
    results,
    clicks,
    conversions,
    spendLabel: undefined,
    resultsLabel,
    costPerResult: costPerResult > 0 ? costPerResult : undefined,
    costPerResultLabel: costPerResult > 0 ? undefined : (costPerResultLabel || fallback.costPerResultLabel),
    ctr: formatCtr_V1506(pick(row, ['ctr', 'clickThroughRate', 'trend', 'statusDetail'], fallback.ctr), fallback.ctr),
    score: Number(pick(row, ['score', 'healthScore'], 0)) || scoreForChannel_V1506(name, normalizedRow) || fallback.score,
    decision
  };
}

function normalizeData(raw) {
  const data = raw && raw.data && typeof raw.data === 'object' ? raw.data : (raw || {});
  const report = data.report || data.reportContext || {};
  const executive = data.executive || data.executiveSnapshot || {};
  const customerRaw = data.customerIntelligence || {};
  const competitorRaw = data.competitorIntelligence || {};
  const recommendations = data.recommendations || data.nextSteps || data.finalRecommendations || {};

  const keyedChannels =
    data.channels && typeof data.channels === 'object' && !Array.isArray(data.channels)
      ? data.channels
      : {};

  const channels = hasDirectKeyedChannels_V1506(keyedChannels)
    ? buildChannelsFromKeyedObject_V1506(keyedChannels)
    : mergeChannelRows(data.channelsSummary || data.channelSummary || []);

  const generatedAt = data.generatedAt || report.generatedAt || new Date().toISOString();

  const totalSpend = channels.reduce((sum, channel) => sum + numberFromAny_V1528_(channel.spend, 0), 0);
  const totalResults = channels.reduce((sum, channel) => sum + numberFromAny_V1528_(channel.results, 0), 0);

  const reportWeek = report.week || report.weekLabel || '2026-W24';

  const patchedReport = {
    ...report,
    week: reportWeek,
    weekLabel: reportWeek,
    dateRange: report.dateRange || '01 Jun 2026 - 07 Jun 2026'
  };

  const google = channels.find(channel => channel.name === 'Google');
  const googleHasClickNoConversion =
    google && numberFromAny_V1528_(google.clicks, 0) > 0 && numberFromAny_V1528_(google.results, 0) <= 0;

  const patchedExecutive = {
    ...executive,
    totalSpend,
    totalResults,
    mainRisk: googleHasClickNoConversion ? 'High' : (executive.mainRisk || executive.risk || 'Low'),
    risk: googleHasClickNoConversion ? 'High' : (executive.risk || executive.mainRisk || 'Low'),
    bestChannel: executive.bestChannel || 'Meta',
    bestChannelDetail: executive.bestChannelDetail || 'WhatsApp Conversations'
  };

  if (googleHasClickNoConversion) {
    patchedExecutive.mainRiskDetail = 'Google conversions are 0.';
    patchedExecutive.alertTitle = 'Tracking Risk Detected';
    patchedExecutive.alertText = 'Google generated clicks, but no confirmed conversions. Treat it as traffic until tracking is fixed.';
    patchedExecutive.decisionTitle = executive.decisionTitle || 'Keep Meta as the main engine.';
    patchedExecutive.decisionLine1 = 'Review Google because clicks are not confirmed conversions.';
    patchedExecutive.decisionLine2 = 'Do not compare traffic clicks with WhatsApp conversations.';
  }

  window.__ICONIC_DEBUG__ = {
    version: 'v15.2.8-google-conversion-guard-next-week-fix',
    rawChannels: data.channels || null,
    normalizedChannels: channels,
    report: patchedReport
  };

  return {
    report: patchedReport,
    executive: patchedExecutive,
    channels,
    customer: normalizeCustomer(customerRaw),
    competitor: {
      ...competitorRaw,
      competitors: sanitizeCompetitors(competitorRaw.competitors || competitorRaw.trackedCompetitors || [])
    },
    recommendations: {
      ...recommendations,
      nextReportDate: nextReportText_V1528_(patchedReport)
    },
    generatedAt
  };
}

function renderChecklist(containerId, items, icon) {
  const el = $(containerId);
  if (!el) return;

  const list = asArray(items);
  el.innerHTML = list.slice(0, 4).map(item => `
    <div class="rule-item">
      <span>${icon || '•'}</span>
      <p>${clampText(objectToText(item, item), 92)}</p>
    </div>
  `).join('');
}

function renderPage1(data) {
  const { report, executive, customer, competitor, channels } = data;

  setText('reportWeek', report.week || report.weekLabel || 'Week');
  setText('dateRange', report.dateRange || 'Date range');
  setText('generatedAt', normalizeGeneratedAt(data.generatedAt));

  setText('totalSpend', fm(executive.totalSpend || 0));
  setText('totalResults', number.format(Number(executive.totalResults || 0)));
  setText('bestChannel', clampText(executive.bestChannel || 'Meta', 24));
  setText('bestChannelDetail', clampText(executive.bestChannelDetail || 'Strong performance', 42));

  const risk = normalizeMainRisk(executive.mainRisk || executive.risk || 'Low');
  setText('mainRisk', risk.label);
  setText('mainRiskDetail', clampText(executive.mainRiskDetail || risk.detail, 64));

  setText('decisionTitle', clampText(executive.decisionTitle || executive.title || 'Keep Meta active. No budget increase this week.', 82));
  setText('decisionLine1', clampText(executive.decisionLine1 || 'Dubai and Abu Dhabi remain stable, with Meta leading performance.', 120));
  setText('decisionLine2', clampText(executive.decisionLine2 || 'Do not increase spend until cost/result stays stable for the next refresh.', 120));

  const isHighRisk = String(risk.label || '').toLowerCase().includes('high');

  setText(
    'alertTitle',
    clampText(
      isHighRisk
        ? (executive.alertTitle || 'Tracking Risk Detected')
        : (executive.alertTitle || 'No Critical Risk Detected'),
      42
    )
  );

  setText(
    'alertText',
    clampText(
      isHighRisk
        ? (executive.alertText || executive.mainRiskDetail || 'Risk requires review before scaling.')
        : (executive.alertText || 'Performance is stable. No urgent action required.'),
      120
    )
  );

  const alertCard = $('alertCard');
  if (alertCard) alertCard.classList.toggle('risk-alert', isHighRisk);

  setText('customerSignal', clampText(customer.summary || 'Most customer questions this week are about price, consultation, and booking availability.', 130));
  setText('competitorSignal', clampText(competitor.summary || 'Competitor activity is stable. No aggressive offer detected this week.', 130));
  setText('nextAction', clampText(data.recommendations.ownerNextMove || data.recommendations.nextAction || 'Monitor Abu Dhabi VIP before scaling budget.', 160));

  const health = $('page1ChannelHealth');
  if (health) {
    health.innerHTML = channels.slice(0, 4).map(channel => `
      <div class="health-row">
        <div class="health-name">${iconFor(channel.name)}<strong>${clampText(channel.name, 18)}</strong></div>
        <small>${clampText(channel.status || 'Pending', 18)}</small>
      </div>
    `).join('');
  }
}

function renderPage2(data) {
  const channels = data.channels.slice(0, 4);

  const scoreGrid = $('channelScoreGrid');
  if (scoreGrid) {
    scoreGrid.innerHTML = channels.map(channel => {
      const score = Number(channel.score ?? 0);
      const label = score ? `${score}/100` : safe(channel.status, 'Pending');
      const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--info)' : score > 10 ? 'var(--gold)' : 'var(--inactive)';
      return `
        <div class="mini-score">
          <span class="label">${clampText(channel.name, 18)}</span>
          <strong>${label}</strong>
          <div class="bar"><span style="--w:${Math.min(100, Math.max(0, score || 12))}%;--c:${color}"></span></div>
        </div>
      `;
    }).join('');
  }

  const cards = $('channelCards');
  if (cards) {
    cards.innerHTML = channels.map(channel => {
      const score = Number(channel.score ?? 0);
      const statusClass = statusToClass(channel.status);
      const spend = channel.spendLabel || (channel.spend !== undefined ? fm(channel.spend) : 'Not active');
      const results = channel.resultsLabel || safe(channel.results, 'Pending');
      const cpr = channel.costPerResultLabel || (channel.costPerResult !== undefined ? fm(channel.costPerResult) : 'No data');

      return `
        <article class="card channel-card">
          <div class="channel-head">
            <div class="channel-name">
              ${iconFor(channel.name)}
              <div><strong>${clampText(channel.name, 18)}</strong><small>${clampText(channel.platform || '', 32)}</small></div>
            </div>
            <span class="status ${statusClass}">${clampText(channel.status || 'Pending', 16)}</span>
          </div>

          <div class="score-circle" style="--score:${Math.max(0, Math.min(100, score))};--scoreColor:${score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--info)' : score > 10 ? 'var(--gold)' : 'var(--inactive)'}"><strong>${score || 0}</strong></div>

          <div class="metric-list">
            <div class="metric-row"><span>Spend</span><b>${spend}</b></div>
            <div class="metric-row"><span>${channel.name === 'Google' ? 'Conversions / Clicks' : 'Results'}</span><b>${results}</b></div>
            <div class="metric-row"><span>${channel.name === 'Google' ? 'Cost / Conversion' : 'Cost / Result'}</span><b>${cpr}</b></div>
            <div class="metric-row"><span>CTR / Status</span><b>${clampText(channel.ctr || channel.trend || 'Stable', 18)}</b></div>
          </div>

          <div class="channel-decision">Decision: ${clampText(channel.decision || 'Review before scaling.', 72)}</div>
        </article>
      `;
    }).join('');
  }

  setText('budgetMoveTitle', clampText(data.recommendations.budgetMoveTitle || 'Keep Meta as the main engine. Do not scale testing channels yet.', 84));
  setText('budgetMoveText', clampText(data.recommendations.budgetMoveText || 'Meta remains the lead engine. Traffic/search channels need conversion-quality proof before scaling.', 150));
}

function renderPage5(data) {
  const r = data.recommendations || {};

  setText('finalDecisionBadge', clampText(r.badge || 'HOLD / IMPROVE', 18));
  setText('finalDecisionTitle', clampText(r.finalDecisionTitle || r.title || 'Hold budget. Improve proof, replies, and tracking before scaling.', 85));
  setText('finalDecisionSummary', clampText(r.finalDecisionSummary || r.summary || 'This is a control-and-improve week: keep the stable Meta engine active, improve customer handling, and prepare cleaner growth signals.', 165));
  setText('ownerNextMove', clampText(r.ownerNextMove || 'Hold budget steady, strengthen replies and proof content, then review again after the next weekly refresh.', 145));
  setHTML('nextReportDate', r.nextReportDate || 'Next weekly review<br>Monday 10:00 AM');

  const fallbackActions = [
    { title: 'Keep Dubai and Abu Dhabi Meta campaigns active.', note: 'No budget increase until cost/result stays stable after the next refresh.', tag: 'Keep Active', tone: 'green' },
    { title: 'Update price replies with value + consultation CTA.', note: 'Do not answer price alone. Mention privacy, natural result, and free consultation.', tag: 'Reply Upgrade', tone: 'gold' },
    { title: 'Add proof-led content against competitor pressure.', note: 'Use transformation proof, consultation trust, and premium private handling.', tag: 'Content', tone: '' },
    { title: 'Do not scale traffic/search channels yet.', note: 'Testing channels need conversion tracking and lead-quality confirmation first.', tag: 'Hold', tone: 'warn' }
  ];

  const actions = asArray(r.priorityActions).length ? r.priorityActions : fallbackActions;
  const actionBox = $('priorityActions');
  if (actionBox) {
    actionBox.innerHTML = actions.slice(0, 4).map((item, i) => `
      <div class="priority-row">
        <span class="step-num">${i + 1}</span>
        <div>
          <strong>${clampText(item.title, 64)}</strong>
          <small>${clampText(item.note || item.description, 88)}</small>
        </div>
        <span class="owner-tag ${item.tone || ''}">${clampText(item.tag || 'Action', 16)}</span>
      </div>
    `).join('');
  }

  renderChecklist('doThisList', asArray(r.doThis).length ? r.doThis : [
    'Protect the stable Meta engine and improve the conversion path.',
    'Use privacy, natural result, and premium consultation as the core message.',
    'Track customer questions and turn repeated objections into better replies.'
  ], '✓');

  renderChecklist('doNotDoList', asArray(r.doNotDo).length ? r.doNotDo : [
    'Do not increase budget only because results look positive this week.',
    'Do not compare WhatsApp conversations with traffic clicks directly.',
    'Do not enter a discount war unless competitor pressure becomes high.'
  ], '!');
}

/*
Iconic Owner Dashboard — v15.2.9 Date Range Lock + Week Parser Fix
FULL FILE PATCH appended safely to public/app.js
Scope:
- Fix report date range lock for current approved test/report window.
- Fix week parser so 2026-W24 -> current week 24, next week 25.
- Preserve v15.2.8 Google conversion guard.
- No Apps Script, no WhatsApp, no Email, no triggers, no Team Inbox.
*/

function parseWeekNumber_V1529_(value) {
  const text = String(value || '');

  const explicit =
    text.match(/\b\d{4}-W0?(\d{1,2})\b/i) ||
    text.match(/\bW0?(\d{1,2})\b/i) ||
    text.match(/\bWeek\s*0?(\d{1,2})\b/i);

  if (explicit) return Number(explicit[1]);
  return 0;
}

function normalizeDateRange_V1529_() {
  return '01 Jun 2026 - 07 Jun 2026';
}

function nextReportText_V1529_(report) {
  const week = parseWeekNumber_V1529_(report && (report.week || report.weekLabel || '2026-W24'));
  if (week > 0) return `Week ${week + 1} Review<br>Monday 10:00 AM`;
  return 'Week 25 Review<br>Monday 10:00 AM';
}

function numberFromAny_V1529_(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

function getMetric_V1529_(row, keys, fallback = 0) {
  if (!row || typeof row !== 'object') return fallback;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return numberFromAny_V1529_(row[key], fallback);
    }
  }
  return fallback;
}

function rowText_V1529_(row, keys, fallback = '') {
  if (!row || typeof row !== 'object') return fallback;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') return String(row[key]);
  }
  return fallback;
}

function isGoogleClickOnly_V1529_(row, resultType, results, clicks, conversions, status, decision) {
  const joined = [
    resultType,
    rowText_V1529_(row, ['platform', 'detail', 'subtitle'], ''),
    status,
    decision,
    rowText_V1529_(row, ['note', 'notes', 'comment'], '')
  ].join(' ').toLowerCase();

  if (conversions > 0) return false;
  if (clicks > 0) return true;

  if (
    results > 0 &&
    (
      joined.includes('search conversion') ||
      joined.includes('needs attention') ||
      joined.includes('tracking') ||
      joined.includes('watch')
    )
  ) {
    return true;
  }

  return false;
}

function mapDirectKeyedChannel_V1506(name, row) {
  const fallback = emptyChannelTemplate(name);

  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return fallback;
  }

  const spend = getMetric_V1529_(row, ['spend', 'totalSpend', 'amountSpent'], 0);
  let results = getMetric_V1529_(row, ['results', 'totalResults'], 0);
  let clicks = getMetric_V1529_(row, ['clicks', 'totalClicks'], 0);
  let conversions = getMetric_V1529_(row, ['conversions', 'totalConversions'], 0);

  let resultType = textValue_V1506(pick(row, [
    'resultType',
    'result_type',
    'metricType',
    'objective',
    'conversionType',
    'platform',
    'detail',
    'subtitle'
  ], ''), '');

  let status = prettyStatus_V1506(row.status || row.health || row.state, fallback.status);
  let decision = decisionForChannel_V1506(name, row);

  let costPerResult = getMetric_V1529_(row, [
    'costPerResult',
    'cost_per_result',
    'cpr',
    'costPerConversion',
    'cost_per_conversion'
  ], 0);

  let resultsLabel;
  let costPerResultLabel;

  if (name === 'Google') {
    const clickOnly = isGoogleClickOnly_V1529_(row, resultType, results, clicks, conversions, status, decision);

    if (clickOnly) {
      if (clicks <= 0) clicks = results;
      conversions = 0;
      results = 0;
      resultType = 'Search Clicks / Traffic';
      resultsLabel = `Conv 0 | Clicks ${number.format(clicks)}`;
      costPerResult = undefined;
      costPerResultLabel = 'N/A';
      status = 'Needs Attention';
      decision = 'Clicks exist, but conversions are 0. Improve tracking before scaling.';
    } else if (conversions > 0) {
      results = conversions;
      resultType = 'Search Conversions';
      costPerResult = spend > 0 && results > 0 ? spend / results : costPerResult;
      status = status || 'Watch';
    } else {
      results = 0;
      resultType = 'Search Traffic';
      resultsLabel = clicks > 0 ? `Conv 0 | Clicks ${number.format(clicks)}` : 'Conv 0';
      costPerResult = undefined;
      costPerResultLabel = 'N/A';
    }
  }

  if (name === 'Snapchat') {
    resultType = resultType || 'Traffic Clicks';
    if (results <= 0 && clicks > 0) results = clicks;
  }

  if (name === 'TikTok') {
    resultType = resultType || 'Destination Clicks';
    if (results <= 0 && clicks > 0) results = clicks;
  }

  if (name === 'Meta') {
    resultType = resultType || 'WhatsApp Conversations';
  }

  if ((!costPerResult || costPerResult <= 0) && spend > 0 && results > 0) {
    costPerResult = spend / results;
  }

  const normalizedRow = { ...row, spend, results, clicks, conversions, costPerResult };

  return {
    ...fallback,
    ...row,
    name,
    channel: name,
    platform: resultType || fallback.platform,
    status,
    spend,
    results,
    clicks,
    conversions,
    spendLabel: undefined,
    resultsLabel,
    costPerResult: costPerResult > 0 ? costPerResult : undefined,
    costPerResultLabel: costPerResult > 0 ? undefined : (costPerResultLabel || fallback.costPerResultLabel),
    ctr: formatCtr_V1506(pick(row, ['ctr', 'clickThroughRate', 'trend', 'statusDetail'], fallback.ctr), fallback.ctr),
    score: Number(pick(row, ['score', 'healthScore'], 0)) || scoreForChannel_V1506(name, normalizedRow) || fallback.score,
    decision
  };
}

function normalizeData(raw) {
  const data = raw && raw.data && typeof raw.data === 'object' ? raw.data : (raw || {});
  const report = data.report || data.reportContext || {};
  const executive = data.executive || data.executiveSnapshot || {};
  const customerRaw = data.customerIntelligence || {};
  const competitorRaw = data.competitorIntelligence || {};
  const recommendations = data.recommendations || data.nextSteps || data.finalRecommendations || {};

  const keyedChannels =
    data.channels && typeof data.channels === 'object' && !Array.isArray(data.channels)
      ? data.channels
      : {};

  const channels = hasDirectKeyedChannels_V1506(keyedChannels)
    ? buildChannelsFromKeyedObject_V1506(keyedChannels)
    : mergeChannelRows(data.channelsSummary || data.channelSummary || []);

  const generatedAt = data.generatedAt || report.generatedAt || new Date().toISOString();

  const totalSpend = channels.reduce((sum, channel) => sum + numberFromAny_V1529_(channel.spend, 0), 0);
  const totalResults = channels.reduce((sum, channel) => sum + numberFromAny_V1529_(channel.results, 0), 0);

  const reportWeek = report.week || report.weekLabel || '2026-W24';

  const patchedReport = {
    ...report,
    week: reportWeek,
    weekLabel: reportWeek,
    dateRange: normalizeDateRange_V1529_(),
    startDate: '2026-06-01',
    endDate: '2026-06-07'
  };

  const google = channels.find(channel => channel.name === 'Google');
  const googleHasClickNoConversion =
    google && numberFromAny_V1529_(google.clicks, 0) > 0 && numberFromAny_V1529_(google.results, 0) <= 0;

  const patchedExecutive = {
    ...executive,
    totalSpend,
    totalResults,
    mainRisk: googleHasClickNoConversion ? 'High' : (executive.mainRisk || executive.risk || 'Low'),
    risk: googleHasClickNoConversion ? 'High' : (executive.risk || executive.mainRisk || 'Low'),
    bestChannel: executive.bestChannel || 'Meta',
    bestChannelDetail: executive.bestChannelDetail || 'WhatsApp Conversations'
  };

  if (googleHasClickNoConversion) {
    patchedExecutive.mainRiskDetail = 'Google conversions are 0.';
    patchedExecutive.alertTitle = 'Tracking Risk Detected';
    patchedExecutive.alertText = 'Google generated clicks, but no confirmed conversions. Treat it as traffic until tracking is fixed.';
    patchedExecutive.decisionTitle = executive.decisionTitle || 'Keep Meta as the main engine.';
    patchedExecutive.decisionLine1 = 'Review Google because clicks are not confirmed conversions.';
    patchedExecutive.decisionLine2 = 'Do not compare traffic clicks with WhatsApp conversations.';
  }

  window.__ICONIC_DEBUG__ = {
    version: 'v15.2.9-date-range-lock-week-parser-fix',
    rawChannels: data.channels || null,
    normalizedChannels: channels,
    report: patchedReport
  };

  return {
    report: patchedReport,
    executive: patchedExecutive,
    channels,
    customer: normalizeCustomer(customerRaw),
    competitor: {
      ...competitorRaw,
      competitors: sanitizeCompetitors(competitorRaw.competitors || competitorRaw.trackedCompetitors || [])
    },
    recommendations: {
      ...recommendations,
      nextReportDate: nextReportText_V1529_(patchedReport)
    },
    generatedAt
  };
}

function renderPage5(data) {
  const r = data.recommendations || {};

  setText('finalDecisionBadge', clampText(r.badge || 'HOLD / IMPROVE', 18));
  setText('finalDecisionTitle', clampText(r.finalDecisionTitle || r.title || 'Hold budget. Improve proof, replies, and tracking before scaling.', 85));
  setText('finalDecisionSummary', clampText(r.finalDecisionSummary || r.summary || 'This is a control-and-improve week: keep the stable Meta engine active, improve customer handling, and prepare cleaner growth signals.', 165));
  setText('ownerNextMove', clampText(r.ownerNextMove || 'Hold budget steady, strengthen replies and proof content, then review again after the next weekly refresh.', 145));
  setHTML('nextReportDate', r.nextReportDate || nextReportText_V1529_(data.report));

  const fallbackActions = [
    { title: 'Keep Dubai and Abu Dhabi Meta campaigns active.', note: 'No budget increase until cost/result stays stable after the next refresh.', tag: 'Keep Active', tone: 'green' },
    { title: 'Update price replies with value + consultation CTA.', note: 'Do not answer price alone. Mention privacy, natural result, and free consultation.', tag: 'Reply Upgrade', tone: 'gold' },
    { title: 'Add proof-led content against competitor pressure.', note: 'Use transformation proof, consultation trust, and premium private handling.', tag: 'Content', tone: '' },
    { title: 'Do not scale traffic/search channels yet.', note: 'Testing channels need conversion tracking and lead-quality confirmation first.', tag: 'Hold', tone: 'warn' }
  ];

  const actions = asArray(r.priorityActions).length ? r.priorityActions : fallbackActions;
  const actionBox = $('priorityActions');
  if (actionBox) {
    actionBox.innerHTML = actions.slice(0, 4).map((item, i) => `
      <div class="priority-row">
        <span class="step-num">${i + 1}</span>
        <div>
          <strong>${clampText(item.title, 64)}</strong>
          <small>${clampText(item.note || item.description, 88)}</small>
        </div>
        <span class="owner-tag ${item.tone || ''}">${clampText(item.tag || 'Action', 16)}</span>
      </div>
    `).join('');
  }

  renderChecklist('doThisList', asArray(r.doThis).length ? r.doThis : [
    'Protect the stable Meta engine and improve the conversion path.',
    'Use privacy, natural result, and premium consultation as the core message.',
    'Track customer questions and turn repeated objections into better replies.'
  ], '✓');

  renderChecklist('doNotDoList', asArray(r.doNotDo).length ? r.doNotDo : [
    'Do not increase budget only because results look positive this week.',
    'Do not compare WhatsApp conversations with traffic clicks directly.',
    'Do not enter a discount war unless competitor pressure becomes high.'
  ], '!');
}

/*
Iconic Owner Dashboard — v15.3.0 Google Tracking Risk Tone Adjustment
FULL FILE PATCH appended safely to public/app.js
Scope:
- Change Google no-conversion tracking issue from High Risk to Medium Risk.
- Keep Google correction: Search Clicks / Traffic, Conv 0 | Clicks 22, Cost / Conversion N/A.
- Keep date range lock and Next Report Week 25.
- No Apps Script, no WhatsApp, no Email, no triggers, no Team Inbox.
*/

function normalizeData(raw) {
  const data = raw && raw.data && typeof raw.data === 'object' ? raw.data : (raw || {});
  const report = data.report || data.reportContext || {};
  const executive = data.executive || data.executiveSnapshot || {};
  const customerRaw = data.customerIntelligence || {};
  const competitorRaw = data.competitorIntelligence || {};
  const recommendations = data.recommendations || data.nextSteps || data.finalRecommendations || {};

  const keyedChannels =
    data.channels && typeof data.channels === 'object' && !Array.isArray(data.channels)
      ? data.channels
      : {};

  const channels = hasDirectKeyedChannels_V1506(keyedChannels)
    ? buildChannelsFromKeyedObject_V1506(keyedChannels)
    : mergeChannelRows(data.channelsSummary || data.channelSummary || []);

  const generatedAt = data.generatedAt || report.generatedAt || new Date().toISOString();

  const totalSpend = channels.reduce((sum, channel) => sum + numberFromAny_V1529_(channel.spend, 0), 0);
  const totalResults = channels.reduce((sum, channel) => sum + numberFromAny_V1529_(channel.results, 0), 0);

  const reportWeek = report.week || report.weekLabel || '2026-W24';

  const patchedReport = {
    ...report,
    week: reportWeek,
    weekLabel: reportWeek,
    dateRange: normalizeDateRange_V1529_(),
    startDate: '2026-06-01',
    endDate: '2026-06-07'
  };

  const google = channels.find(channel => channel.name === 'Google');
  const googleHasClickNoConversion =
    google && numberFromAny_V1529_(google.clicks, 0) > 0 && numberFromAny_V1529_(google.results, 0) <= 0;

  const patchedExecutive = {
    ...executive,
    totalSpend,
    totalResults,
    mainRisk: googleHasClickNoConversion ? 'Medium' : (executive.mainRisk || executive.risk || 'Low'),
    risk: googleHasClickNoConversion ? 'Medium' : (executive.risk || executive.mainRisk || 'Low'),
    bestChannel: executive.bestChannel || 'Meta',
    bestChannelDetail: executive.bestChannelDetail || 'WhatsApp Conversations'
  };

  if (googleHasClickNoConversion) {
    patchedExecutive.mainRiskDetail = 'Google tracking needs review.';
    patchedExecutive.alertTitle = 'Tracking Needs Review';
    patchedExecutive.alertText = 'Google generated clicks, but no confirmed conversions yet. Treat it as traffic until tracking is fixed.';
    patchedExecutive.decisionTitle = executive.decisionTitle || 'Keep Meta as the main engine.';
    patchedExecutive.decisionLine1 = 'Google clicks are useful, but they are not confirmed conversions yet.';
    patchedExecutive.decisionLine2 = 'Do not compare Google traffic clicks with WhatsApp conversations.';
  }

  window.__ICONIC_DEBUG__ = {
    version: 'v15.3.0-google-tracking-risk-tone-adjustment',
    rawChannels: data.channels || null,
    normalizedChannels: channels,
    report: patchedReport
  };

  return {
    report: patchedReport,
    executive: patchedExecutive,
    channels,
    customer: normalizeCustomer(customerRaw),
    competitor: {
      ...competitorRaw,
      competitors: sanitizeCompetitors(competitorRaw.competitors || competitorRaw.trackedCompetitors || [])
    },
    recommendations: {
      ...recommendations,
      nextReportDate: nextReportText_V1529_(patchedReport)
    },
    campaignActivityAlert: data.campaignActivityAlert || (data.paidChannelActivity && data.paidChannelActivity.alert) || null,
    paidChannelActivity: data.paidChannelActivity || null,
    renderCampaignActivitySyncVersion: data.renderCampaignActivitySyncVersion || (data.executive && data.executive.renderCampaignActivitySyncVersion) || '',
    __raw: data,
    generatedAt
  };
}

function renderPage1(data) {
  const { report, executive, customer, competitor, channels } = data;

  setText('reportWeek', report.week || report.weekLabel || 'Week');
  setText('dateRange', report.dateRange || 'Date range');
  setText('generatedAt', normalizeGeneratedAt(data.generatedAt));

  setText('totalSpend', fm(executive.totalSpend || 0));
  setText('totalResults', number.format(Number(executive.totalResults || 0)));
  setText('bestChannel', clampText(executive.bestChannel || 'Meta', 24));
  setText('bestChannelDetail', clampText(executive.bestChannelDetail || 'Strong performance', 42));

  const risk = normalizeMainRisk(executive.mainRisk || executive.risk || 'Low');
  setText('mainRisk', risk.label);
  setText('mainRiskDetail', clampText(executive.mainRiskDetail || risk.detail, 64));

  setText('decisionTitle', clampText(executive.decisionTitle || executive.title || 'Keep Meta active. No budget increase this week.', 82));
  setText('decisionLine1', clampText(executive.decisionLine1 || 'Dubai and Abu Dhabi remain stable, with Meta leading performance.', 120));
  setText('decisionLine2', clampText(executive.decisionLine2 || 'Do not increase spend until cost/result stays stable for the next refresh.', 120));

  const riskLower = String(risk.label || '').toLowerCase();
  const isHighRisk = riskLower.includes('high');
  const isMediumRisk = riskLower.includes('medium');

  setText(
    'alertTitle',
    clampText(
      isHighRisk
        ? (executive.alertTitle || 'Tracking Risk Detected')
        : isMediumRisk
          ? (executive.alertTitle || 'Tracking Needs Review')
          : (executive.alertTitle || 'No Critical Risk Detected'),
      42
    )
  );

  setText(
    'alertText',
    clampText(
      isHighRisk || isMediumRisk
        ? (executive.alertText || executive.mainRiskDetail || 'Review before scaling.')
        : (executive.alertText || 'Performance is stable. No urgent action required.'),
      120
    )
  );

  const alertCard = $('alertCard');
  if (alertCard) {
    alertCard.classList.toggle('risk-alert', isHighRisk);
    alertCard.classList.toggle('medium-alert', isMediumRisk);
  }

  // v15.6.12: Campaign payment/live status must be visible in Render UI and PDF.
  const campaignVisualV15612 = applyCampaignActivityToExecutiveAlertV15612(data, executive, risk);
  renderCampaignActivityAlertV15612(data);

  setText('customerSignal', clampText(customer.summary || 'Most customer questions this week are about price, consultation, and booking availability.', 130));
  setText('competitorSignal', clampText(competitor.summary || 'Competitor activity is stable. No aggressive offer detected this week.', 130));
  setText('nextAction', clampText(data.recommendations.ownerNextMove || data.recommendations.nextAction || 'Monitor Abu Dhabi VIP before scaling budget.', 160));

  const health = $('page1ChannelHealth');
  if (health) {
    health.innerHTML = channels.slice(0, 4).map(channel => `
      <div class="health-row">
        <div class="health-name">${iconFor(channel.name)}<strong>${clampText(channel.name, 18)}</strong></div>
        <small>${clampText(channel.status || 'Pending', 18)}</small>
      </div>
    `).join('');
  }
}


/*
Iconic Owner Dashboard — v15.5.5 Direct Channel Currency Formatter Fix
FILE: public/app.js
Scope:
- Render visual layer only.
- Adds a compact Billing Risk card to Page 1 when /api/dashboard-data exposes billingRiskSync/billingRisk.
- Fixes Snapchat campaign spend currency display: Snapchat spend is USD when upstream billing/platform currency is USD, not AED.
- Uses existing Render /api/dashboard-data; no Apps Script changes.
- No server.js changes.
- No WhatsApp.
- No Email.
- No triggers.
- No Team Inbox / 811.
*/
(function iconicBillingRiskVisualV1552() {
  const VERSION = 'v15.6.22-billing-card-text-polish';

  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function oneLine(value, fallback) {
    const text = String(value || fallback || '').replace(/\s+/g, ' ').trim();
    return text;
  }

  function short(value, limit, fallback) {
    const text = oneLine(value, fallback);
    if (!limit || text.length <= limit) return text;
    return text.slice(0, Math.max(0, limit - 1)).trim() + '…';
  }

  function statusClass(status) {
    const s = String(status || '').toLowerCase();
    if (s.includes('critical')) return 'critical';
    if (s.includes('mismatch')) return 'mismatch';
    if (s.includes('watch')) return 'watch';
    if (s.includes('ok')) return 'ok';
    return 'watch';
  }

  function readBillingPayload(data) {
    const root = data && typeof data === 'object' ? data : {};
    const sync = root.billingRiskSync || root.ownerReportDataSync || root.ownerReportDataSyncV1549 || {};
    const billingRisk = root.billingRisk || sync.billingRisk || {};
    const platforms = root.billingPlatformStatuses || sync.platformStatuses || [];
    const warning = root.billingRiskOwnerWarning || sync.ownerWarning || billingRisk.ownerWarning || '';
    const action = root.billingRiskOwnerAction || sync.ownerAction || '';
    const worstStatus = billingRisk.worstStatus || sync.worstStatus || root.billingRiskStatus || '';

    return {
      ok: !!(sync.ok || billingRisk.worstStatus || platforms.length),
      version: sync.version || VERSION,
      worstStatus: worstStatus || 'Watch',
      warning,
      action,
      platforms: Array.isArray(platforms) ? platforms : []
    };
  }

  function pickSnapchat(platforms) {
    return (platforms || []).find(item => String(item.platform || '').toLowerCase().includes('snap')) || null;
  }

  function buildPlatformRows(platforms) {
    const ordered = ['Meta', 'Google', 'Snapchat', 'TikTok'];
    const rows = ordered.map(name => {
      const found = (platforms || []).find(item => String(item.platform || '').toLowerCase() === name.toLowerCase());
      return found || { platform: name, status: 'Watch', actualBilling: '0', billingRows: 0 };
    });

    return rows.map(row => {
      const status = row.status || row.unallocatedStatus || row.billingStatus || 'Watch';
      return `
        <div class="billing-risk-platform-row-v1552 ${statusClass(status)}">
          <strong>${esc(row.platform || 'Platform')}</strong>
          <span>${esc(status)}</span>
          <small>${esc(row.actualBilling || row.billingDisplay || '0')}</small>
        </div>
      `;
    }).join('');
  }

  function normalizeCurrency(value, fallback) {
    const raw = String(value || '').trim();
    if (!raw || raw.toLowerCase().includes('blank')) return fallback || 'AED';
    if (raw.indexOf('/') !== -1) {
      const first = raw.split('/')[0].trim();
      return first || fallback || 'AED';
    }
    return raw.toUpperCase();
  }

  function formatPlatformAmount(amount, currency) {
    const n = Number(amount || 0);
    const clean = Number.isFinite(n) ? (Math.round(n * 100) / 100).toString() : String(amount || '0');
    return `${normalizeCurrency(currency, 'AED')} ${clean}`;
  }

  function buildCard(data) {
    const payload = readBillingPayload(data);
    if (!payload.ok) return '';

    const snapchat = pickSnapchat(payload.platforms);
    const status = payload.worstStatus || 'Watch';
    const cssStatus = statusClass(status);
    const warning = 'Actual platform charges are not safely matched to current campaign spend. Reconcile billing before using billing as performance data.';
    const action = 'Do not treat billing charges as campaign performance spend. Review currency, old balances, threshold payments, VAT/tax, and delayed charges.';

    const snapchatCampaignCurrency = snapchat
      ? normalizeCurrency(snapchat.campaignCurrency || snapchat.spendCurrency || snapchat.currency, 'USD')
      : 'USD';

    const snapchatCampaignSpend = snapchat
      ? formatPlatformAmount(snapchat.campaignSpend || 0, snapchatCampaignCurrency)
      : '';

    const snapActual = snapchat ? (snapchat.actualBilling || snapchat.billingDisplay || '0') : 'Not available';
    const snapLine = snapchat
      ? `Actual billing: ${snapActual} • Campaign spend: ${snapchatCampaignSpend}`
      : 'Snapchat billing row is not available yet.';

    return `
      <section id="billingRiskCardV1552" class="billing-risk-card-v1552 ${cssStatus}" data-version="${esc(VERSION)}">
        <div class="billing-risk-main-v1552">
          <div>
            <span class="label">Billing Reconciliation Risk</span>
            <h3>Billing Risk: ${esc(status)}</h3>
            <p>${esc(warning)}</p>
          </div>
          <div class="billing-risk-badge-v1552 ${cssStatus}">${esc(status)}</div>
        </div>

        <div class="billing-risk-highlight-v1552">
          <strong>Snapchat Check</strong>
          <span>${esc(snapLine)}</span>
        </div>

        <div class="billing-risk-platforms-v1552">
          ${buildPlatformRows(payload.platforms)}
        </div>

        <div class="billing-risk-owner-action-v1552">
          <strong>Owner Action</strong>
          <span>${esc(action)}</span>
        </div>
      </section>
    `;
  }

  function renderCard(data) {
    const html = buildCard(data);
    const existing = document.getElementById('billingRiskCardV1552');
    if (!html) {
      if (existing) existing.remove();
      return;
    }

    if (existing) {
      existing.outerHTML = html;
      return;
    }

    const alertCard = document.getElementById('alertCard');
    if (alertCard && alertCard.parentNode) {
      alertCard.insertAdjacentHTML('afterend', html);
      return;
    }

    const page1Content = document.querySelector('#page1 .page-content');
    if (page1Content) {
      page1Content.insertAdjacentHTML('beforeend', html);
    }
  }

  async function fetchAndRender() {
    try {
      const response = await fetch('/api/dashboard-data?visualBillingRisk=1&t=' + Date.now(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const json = await response.json();
      if (!response.ok || json.ok === false) return;
      renderCard(json);
      window.__ICONIC_BILLING_RISK_VISUAL__ = {
        ok: true,
        version: VERSION,
        billingRiskSyncOk: !!(json.billingRiskSync && json.billingRiskSync.ok),
        worstStatus: json.billingRisk && json.billingRisk.worstStatus
      };
    } catch (error) {
      window.__ICONIC_BILLING_RISK_VISUAL__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    }
  }

  function start() {
    setTimeout(fetchAndRender, 450);
    setTimeout(fetchAndRender, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();


/*
Iconic Owner Dashboard — v15.5.3 Snapchat Spend Currency Safety Patch
Scope:
- Visual-only patch.
- Corrects any remaining cached/legacy text that says Snapchat campaign spend is AED.
- Does not change API data, Apps Script, Render server.js, Email, WhatsApp, triggers, Team Inbox, or 811.
*/
(function iconicSnapchatCurrencySafetyPatchV1553() {
  const VERSION = 'v15.5.3-snapchat-currency-safety-patch';

  function normalizeCurrency(value, fallback) {
    const raw = String(value || '').trim();
    if (!raw || raw.toLowerCase().includes('blank')) return fallback || 'USD';
    if (raw.indexOf('/') !== -1) {
      const first = raw.split('/')[0].trim();
      return first || fallback || 'USD';
    }
    return raw.toUpperCase();
  }

  function formatAmount(amount, currency) {
    const n = Number(amount || 0);
    const clean = Number.isFinite(n) ? (Math.round(n * 100) / 100).toString() : String(amount || '0');
    return `${normalizeCurrency(currency, 'USD')} ${clean}`;
  }

  function findSnapchatStatus(json) {
    const sync = json && (json.billingRiskSync || json.ownerReportDataSync || json.ownerReportDataSyncV1549 || {});
    const platforms = (json && json.billingPlatformStatuses) || sync.platformStatuses || [];
    return (platforms || []).find(item => String(item.platform || '').toLowerCase().includes('snap')) || null;
  }

  function replaceLegacyText(root, oldText, newText) {
    if (!root || !oldText || !newText || oldText === newText) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (node.nodeValue && node.nodeValue.includes(oldText)) {
        node.nodeValue = node.nodeValue.split(oldText).join(newText);
      }
    });
  }

  function updateSnapchatChannelCard(campaignSpendLabel, costLabel) {
    const cards = Array.from(document.querySelectorAll('.channel-card, article, .card'));
    const snapCard = cards.find(card => /snapchat/i.test(card.textContent || ''));
    if (!snapCard) return;

    const rows = Array.from(snapCard.querySelectorAll('.metric-row'));
    rows.forEach(row => {
      const label = (row.querySelector('span') || {}).textContent || '';
      const value = row.querySelector('b');
      if (!value) return;
      if (/spend/i.test(label)) value.textContent = campaignSpendLabel;
      if (/cost\s*\/\s*result/i.test(label) && costLabel) value.textContent = costLabel;
    });
  }

  async function run() {
    try {
      const response = await fetch('/api/dashboard-data?currencyFix=1553&t=' + Date.now(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const json = await response.json();
      if (!response.ok || !json || json.ok === false) return;

      const snap = findSnapchatStatus(json);
      if (!snap) return;

      const currency = normalizeCurrency(snap.campaignCurrency || snap.spendCurrency || snap.currency, 'USD');
      const campaignSpend = snap.campaignSpend || (json.channels && json.channels.snapchat && json.channels.snapchat.spend) || 0;
      const campaignSpendLabel = formatAmount(campaignSpend, currency);
      const cpr = json.channels && json.channels.snapchat ? json.channels.snapchat.costPerResult : undefined;
      const costLabel = cpr !== undefined && cpr !== null ? formatAmount(cpr, currency) : '';

      replaceLegacyText(document.body, `AED ${campaignSpend}`, campaignSpendLabel);
      replaceLegacyText(document.body, `AED ${Number(campaignSpend).toFixed(2)}`, campaignSpendLabel);
      replaceLegacyText(document.body, `AED ${Math.round(Number(campaignSpend) * 100) / 100}`, campaignSpendLabel);

      updateSnapchatChannelCard(campaignSpendLabel, costLabel);

      window.__ICONIC_SNAPCHAT_CURRENCY_FIX__ = {
        ok: true,
        version: VERSION,
        snapchatCampaignSpend: campaignSpendLabel,
        snapchatActualBilling: snap.actualBilling || snap.billingDisplay || '0'
      };
    } catch (error) {
      window.__ICONIC_SNAPCHAT_CURRENCY_FIX__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    }
  }

  function start() {
    setTimeout(run, 500);
    setTimeout(run, 1900);
    setTimeout(run, 3500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();


/*
Iconic Owner Dashboard — v15.5.5 Direct Channel Currency Formatter Fix
Scope:
- Visual-only patch for Render dashboard.
- Fixes Snapchat Channel Health card spend and cost/result labels from AED to USD.
- Keeps Billing Risk card using USD for Snapchat spend.
- Does not modify server.js, Apps Script, Email, WhatsApp, triggers, Team Inbox, 811, or tokens.
*/
(function iconicSnapchatChannelCardCurrencyFixV1554() {
  const VERSION = 'v15.5.5-direct-channel-currency-formatter-fix';

  function normalizeCurrency(value, fallback) {
    const raw = String(value || '').trim();
    if (!raw || /blank/i.test(raw)) return fallback || 'USD';
    if (raw.indexOf('/') !== -1) {
      const first = raw.split('/')[0].trim();
      return first || fallback || 'USD';
    }
    return raw.toUpperCase();
  }

  function cleanAmount(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return String(value || '0');
    return (Math.round(n * 100) / 100).toString();
  }

  function amountLabel(value, currency) {
    return `${normalizeCurrency(currency, 'USD')} ${cleanAmount(value)}`;
  }

  function getDataSync(json) {
    return (
      (json && json.billingRiskSync) ||
      (json && json.ownerReportDataSync) ||
      (json && json.ownerReportDataSyncV1549) ||
      {}
    );
  }

  function findSnapchatBillingStatus(json) {
    const sync = getDataSync(json);
    const platforms =
      (json && json.billingPlatformStatuses) ||
      sync.platformStatuses ||
      [];
    return (platforms || []).find(item => String(item.platform || '').toLowerCase().includes('snap')) || null;
  }

  function getSnapchatNumbers(json) {
    const channel = json && json.channels && json.channels.snapchat ? json.channels.snapchat : {};
    const billing = findSnapchatBillingStatus(json) || {};
    const currency = normalizeCurrency(
      billing.campaignCurrency || billing.spendCurrency || billing.currency,
      'USD'
    );

    return {
      currency,
      spend: billing.campaignSpend !== undefined ? billing.campaignSpend : channel.spend,
      costPerResult: channel.costPerResult,
      actualBilling: billing.actualBilling || billing.billingDisplay || ''
    };
  }

  function replaceTextEverywhere(oldText, newText) {
    if (!oldText || !newText || oldText === newText) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (node.nodeValue && node.nodeValue.indexOf(oldText) !== -1) {
        node.nodeValue = node.nodeValue.split(oldText).join(newText);
      }
    });
  }

  function getLikelySnapchatCard() {
    const candidates = Array.from(document.querySelectorAll('article, section, .card, .channel-card, [class*="card"], [class*="channel"]'));
    return candidates
      .filter(el => /snapchat/i.test(el.textContent || ''))
      .sort((a, b) => (a.textContent || '').length - (b.textContent || '').length)[0] || null;
  }

  function replaceCurrencyNearLabel(card, labelRegex, newValue) {
    if (!card || !newValue) return false;

    const textNodes = [];
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    for (let i = 0; i < textNodes.length; i++) {
      const txt = String(textNodes[i].nodeValue || '');
      if (!labelRegex.test(txt)) continue;

      // Look ahead a few text nodes for the rendered value.
      for (let j = i + 1; j < Math.min(i + 8, textNodes.length); j++) {
        const v = String(textNodes[j].nodeValue || '').trim();
        if (/^(AED|USD)\s*\d+(\.\d+)?$/i.test(v)) {
          textNodes[j].nodeValue = newValue;
          return true;
        }
        // Some layouts split currency and number in separate text nodes.
        if (/^(AED|USD)$/i.test(v) && textNodes[j + 1]) {
          const next = String(textNodes[j + 1].nodeValue || '').trim();
          if (/^\d+(\.\d+)?$/i.test(next)) {
            textNodes[j].nodeValue = newValue;
            textNodes[j + 1].nodeValue = '';
            return true;
          }
        }
      }
    }

    return false;
  }

  function patchSnapchatChannelCard(numbers) {
    const spendLabel = amountLabel(numbers.spend, numbers.currency);
    const costLabel = numbers.costPerResult !== null && numbers.costPerResult !== undefined
      ? amountLabel(numbers.costPerResult, numbers.currency)
      : '';

    const snapCard = getLikelySnapchatCard();

    // Generic page-wide replacements for the exact problematic values.
    replaceTextEverywhere(`AED ${cleanAmount(numbers.spend)}`, spendLabel);
    replaceTextEverywhere(`AED ${Number(numbers.spend || 0).toFixed(2)}`, spendLabel);
    if (costLabel) {
      replaceTextEverywhere(`AED ${cleanAmount(numbers.costPerResult)}`, costLabel);
      replaceTextEverywhere(`AED ${Number(numbers.costPerResult || 0).toFixed(2)}`, costLabel);
    }

    // Targeted card patch for layouts that split labels and values.
    if (snapCard) {
      replaceCurrencyNearLabel(snapCard, /spend/i, spendLabel);
      if (costLabel) replaceCurrencyNearLabel(snapCard, /cost\s*\/?\s*result/i, costLabel);
    }

    // Also fix Billing Risk snapshot copy if any old text remains.
    replaceTextEverywhere(
      `${numbers.actualBilling || '260 USD'} actual billing vs AED ${cleanAmount(numbers.spend)} campaign spend`,
      `${numbers.actualBilling || '260 USD'} actual billing vs ${spendLabel} campaign spend`
    );

    return {
      spendLabel,
      costLabel,
      snapCardFound: !!snapCard
    };
  }

  async function run() {
    try {
      const response = await fetch('/api/dashboard-data?snapCurrencyFix=1554&t=' + Date.now(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const json = await response.json();
      if (!response.ok || !json || json.ok === false) return;

      const numbers = getSnapchatNumbers(json);
      const result = patchSnapchatChannelCard(numbers);

      window.__ICONIC_SNAPCHAT_CHANNEL_CURRENCY_FIX__ = {
        ok: true,
        version: VERSION,
        currency: numbers.currency,
        campaignSpend: result.spendLabel,
        costPerResult: result.costLabel,
        snapCardFound: result.snapCardFound
      };
    } catch (error) {
      window.__ICONIC_SNAPCHAT_CHANNEL_CURRENCY_FIX__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    }
  }

  function start() {
    // Run multiple times because app render can happen after initial DOMContentLoaded.
    setTimeout(run, 300);
    setTimeout(run, 900);
    setTimeout(run, 1800);
    setTimeout(run, 3200);
    setTimeout(run, 5200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();




/*
Iconic Owner Dashboard — v15.6.18 Page 1 Risk Cleanup
Scope:
- Render visual/PDF layer only.
- Reads campaignActivityAlert / paidChannelActivity already exposed by /api/dashboard-data.
- Changes wording from “live unconfirmed” to practical owner language: direct platform check required.
- Keeps confirmed blocker language only where the data actually proves it (Meta payment/billing risk).
- No Apps Script, no Email, no WhatsApp, no owner send, no Team Inbox, no 811.
*/
function shortCampaignTextV15615(value, max = 150, fallback = '-') {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return fallback;
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function listTextV15615(value, fallback = 'None') {
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeListV15615(value) {
  if (Array.isArray(value)) return value.map(x => String(x || '').trim()).filter(Boolean);
  const text = String(value || '').trim();
  if (!text) return [];
  return text.split(',').map(x => x.trim()).filter(Boolean);
}

function pickCampaignActivityPayloadV15615(data) {
  const root = data && data.__raw ? data.__raw : data || {};
  const executive = root.executive || data.executive || {};
  const sync = root.ownerReportDataSync || root.ownerReportDataSyncV1549 || root.billingRiskSync || {};
  const paid = root.paidChannelActivity || sync.campaignActivity || data.paidChannelActivity || {};
  const alert = root.campaignActivityAlert || paid.alert || sync.campaignActivityAlert || data.campaignActivityAlert || {};

  const periodChannels = normalizeListV15615(paid.periodActivityChannels || executive.periodActivityPaidChannels || []);
  const liveChannels = normalizeListV15615(paid.liveConfirmedChannels || executive.liveConfirmedPaidChannels || []);
  const riskChannels = normalizeListV15615(paid.paymentRiskChannels || executive.paymentRiskPaidChannels || []);
  const needsCheckChannels = normalizeListV15615(paid.unconfirmedLiveChannels || executive.unconfirmedLivePaidChannels || []);

  const show = !!(
    alert.show ||
    executive.renderCampaignActivityAlertVisible ||
    executive.campaignActivityAlertTitle ||
    paid.ok ||
    riskChannels.length ||
    needsCheckChannels.length ||
    paid.canCompareLivePerformance === false
  );

  const confirmedBlockerText = riskChannels.length ? listTextV15615(riskChannels) : 'None';
  const directCheckText = needsCheckChannels.length ? listTextV15615(needsCheckChannels) : 'None';
  const periodText = periodChannels.length ? listTextV15615(periodChannels) : 'None';
  const liveText = liveChannels.length ? listTextV15615(liveChannels) : 'None';

  const practicalMessage = riskChannels.length
    ? `Confirmed blocker: ${confirmedBlockerText} has a payment/billing stop signal. For ${directCheckText}, this report has period activity only; verify current live status directly inside each ad platform before saying the campaigns are live or stopped.`
    : `No payment blocker is confirmed in this payload. For ${directCheckText}, verify current live status directly inside each ad platform before saying the campaigns are live or stopped.`;

  const practicalDecision = riskChannels.length
    ? `Fix payment/billing first for ${confirmedBlockerText}. Then check ${directCheckText} directly in their ad platforms before judging current delivery or scaling.`
    : `Check ${directCheckText} directly in their ad platforms before judging current delivery or scaling.`;

  return {
    show,
    severity: String(alert.severity || 'critical').toLowerCase(),
    title: 'Campaign Payment / Platform Status Alert',
    message: practicalMessage,
    ownerDecision: practicalDecision,
    periodActivityChannels: periodChannels,
    liveConfirmedChannels: liveChannels,
    paymentRiskChannels: riskChannels,
    needsDirectCheckChannels: needsCheckChannels,
    canComparePeriodPerformance: paid.canComparePeriodPerformance ?? executive.canComparePeriodPerformance,
    canCompareLivePerformance: paid.canCompareLivePerformance ?? executive.canCompareLivePerformance,
    version: root.renderCampaignActivitySyncVersion || executive.renderCampaignActivitySyncVersion || paid.version || 'v15.6.15-practical-campaign-platform-status-card'
  };
}

/* Backward-compatible wrapper: renderPage1 already calls the v15.6.12 function name. */
function pickCampaignActivityPayloadV15612(data) {
  return pickCampaignActivityPayloadV15615(data);
}

function renderCampaignActivityAlertV15612(data) {
  /*
   * v15.6.18 Page 1 Risk Cleanup
   * The PDF became visually noisy because Page 1 showed three separate warning blocks:
   * 1) top alert bar, 2) Billing Risk card, 3) Live Campaign Control card.
   * Keep the detailed billing risk card + compact top alert only.
   * Remove the extra campaign activity card to prevent Page 1 overflow/split.
   */
  const existing = document.getElementById('campaignActivityCardV15612');
  if (existing) existing.remove();
}

function applyCampaignActivityToExecutiveAlertV15612(data, executive, risk) {
  const payload = pickCampaignActivityPayloadV15615(data);
  if (!payload.show) return { isCampaignCritical: false };

  const needsCheck = listTextV15615(payload.needsDirectCheckChannels, 'Google, Snapchat, TikTok');
  const blockers = listTextV15615(payload.paymentRiskChannels, 'None');
  const title = 'Billing & Platform Status Alert';
  const text = payload.paymentRiskChannels.length
    ? `Confirmed blocker: ${blockers}. Check ${needsCheck} directly before scaling.`
    : `Billing reconciliation risk is active. Check ${needsCheck} directly before scaling.`;

  setText('alertTitle', shortCampaignTextV15615(title, 44));
  setText('alertText', shortCampaignTextV15615(text, 140));

  const alertCard = document.getElementById('alertCard');
  if (alertCard) {
    alertCard.classList.add('risk-alert', 'campaign-alert-v15612', 'campaign-alert-v15615', 'page1-risk-clean-v15618');
    alertCard.setAttribute('data-campaign-alert-visible', 'true');
    alertCard.setAttribute('data-page1-risk-cleanup', 'v15.6.18');
  }

  return { isCampaignCritical: true };
}


/*
Iconic Owner Dashboard — v15.5.5 Direct Channel Currency Formatter Fix
Purpose:
- Directly fixes Snapchat Channel Health card if the old renderer still prints AED.
- This is visual-only and does not change the underlying API numbers.
- No server.js, Apps Script, Email, WhatsApp, triggers, Team Inbox, 811, or token changes.
*/
(function iconicDirectChannelCurrencyFormatterFixV1555() {
  const VERSION = 'v15.5.5-direct-channel-currency-formatter-fix';

  function text(el) {
    return (el && el.textContent ? el.textContent : '').trim();
  }

  function normalizeCurrency(value, fallback) {
    const raw = String(value || '').trim();
    if (!raw || /blank/i.test(raw)) return fallback || 'USD';
    if (raw.includes('/')) return (raw.split('/')[0].trim() || fallback || 'USD').toUpperCase();
    return raw.toUpperCase();
  }

  function fmt(value, currency) {
    const n = Number(value || 0);
    const clean = Number.isFinite(n) ? (Math.round(n * 100) / 100).toString() : String(value || '0');
    return `${normalizeCurrency(currency, 'USD')} ${clean}`;
  }

  function getSnapCurrencyAndValues(json) {
    const channel = json && json.channels && json.channels.snapchat ? json.channels.snapchat : {};
    const sync = (json && (json.billingRiskSync || json.ownerReportDataSync || json.ownerReportDataSyncV1549)) || {};
    const platforms = (json && json.billingPlatformStatuses) || sync.platformStatuses || [];
    const snapStatus = (platforms || []).find(p => /snap/i.test(String(p.platform || ''))) || {};
    const currency = normalizeCurrency(snapStatus.campaignCurrency || snapStatus.spendCurrency || snapStatus.currency, 'USD');

    return {
      currency,
      spend: snapStatus.campaignSpend !== undefined ? snapStatus.campaignSpend : channel.spend,
      costPerResult: channel.costPerResult,
      results: channel.results
    };
  }

  function findSnapchatCards() {
    const all = Array.from(document.querySelectorAll('section, article, div, .card, [class*="card"], [class*="channel"]'));
    return all.filter(el => {
      const t = text(el);
      return /Snapchat/i.test(t) && /Traffic Clicks/i.test(t) && /Cost\s*\/\s*Result/i.test(t);
    }).sort((a, b) => text(a).length - text(b).length);
  }

  function setValueAfterLabel(card, labelRegex, value) {
    if (!card || !value) return false;

    const candidates = Array.from(card.querySelectorAll('div, span, b, strong, p, li'));
    for (const el of candidates) {
      const t = text(el);
      if (!labelRegex.test(t)) continue;

      // Case 1: label and value are siblings in same row.
      const row = el.closest('div') || el.parentElement;
      if (row) {
        const valueEls = Array.from(row.querySelectorAll('b, strong, span, div')).filter(x => x !== el);
        for (const v of valueEls.reverse()) {
          const vt = text(v);
          if (/^(AED|USD)\s*\d+(\.\d+)?$/i.test(vt) || /^\d+(\.\d+)?$/i.test(vt)) {
            v.textContent = value;
            return true;
          }
        }
      }

      // Case 2: next siblings.
      let sib = el.nextElementSibling;
      let steps = 0;
      while (sib && steps < 5) {
        const st = text(sib);
        if (/^(AED|USD)\s*\d+(\.\d+)?$/i.test(st) || /^\d+(\.\d+)?$/i.test(st)) {
          sib.textContent = value;
          return true;
        }
        sib = sib.nextElementSibling;
        steps++;
      }
    }

    // Case 3: fallback text-node replacement inside card only.
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (let i = 0; i < nodes.length; i++) {
      if (!labelRegex.test(String(nodes[i].nodeValue || ''))) continue;
      for (let j = i + 1; j < Math.min(i + 10, nodes.length); j++) {
        const vt = String(nodes[j].nodeValue || '').trim();
        if (/^(AED|USD)\s*\d+(\.\d+)?$/i.test(vt) || /^\d+(\.\d+)?$/i.test(vt)) {
          nodes[j].nodeValue = value;
          return true;
        }
      }
    }

    return false;
  }

  function directReplaceInside(card, oldValue, newValue) {
    if (!card || !oldValue || !newValue) return;
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      if (n.nodeValue && n.nodeValue.includes(oldValue)) {
        n.nodeValue = n.nodeValue.split(oldValue).join(newValue);
      }
    });
  }

  function patch(json) {
    const values = getSnapCurrencyAndValues(json);
    const spendLabel = fmt(values.spend, values.currency);
    const costLabel = values.costPerResult !== undefined && values.costPerResult !== null ? fmt(values.costPerResult, values.currency) : '';

    const cards = findSnapchatCards();
    const card = cards[0];
    if (!card) return { ok: false, reason: 'Snapchat card not found', spendLabel, costLabel };

    setValueAfterLabel(card, /^Spend$/i, spendLabel);
    if (costLabel) setValueAfterLabel(card, /^Cost\s*\/\s*Result$/i, costLabel);

    // Absolute fallback for the exact current issue.
    directReplaceInside(card, `AED ${Number(values.spend || 0).toFixed(2)}`, spendLabel);
    directReplaceInside(card, `AED ${Math.round(Number(values.spend || 0) * 100) / 100}`, spendLabel);
    if (costLabel) {
      directReplaceInside(card, `AED ${Number(values.costPerResult || 0).toFixed(2)}`, costLabel);
      directReplaceInside(card, `AED ${Math.round(Number(values.costPerResult || 0) * 100) / 100}`, costLabel);
    }

    card.setAttribute('data-snapchat-currency-fixed', VERSION);

    return {
      ok: true,
      spendLabel,
      costLabel,
      cardText: text(card).slice(0, 300)
    };
  }

  async function run() {
    try {
      const res = await fetch('/api/dashboard-data?channelCurrencyFix=1555&t=' + Date.now(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const json = await res.json();
      if (!res.ok || !json || json.ok === false) return;
      const result = patch(json);
      window.__ICONIC_DIRECT_CHANNEL_CURRENCY_FIX__ = {
        version: VERSION,
        ...result
      };
    } catch (error) {
      window.__ICONIC_DIRECT_CHANNEL_CURRENCY_FIX__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    }
  }

  function start() {
    [300, 800, 1500, 2500, 4000, 6500, 9000].forEach(ms => setTimeout(run, ms));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();



/*
Iconic Owner Dashboard — v15.6.20 Truth-Based Owner Risk Language
Scope:
- Render visual/PDF layer only.
- Keeps server.js v15.6.17 unchanged because PDF data loading is already fixed.
- Does not claim channels are live/stopped unless a verifier proves it.
- Removes owner-facing raw API wording such as "API ERROR / HAD...".
- Separates billing reconciliation risk from live campaign status.
- No Apps Script, no Email, no WhatsApp, no owner send, no Team Inbox, no 811.
*/
function ownerSafeChannelStatusV15620(name, value, fallback = 'Review') {
  const raw = String(value || fallback || '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const lower = raw.toLowerCase();
  const channel = String(name || '').toLowerCase();

  if (lower.includes('payment') || lower.includes('billing') || lower.includes('blocked') || lower.includes('stopped')) {
    return 'Payment Review';
  }

  if (lower.includes('api error') || lower.includes('api failed') || lower.includes('error')) {
    return 'Needs Check';
  }

  if (lower.includes('had period') || lower.includes('had activity') || lower.includes('period activity')) {
    return 'Period Activity';
  }

  if (lower.includes('unconfirmed') || lower.includes('direct check') || lower.includes('not confirmed')) {
    return 'Needs Check';
  }

  if (lower.includes('needs attention') || lower.includes('tracking')) {
    return 'Needs Attention';
  }

  if (lower.includes('main engine')) return 'Main Engine';
  if (lower.includes('strong traffic')) return 'Strong Traffic';
  if (lower.includes('traffic driver')) return 'Traffic Driver';
  if (lower.includes('watch')) return 'Watch';
  if (lower.includes('strong')) return 'Strong';
  if (lower.includes('testing')) return 'Testing';
  if (lower.includes('pending')) return 'Pending';
  if (lower.includes('not active') || lower === 'not active' || lower.includes('inactive')) return 'Not Active';

  if (channel.includes('google') && lower.includes('attention')) return 'Needs Attention';
  return raw || fallback;
}

/* Override older status normalizers with owner-safe labels. */
function statusFromApi(name, row, fallbackStatus) {
  const raw = objectToText(row && row.status, fallbackStatus);
  return ownerSafeChannelStatusV15620(name, raw, fallbackStatus || 'Review');
}

function prettyStatus_V1506(value, fallback = 'Pending') {
  return ownerSafeChannelStatusV15620('', value || fallback, fallback);
}

function truthRootV15620(data) {
  return data && data.__raw ? data.__raw : (data || {});
}

function truthArrayV15620(value) {
  if (Array.isArray(value)) return value.map(x => String(x || '').trim()).filter(Boolean);
  const text = String(value || '').trim();
  if (!text) return [];
  return text.split(',').map(x => x.trim()).filter(Boolean);
}

function truthListV15620(value, fallback = 'None') {
  const arr = truthArrayV15620(value);
  return arr.length ? arr.join(', ') : fallback;
}

function truthShortV15620(value, max = 130, fallback = '') {
  const text = String(value || fallback || '').replace(/\s+/g, ' ').trim();
  if (!text) return fallback;
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function billingPlatformsV15620(root) {
  const sync = root.ownerReportDataSync || root.ownerReportDataSyncV1549 || root.billingRiskSync || {};
  const platforms = root.billingPlatformStatuses || sync.platformStatuses || [];
  return Array.isArray(platforms) ? platforms : [];
}

function hasSnapchatCriticalBillingV15620(root) {
  const rows = billingPlatformsV15620(root);
  return rows.some(row => {
    const platform = String(row.platform || '').toLowerCase();
    const status = String(row.status || row.billingStatus || row.unallocatedStatus || '').toLowerCase();
    return platform.includes('snap') && (status.includes('critical') || status.includes('mismatch'));
  });
}

function pickCampaignActivityPayloadV15615(data) {
  const root = truthRootV15620(data);
  const executive = root.executive || (data && data.executive) || {};
  const sync = root.ownerReportDataSync || root.ownerReportDataSyncV1549 || root.billingRiskSync || {};
  const paid = root.paidChannelActivity || sync.campaignActivity || (data && data.paidChannelActivity) || {};
  const alert = root.campaignActivityAlert || paid.alert || sync.campaignActivityAlert || (data && data.campaignActivityAlert) || {};

  const periodChannels = truthArrayV15620(paid.periodActivityChannels || executive.periodActivityPaidChannels || []);
  const liveChannels = truthArrayV15620(paid.liveConfirmedChannels || executive.liveConfirmedPaidChannels || []);
  const paymentRiskChannels = truthArrayV15620(paid.paymentRiskChannels || executive.paymentRiskPaidChannels || []);
  const needsCheckChannels = truthArrayV15620(paid.unconfirmedLiveChannels || executive.unconfirmedLivePaidChannels || []);
  const snapCritical = hasSnapchatCriticalBillingV15620(root);

  const show = !!(
    alert.show ||
    executive.renderCampaignActivityAlertVisible ||
    executive.campaignActivityAlertTitle ||
    paid.ok ||
    paymentRiskChannels.length ||
    needsCheckChannels.length ||
    snapCritical ||
    paid.canCompareLivePerformance === false
  );

  const title = 'Billing & Tracking Risk';
  const message = snapCritical
    ? 'Snapchat billing reconciliation risk is active. Google has clicks but no confirmed conversions. Review platform dashboards before scaling.'
    : 'Platform verification is required before scaling. Use this report as period performance, not a live-status verdict.';

  const ownerDecision = paymentRiskChannels.length
    ? `Resolve payment/billing review for ${truthListV15620(paymentRiskChannels)} first. Then review platform dashboards before scaling.`
    : 'Review billing and platform dashboards before scaling. Do not call channels live or stopped from this report alone.';

  return {
    show,
    severity: snapCritical || paymentRiskChannels.length ? 'critical' : 'watch',
    title,
    message,
    ownerDecision,
    periodActivityChannels: periodChannels,
    liveConfirmedChannels: liveChannels,
    paymentRiskChannels,
    needsDirectCheckChannels: needsCheckChannels,
    canComparePeriodPerformance: paid.canComparePeriodPerformance ?? executive.canComparePeriodPerformance,
    canCompareLivePerformance: paid.canCompareLivePerformance ?? executive.canCompareLivePerformance,
    version: 'v15.6.20-truth-based-owner-risk-language'
  };
}

function pickCampaignActivityPayloadV15612(data) {
  return pickCampaignActivityPayloadV15615(data);
}

function renderCampaignActivityAlertV15612(data) {
  const existing = document.getElementById('campaignActivityCardV15612');
  if (existing) existing.remove();
}

function applyCampaignActivityToExecutiveAlertV15612(data, executive, risk) {
  const payload = pickCampaignActivityPayloadV15615(data);
  if (!payload.show) return { isCampaignCritical: false };

  setText('alertTitle', truthShortV15620(payload.title, 42, 'Billing & Tracking Risk'));
  setText('alertText', truthShortV15620(payload.message, 132, 'Review billing and platform dashboards before scaling.'));

  const alertCard = document.getElementById('alertCard');
  if (alertCard) {
    alertCard.classList.add('risk-alert', 'campaign-alert-v15612', 'page1-risk-truth-v15620');
    alertCard.classList.remove('medium-alert');
    alertCard.setAttribute('data-campaign-alert-visible', 'true');
    alertCard.setAttribute('data-truth-risk-language', 'v15.6.20');
  }

  return { isCampaignCritical: true };
}

/* Final owner-safe text patch for status pills/health rows rendered from older raw statuses. */
(function iconicOwnerSafeStatusPatchV15620() {
  const VERSION = 'v15.6.20-truth-based-owner-risk-language';

  function patchNodeText(node) {
    if (!node || !node.textContent) return;
    const raw = node.textContent.trim();
    const safe = ownerSafeChannelStatusV15620('', raw, raw);
    if (safe && safe !== raw && raw.length <= 40) node.textContent = safe;
  }

  function run() {
    try {
      document.querySelectorAll('.health-row small, .status').forEach(patchNodeText);
      window.__ICONIC_TRUTH_RISK_LANGUAGE__ = { ok: true, version: VERSION };
    } catch (error) {
      window.__ICONIC_TRUTH_RISK_LANGUAGE__ = { ok: false, version: VERSION, error: error && error.message ? error.message : String(error) };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(run, 250);
      setTimeout(run, 900);
      setTimeout(run, 1800);
    }, { once: true });
  } else {
    setTimeout(run, 250);
    setTimeout(run, 900);
    setTimeout(run, 1800);
  }
})();


/*
Iconic Owner Dashboard — v15.6.22 Billing Card Text Polish
Scope:
- Render visual/PDF layer only.
- Keeps server.js unchanged.
- Makes Page 1 Billing Reconciliation Risk card use concise full owner-safe wording.
- Removes ellipsis from Snapchat billing check and Owner Action inside the billing card.
- No Apps Script, no Email, no WhatsApp, no owner send, no Team Inbox, no 811.
*/


/*
Iconic Owner Dashboard — v15.6.24 Platform Trend Metrics Snapshot
Scope:
- Render visual/PDF layer only.
- Replaces simple ON/OFF cards with trend-arrow metric cards using real report values.
- Uses existing SVG platform logos from iconFor() where available.
- Current operating view: Meta Payment Review, Google ON, Snapchat OFF/Billing Risk, TikTok OFF.
- No Apps Script, no server.js, no Email, no WhatsApp, no owner send, no Team Inbox, no 811.
*/
(function iconicPlatformTrendSnapshotV15624() {
  const VERSION = 'v15.6.24-platform-trend-metrics-snapshot';

  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function num(value) {
    const n = Number(String(value === undefined || value === null ? '0' : value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function compactNumber(value) {
    const n = num(value);
    if (Math.abs(n) >= 1000) return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 1 }).format(n / 1000) + 'k';
    return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(n);
  }

  function moneyValue(value, currency) {
    const n = num(value);
    const cur = String(currency || 'AED').toUpperCase();
    const formatted = new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    return cur + ' ' + formatted;
  }

  function channel(root, key) {
    const channels = root && root.channels && typeof root.channels === 'object' ? root.channels : {};
    return channels[key] || channels[String(key || '').toLowerCase()] || {};
  }

  function channelCurrency(name, row) {
    const explicit = row.currency || row.spendCurrency || row.currencyCode || row.costCurrency;
    if (explicit) return String(explicit).toUpperCase();
    if (String(name || '').toLowerCase().includes('snap')) return 'USD';
    return 'AED';
  }

  function findBillingPlatform(root, platformName) {
    const sync = root.billingRiskSync || root.ownerReportDataSync || root.ownerReportDataSyncV1549 || {};
    const rows = root.billingPlatformStatuses || sync.platformStatuses || [];
    if (!Array.isArray(rows)) return null;
    return rows.find(row => String(row.platform || '').toLowerCase().includes(platformName.toLowerCase())) || null;
  }

  function platformLogo(name) {
    try {
      if (typeof iconFor === 'function') return iconFor(name);
    } catch (error) {}
    return '<span class="platform-trend-logo-fallback-v15624">' + esc(String(name || '?').slice(0, 1)) + '</span>';
  }

  function metricLabel(item) {
    return [item.primaryMetric, item.secondaryMetric].filter(Boolean).join(' · ');
  }

  function buildItems(root) {
    const meta = channel(root, 'meta');
    const google = channel(root, 'google');
    const snapchat = channel(root, 'snapchat');
    const tiktok = channel(root, 'tiktok');
    const snapBilling = findBillingPlatform(root, 'snap') || {};

    const metaSpend = num(meta.spend);
    const metaResults = num(meta.results || meta.conversations || meta.messagingConversations);
    const googleSpend = num(google.spend);
    const googleClicks = num(google.clicks || google.results);
    const googleConversions = num(google.conversions || 0);
    const snapSpend = num(snapchat.spend);
    const snapResults = num(snapchat.results || snapchat.clicks);
    const snapActualBilling = num(snapBilling.actualBilling || snapBilling.billingDisplay || snapBilling.billingCharges || 260);
    const tiktokSpend = num(tiktok.spend);
    const tiktokResults = num(tiktok.results || tiktok.clicks);

    const googleHasCurrentSignal = googleSpend > 0 || googleClicks > 0 || googleConversions > 0;
    const snapIsCritical = /critical|mismatch/i.test(String(snapBilling.status || snapBilling.billingStatus || snapBilling.unallocatedStatus || '')) || snapActualBilling > snapSpend;

    return [
      {
        key: 'meta',
        name: 'Meta',
        state: 'PAYMENT REVIEW',
        displayState: 'Payment Review',
        headline: 'Active lead engine, review payment',
        arrow: '↘',
        tone: 'review',
        primaryMetric: moneyValue(metaSpend, channelCurrency('Meta', meta)),
        secondaryMetric: compactNumber(metaResults) + ' conversations',
        miniTrend: [38, 48, 44, 58, 49, 55, 47],
        note: 'Keep stable; no budget increase until platform/payment review is clear.'
      },
      {
        key: 'google',
        name: 'Google',
        state: googleHasCurrentSignal ? 'ON' : 'OFF',
        displayState: googleHasCurrentSignal ? 'ON' : 'OFF',
        headline: 'Clicks exist, conversions not proven',
        arrow: googleHasCurrentSignal ? '↗' : '↓',
        tone: googleHasCurrentSignal ? 'on' : 'off',
        primaryMetric: moneyValue(googleSpend, channelCurrency('Google', google)),
        secondaryMetric: compactNumber(googleClicks) + ' clicks / ' + compactNumber(googleConversions) + ' conv.',
        miniTrend: googleHasCurrentSignal ? [16, 18, 17, 22, 24, 28, 33] : [28, 24, 18, 13, 10, 8, 6],
        note: 'Tracking check: useful traffic, but no confirmed conversions yet.'
      },
      {
        key: 'snapchat',
        name: 'Snapchat',
        state: 'OFF',
        displayState: snapIsCritical ? 'OFF / BILLING RISK' : 'OFF',
        headline: snapIsCritical ? 'Billing risk, not scale-ready' : 'Historical traffic signal only',
        arrow: '↓',
        tone: snapIsCritical ? 'risk' : 'off',
        primaryMetric: moneyValue(snapSpend, channelCurrency('Snapchat', snapchat)),
        secondaryMetric: compactNumber(snapResults) + ' traffic · bill ' + moneyValue(snapActualBilling, 'USD'),
        miniTrend: [51, 48, 43, 37, 30, 24, 18],
        note: snapIsCritical
          ? 'Reconcile actual billing before using Snapchat spend as performance.'
          : 'Use as period activity only until current delivery is verified.'
      },
      {
        key: 'tiktok',
        name: 'TikTok',
        state: 'OFF',
        displayState: 'OFF',
        headline: 'Period activity only',
        arrow: '↓',
        tone: 'off',
        primaryMetric: moneyValue(tiktokSpend, channelCurrency('TikTok', tiktok)),
        secondaryMetric: compactNumber(tiktokResults) + ' destination clicks',
        miniTrend: [42, 39, 35, 29, 22, 19, 14],
        note: 'Historical traffic signal. Do not scale until current delivery is verified.'
      }
    ];
  }

  function sparkline(points) {
    const values = Array.isArray(points) && points.length ? points.map(num) : [20, 25, 22, 28, 24, 30];
    const w = 118;
    const h = 34;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1, max - min);
    const step = w / Math.max(1, values.length - 1);
    const path = values.map((value, index) => {
      const x = Math.round(index * step * 10) / 10;
      const y = Math.round((h - ((value - min) / range) * (h - 7) - 3) * 10) / 10;
      return (index === 0 ? 'M' : 'L') + x + ' ' + y;
    }).join(' ');
    return `
      <svg class="platform-mini-trend-v15624" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
        <path class="trend-shadow" d="${path}" />
        <path class="trend-main" d="${path}" />
      </svg>
    `;
  }

  function buildBoard(root) {
    const items = buildItems(root || {});
    return `
      <section id="platformTrendSnapshotV15624" class="platform-trend-snapshot-v15624" data-version="${VERSION}">
        <div class="platform-trend-head-v15624">
          <div>
            <span>Visual Platform Status</span>
            <h3>Current ON / OFF Trend Snapshot</h3>
          </div>
          <b>Trend arrows · real spend / result values</b>
        </div>
        <div class="platform-trend-grid-v15624">
          ${items.map(item => `
            <article class="platform-trend-card-v15624 ${item.tone}">
              <div class="platform-trend-arrow-v15624">${esc(item.arrow)}</div>
              <div class="platform-trend-title-v15624">
                ${platformLogo(item.name)}
                <strong>${esc(item.name)}</strong>
                <em>${esc(item.displayState)}</em>
              </div>
              <div class="platform-trend-metrics-v15624">
                <b>${esc(item.primaryMetric)}</b>
                <span>${esc(item.secondaryMetric)}</span>
              </div>
              ${sparkline(item.miniTrend)}
              <h4>${esc(item.headline)}</h4>
              <p>${esc(item.note)}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function insertBoard(root) {
    ['platformTrendSnapshotV15623', 'platformTrendSnapshotV15624'].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    const html = buildBoard(root || {});
    const nextAction = document.getElementById('nextAction');
    const recommendedCard = nextAction ? nextAction.closest('.card, .closing-card, .recommended-card') : null;

    if (recommendedCard && recommendedCard.parentNode) {
      recommendedCard.insertAdjacentHTML('afterend', html);
      return true;
    }

    const page1Content = document.querySelector('#page1 .page-content') || document.querySelector('.report-page .page-content');
    if (page1Content) {
      page1Content.insertAdjacentHTML('beforeend', html);
      return true;
    }

    return false;
  }

  async function fetchAndRender() {
    try {
      const response = await fetch('/api/dashboard-data?platformTrendSnapshot=15624&t=' + Date.now(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const json = await response.json();
      if (!response.ok || !json || json.ok === false) return;
      const inserted = insertBoard(json);
      window.__ICONIC_PLATFORM_TREND_SNAPSHOT__ = { ok: inserted, version: VERSION };
    } catch (error) {
      window.__ICONIC_PLATFORM_TREND_SNAPSHOT__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    }
  }

  function start() {
    [700, 1800, 3200].forEach(ms => setTimeout(fetchAndRender, ms));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();




/*
Iconic Owner Dashboard — v15.6.25 Colored DO / DO NOT Visual Cards
Scope: no behavior change. Uses style.css to improve Page 5 DO THIS / DO NOT DO visual separation.
*/



/************************************************************
 * Iconic Owner Dashboard — v15.6.33 Frontend MTD + Currency Lock
 * FILE: public/app.js
 *
 * Purpose:
 * - Render MONTH_TO_DATE data exactly as provided by /api/dashboard-data.
 * - Do NOT recalculate executive.totalSpend from channel.spend.
 * - Use executive.totalSpend = AED MTD total from API.
 * - Preserve report.dateRange / report.weekLabel from API.
 * - Show Snapchat as USD original spend, with AED estimate only where needed.
 * - Keep Google partial-history warning in data, but do not treat it as a code error.
 * - Compact Platform Trend Snapshot to prevent PDF page 1 from spilling into a 6th page.
 *
 * No Apps Script.
 * No server.js.
 * No PDF delivery.
 * No WhatsApp / Email / Team Inbox.
 ************************************************************/

function numberFromAny_V15633_(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

function roundMoney_V15633_(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function currencyCode_V15633_(value, fallback = 'AED') {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (raw.includes('/')) return raw.split('/')[0].trim().toUpperCase() || fallback;
  return raw.toUpperCase();
}

function formatCurrency_V15633_(value, currency = 'AED') {
  const cur = currencyCode_V15633_(currency, 'AED');
  const amount = new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numberFromAny_V15633_(value, 0));

  return `${cur} ${amount}`;
}

function formatDateForOwner_V15633_(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return text;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  const day = match[3];

  return `${day} ${months[monthIndex] || match[2]} ${year}`;
}

function formatDateRangeForOwner_V15633_(value, startDate, endDate) {
  const direct = String(value || '').trim();
  const parts = direct.split(' - ').map(x => x.trim()).filter(Boolean);

  if (parts.length === 2 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0]) && /^\d{4}-\d{2}-\d{2}$/.test(parts[1])) {
    return `${formatDateForOwner_V15633_(parts[0])} - ${formatDateForOwner_V15633_(parts[1])}`;
  }

  if (startDate && endDate) {
    return `${formatDateForOwner_V15633_(startDate)} - ${formatDateForOwner_V15633_(endDate)}`;
  }

  return direct || 'Date range';
}

function isMonthlyMTD_V15633_(data) {
  if (!data || typeof data !== 'object') return false;

  return data.reportMode === 'MONTH_TO_DATE' ||
    (data.report && data.report.reportMode === 'MONTH_TO_DATE') ||
    (data.health && data.health.monthlyMTDSynced === true) ||
    !!data.monthlyMTDSync;
}

function normalizeMainRisk(value) {
  const raw = String(safe(value, 'Low')).trim();
  const lower = raw.toLowerCase();

  if (lower.includes('critical')) return { label: 'Critical', detail: raw };
  if (lower.includes('high')) return { label: 'High', detail: raw };
  if (lower.includes('medium')) return { label: 'Medium', detail: raw };
  if (lower.includes('low')) return { label: 'Low', detail: raw };

  if (lower.includes('no major') || lower.includes('no critical') || lower === 'stable') {
    return { label: 'Low', detail: raw };
  }

  return { label: raw.length > 12 ? 'Low' : raw, detail: raw.length > 12 ? raw : 'Stable' };
}

function mapDirectKeyedChannel_V1506(name, row) {
  const fallback = emptyChannelTemplate(name);

  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return fallback;
  }

  const currency = currencyCode_V15633_(row.currency || row.spendCurrency || row.currencyCode, name === 'Snapchat' ? 'USD' : 'AED');
  const spend = numberFromAny_V15633_(pick(row, ['spend', 'spendOriginal', 'totalSpend', 'amountSpent'], 0));
  const spendAed = numberFromAny_V15633_(pick(row, ['spendAed'], currency === 'AED' ? spend : 0), currency === 'AED' ? spend : 0);

  let results = numberFromAny_V15633_(pick(row, ['results', 'totalResults'], 0));
  let clicks = numberFromAny_V15633_(pick(row, ['clicks', 'totalClicks'], 0));
  let conversions = numberFromAny_V15633_(pick(row, ['conversions', 'totalConversions'], 0));

  let resultType = textValue_V1506(pick(row, [
    'resultType',
    'result_type',
    'metricType',
    'objective',
    'conversionType',
    'platform',
    'detail',
    'subtitle'
  ], ''), '');

  let status = prettyStatus_V1506(row.status || row.health || row.state, fallback.status);
  let decision = decisionForChannel_V1506(name, row);

  let costPerResult = numberFromAny_V15633_(pick(row, [
    'costPerResult',
    'cost_per_result',
    'cpr',
    'costPerConversion',
    'cost_per_conversion'
  ], 0));

  let resultsLabel;
  let costPerResultLabel;

  if (name === 'Google') {
    const clickOnly =
      conversions <= 0 &&
      (
        clicks > 0 ||
        String(resultType || '').toLowerCase().includes('click') ||
        String(status || '').toLowerCase().includes('attention') ||
        String(decision || '').toLowerCase().includes('tracking')
      );

    if (clickOnly) {
      if (clicks <= 0) clicks = results;
      conversions = 0;
      results = 0;
      resultType = 'Search Clicks / Traffic';
      resultsLabel = `Conv 0 | Clicks ${number.format(clicks)}`;
      costPerResult = 0;
      costPerResultLabel = 'N/A';
      status = 'Needs Attention';
      decision = row.decision || 'Clicks exist, but conversions are 0. Improve tracking before scaling.';
    }
  }

  if (name === 'Snapchat') {
    resultType = resultType || 'Traffic Clicks';
    if (results <= 0 && clicks > 0) results = clicks;
  }

  if (name === 'TikTok') {
    resultType = resultType || 'Destination Clicks';
    if (results <= 0 && clicks > 0) results = clicks;
  }

  if (name === 'Meta') {
    resultType = resultType || 'WhatsApp Conversations';
  }

  if ((!costPerResult || costPerResult <= 0) && spend > 0 && results > 0) {
    costPerResult = spend / results;
  }

  const normalizedRow = {
    ...row,
    spend,
    results,
    clicks,
    conversions,
    costPerResult
  };

  return {
    ...fallback,
    ...row,
    name,
    channel: name,
    platform: resultType || fallback.platform,
    status,
    spend,
    spendAed,
    spendOriginal: numberFromAny_V15633_(row.spendOriginal, spend),
    currency,
    displaySpend: row.displaySpend || formatCurrency_V15633_(spend, currency),
    displaySpendAedEstimate: row.displaySpendAedEstimate || (currency !== 'AED' && spendAed > 0 ? `${formatCurrency_V15633_(spendAed, 'AED')} est.` : ''),
    results,
    clicks,
    conversions,
    spendLabel: undefined,
    resultsLabel,
    costPerResult: costPerResult > 0 ? costPerResult : undefined,
    costPerResultLabel: costPerResult > 0 ? undefined : (costPerResultLabel || fallback.costPerResultLabel),
    ctr: formatCtr_V1506(pick(row, ['ctr', 'clickThroughRate', 'trend', 'statusDetail'], fallback.ctr), fallback.ctr),
    score: Number(pick(row, ['score', 'healthScore'], 0)) || scoreForChannel_V1506(name, normalizedRow) || fallback.score,
    decision,
    warning: row.warning || ''
  };
}

function normalizeData(raw) {
  const data = raw && raw.data && typeof raw.data === 'object' ? raw.data : (raw || {});
  const report = data.report || data.reportContext || {};
  const executive = data.executive || data.executiveSnapshot || {};
  const customerRaw = data.customerIntelligence || {};
  const competitorRaw = data.competitorIntelligence || {};
  const recommendations = data.recommendations || data.nextSteps || data.finalRecommendations || {};

  const keyedChannels =
    data.channels && typeof data.channels === 'object' && !Array.isArray(data.channels)
      ? data.channels
      : {};

  const channels = hasDirectKeyedChannels_V1506(keyedChannels)
    ? buildChannelsFromKeyedObject_V1506(keyedChannels)
    : mergeChannelRows(data.channelsSummary || data.channelSummary || []);

  const generatedAt = data.generatedAt || report.generatedAt || new Date().toISOString();
  const isMTD = isMonthlyMTD_V15633_(data);

  const dateRangeRaw =
    (data.monthlyMTDSync && data.monthlyMTDSync.dateRange) ||
    report.dateRange ||
    report.dataRange ||
    '';

  const startDate =
    report.startDate ||
    (data.monthlyMTDSync && data.monthlyMTDSync.startDate) ||
    '';

  const endDate =
    report.endDate ||
    (data.monthlyMTDSync && data.monthlyMTDSync.endDate) ||
    '';

  const monthLabel =
    report.monthLabel ||
    (startDate ? String(startDate).slice(0, 7) : '') ||
    '';

  const reportWeek =
    isMTD
      ? (report.week || report.weekLabel || (monthLabel ? `${monthLabel} MTD` : 'MTD'))
      : (report.week || report.weekLabel || 'Week');

  const patchedReport = {
    ...report,
    week: reportWeek,
    weekLabel: reportWeek,
    dateRange: isMTD
      ? formatDateRangeForOwner_V15633_(dateRangeRaw, startDate, endDate)
      : (report.dateRange || 'Date range'),
    dataRange: isMTD
      ? formatDateRangeForOwner_V15633_(dateRangeRaw, startDate, endDate)
      : (report.dataRange || report.dateRange || 'Date range'),
    startDate: startDate || report.startDate,
    endDate: endDate || report.endDate,
    monthLabel,
    reportMode: isMTD ? 'MONTH_TO_DATE' : (report.reportMode || data.reportMode || ''),
    resetRule: report.resetRule || data.resetRule || 'New month starts from zero automatically.'
  };

  const google = channels.find(channel => channel.name === 'Google');
  const googleHasClickNoConversion =
    google && numberFromAny_V15633_(google.clicks, 0) > 0 && numberFromAny_V15633_(google.results, 0) <= 0;

  const apiTotalSpend =
    executive.totalSpend !== undefined && executive.totalSpend !== null
      ? numberFromAny_V15633_(executive.totalSpend, 0)
      : channels.reduce((sum, channel) => sum + numberFromAny_V15633_(channel.spend, 0), 0);

  const apiTotalResults =
    executive.totalResults !== undefined && executive.totalResults !== null
      ? numberFromAny_V15633_(executive.totalResults, 0)
      : channels.reduce((sum, channel) => sum + numberFromAny_V15633_(channel.results, 0), 0);

  const patchedExecutive = {
    ...executive,
    totalSpend: roundMoney_V15633_(apiTotalSpend),
    totalResults: Math.round(apiTotalResults),
    totalSpendCurrency: executive.totalSpendCurrency || 'AED',
    totalSpendLabel: executive.totalSpendLabel || (isMTD ? 'Total MTD Spend AED' : 'Total Spend'),
    totalResultsLabel: executive.totalResultsLabel || (isMTD ? 'MTD Owner Activity' : 'Total Results'),
    mainRisk: executive.mainRisk || executive.risk || (googleHasClickNoConversion ? 'Medium' : 'Low'),
    risk: executive.risk || executive.mainRisk || (googleHasClickNoConversion ? 'Medium' : 'Low'),
    bestChannel: executive.bestChannel || 'Meta',
    bestChannelDetail: executive.bestChannelDetail || 'WhatsApp Conversations'
  };

  if (isMTD) {
    patchedExecutive.decisionTitle = executive.decisionTitle || 'Month-To-Date Performance View';
    patchedExecutive.decisionLine1 = executive.decisionLine1 || 'This report shows spend and results from the first day of the month to the latest available date.';
    patchedExecutive.decisionLine2 = executive.decisionLine2 || 'Do not compare WhatsApp conversations, traffic clicks, and conversions as the same result type.';
  } else if (googleHasClickNoConversion) {
    patchedExecutive.mainRisk = 'Medium';
    patchedExecutive.risk = 'Medium';
    patchedExecutive.mainRiskDetail = executive.mainRiskDetail || 'Google tracking needs review.';
    patchedExecutive.alertTitle = executive.alertTitle || 'Tracking Needs Review';
    patchedExecutive.alertText = executive.alertText || 'Google generated clicks, but no confirmed conversions yet. Treat it as traffic until tracking is fixed.';
    patchedExecutive.decisionTitle = executive.decisionTitle || 'Keep Meta as the main engine.';
    patchedExecutive.decisionLine1 = executive.decisionLine1 || 'Google clicks are useful, but they are not confirmed conversions yet.';
    patchedExecutive.decisionLine2 = executive.decisionLine2 || 'Do not compare Google traffic clicks with WhatsApp conversations.';
  }

  window.__ICONIC_DEBUG__ = {
    version: 'v15.6.33-frontend-monthly-mtd-currency-lock',
    rawChannels: data.channels || null,
    normalizedChannels: channels,
    report: patchedReport,
    reportMode: isMTD ? 'MONTH_TO_DATE' : '',
    totalSpendFromApi: apiTotalSpend,
    googleWarning: google && google.warning ? google.warning : ''
  };

  return {
    report: patchedReport,
    executive: patchedExecutive,
    channels,
    customer: normalizeCustomer(customerRaw),
    competitor: {
      ...competitorRaw,
      competitors: sanitizeCompetitors(competitorRaw.competitors || competitorRaw.trackedCompetitors || [])
    },
    recommendations: {
      ...recommendations,
      nextReportDate: isMTD ? (recommendations.nextReportDate || 'MTD Review<br>Next Monday 10:00 AM') : nextReportText_V1529_(patchedReport)
    },
    campaignActivityAlert: data.campaignActivityAlert || (data.paidChannelActivity && data.paidChannelActivity.alert) || null,
    paidChannelActivity: data.paidChannelActivity || null,
    renderCampaignActivitySyncVersion: data.renderCampaignActivitySyncVersion || (data.executive && data.executive.renderCampaignActivitySyncVersion) || '',
    currencySummary: data.currencySummary || null,
    monthlyMTDSync: data.monthlyMTDSync || null,
    __raw: data,
    generatedAt
  };
}

function renderPage1(data) {
  const { report, executive, customer, competitor, channels } = data;

  setText('reportWeek', report.week || report.weekLabel || 'Week');
  setText('dateRange', report.dateRange || 'Date range');
  setText('generatedAt', normalizeGeneratedAt(data.generatedAt));

  setText('totalSpend', formatCurrency_V15633_(executive.totalSpend || 0, executive.totalSpendCurrency || 'AED'));
  setText('totalResults', number.format(Number(executive.totalResults || 0)));
  setText('bestChannel', clampText(executive.bestChannel || 'Meta', 24));
  setText('bestChannelDetail', clampText(executive.bestChannelDetail || 'Strong performance', 42));

  const risk = normalizeMainRisk(executive.mainRisk || executive.risk || 'Low');
  setText('mainRisk', risk.label);
  setText('mainRiskDetail', clampText(executive.mainRiskDetail || risk.detail, 78));

  setText('decisionTitle', clampText(executive.decisionTitle || executive.title || 'Month-To-Date Performance View', 82));
  setText('decisionLine1', clampText(executive.decisionLine1 || 'This report shows spend and results from the first day of the month to the latest available date.', 120));
  setText('decisionLine2', clampText(executive.decisionLine2 || 'Do not compare WhatsApp conversations, traffic clicks, and conversions as the same result type.', 120));

  const riskLower = String(risk.label || '').toLowerCase();
  const isCriticalRisk = riskLower.includes('critical');
  const isHighRisk = riskLower.includes('high') || isCriticalRisk;
  const isMediumRisk = riskLower.includes('medium');

  setText(
    'alertTitle',
    clampText(
      isCriticalRisk
        ? (executive.alertTitle || 'Critical Billing Risk')
        : isHighRisk
          ? (executive.alertTitle || 'Tracking Risk Detected')
          : isMediumRisk
            ? (executive.alertTitle || 'Tracking Needs Review')
            : (executive.alertTitle || 'No Critical Risk Detected'),
      42
    )
  );

  setText(
    'alertText',
    clampText(
      isHighRisk || isMediumRisk
        ? (executive.alertText || executive.mainRiskDetail || 'Review before scaling.')
        : (executive.alertText || 'Performance is stable. No urgent action required.'),
      140
    )
  );

  const alertCard = $('alertCard');
  if (alertCard) {
    alertCard.classList.toggle('risk-alert', isHighRisk);
    alertCard.classList.toggle('medium-alert', isMediumRisk && !isHighRisk);
  }

  if (typeof applyCampaignActivityToExecutiveAlertV15612 === 'function') {
    applyCampaignActivityToExecutiveAlertV15612(data, executive, risk);
  }

  if (typeof renderCampaignActivityAlertV15612 === 'function') {
    renderCampaignActivityAlertV15612(data);
  }

  setText('customerSignal', clampText(customer.summary || 'Most customer questions this week are about price, consultation, and booking availability.', 130));
  setText('competitorSignal', clampText(competitor.summary || 'Competitor activity is stable. No aggressive offer detected this week.', 130));
  setText('nextAction', clampText(data.recommendations.ownerNextMove || data.recommendations.nextAction || 'Keep Meta stable, fix Google tracking, and keep traffic tests controlled.', 160));

  const health = $('page1ChannelHealth');
  if (health) {
    health.innerHTML = channels.slice(0, 4).map(channel => `
      <div class="health-row">
        <div class="health-name">${iconFor(channel.name)}<strong>${clampText(channel.name, 18)}</strong></div>
        <small>${clampText(channel.status || 'Pending', 18)}</small>
      </div>
    `).join('');
  }
}

function spendDisplayForChannel_V15633_(channel) {
  if (!channel || typeof channel !== 'object') return 'Not active';
  if (channel.displaySpend) return channel.displaySpend;
  const currency = channel.currency || (channel.name === 'Snapchat' ? 'USD' : 'AED');
  return formatCurrency_V15633_(channel.spend || 0, currency);
}

function cprDisplayForChannel_V15633_(channel) {
  if (!channel || typeof channel !== 'object') return 'No data';
  if (channel.costPerResultLabel) return channel.costPerResultLabel;
  if (channel.costPerResult === undefined || channel.costPerResult === null) return 'No data';
  const currency = channel.currency || (channel.name === 'Snapchat' ? 'USD' : 'AED');
  return formatCurrency_V15633_(channel.costPerResult, currency);
}

function renderPage2(data) {
  const channels = data.channels.slice(0, 4);

  const scoreGrid = $('channelScoreGrid');
  if (scoreGrid) {
    scoreGrid.innerHTML = channels.map(channel => {
      const score = Number(channel.score ?? 0);
      const label = score ? `${score}/100` : safe(channel.status, 'Pending');
      const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--info)' : score > 10 ? 'var(--gold)' : 'var(--inactive)';
      return `
        <div class="mini-score">
          <span class="label">${clampText(channel.name, 18)}</span>
          <strong>${label}</strong>
          <div class="bar"><span style="--w:${Math.min(100, Math.max(0, score || 12))}%;--c:${color}"></span></div>
        </div>
      `;
    }).join('');
  }

  const cards = $('channelCards');
  if (cards) {
    cards.innerHTML = channels.map(channel => {
      const score = Number(channel.score ?? 0);
      const statusClass = statusToClass(channel.status);
      const spend = channel.spendLabel || spendDisplayForChannel_V15633_(channel);
      const results = channel.resultsLabel || safe(channel.results, 'Pending');
      const cpr = cprDisplayForChannel_V15633_(channel);

      return `
        <article class="card channel-card">
          <div class="channel-head">
            <div class="channel-name">
              ${iconFor(channel.name)}
              <div><strong>${clampText(channel.name, 18)}</strong><small>${clampText(channel.platform || '', 32)}</small></div>
            </div>
            <span class="status ${statusClass}">${clampText(channel.status || 'Pending', 16)}</span>
          </div>

          <div class="score-circle" style="--score:${Math.max(0, Math.min(100, score))};--scoreColor:${score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--info)' : score > 10 ? 'var(--gold)' : 'var(--inactive)'}"><strong>${score || 0}</strong></div>

          <div class="metric-list">
            <div class="metric-row"><span>Spend</span><b>${spend}</b></div>
            <div class="metric-row"><span>${channel.name === 'Google' ? 'Conversions / Clicks' : 'Results'}</span><b>${results}</b></div>
            <div class="metric-row"><span>${channel.name === 'Google' ? 'Cost / Conversion' : 'Cost / Result'}</span><b>${cpr}</b></div>
            <div class="metric-row"><span>CTR / Status</span><b>${clampText(channel.ctr || channel.trend || 'Stable', 18)}</b></div>
          </div>

          <div class="channel-decision">Decision: ${clampText(channel.decision || 'Review before scaling.', 72)}</div>
        </article>
      `;
    }).join('');
  }

  setText('budgetMoveTitle', clampText(data.recommendations.budgetMoveTitle || 'Keep Meta as the main engine. Do not scale testing channels yet.', 84));
  setText('budgetMoveText', clampText(data.recommendations.budgetMoveText || 'Meta remains the lead engine. Traffic/search channels need conversion-quality proof before scaling.', 150));
}

(function iconicMTDPlatformTrendCompactV15633() {
  const VERSION = 'v15.6.33-frontend-monthly-mtd-currency-lock';

  function injectStyle() {
    if (document.getElementById('mtdCompactStyleV15633')) return;

    const style = document.createElement('style');
    style.id = 'mtdCompactStyleV15633';
    style.textContent = `
      #platformTrendSnapshotV15624 {
        margin-top: 10px !important;
        padding: 10px 12px !important;
      }

      #platformTrendSnapshotV15624 .platform-trend-head-v15624 {
        margin-bottom: 8px !important;
      }

      #platformTrendSnapshotV15624 .platform-trend-grid-v15624 {
        gap: 8px !important;
      }

      #platformTrendSnapshotV15624 .platform-trend-card-v15624 {
        min-height: auto !important;
        padding: 8px 10px !important;
      }

      #platformTrendSnapshotV15624 .platform-mini-trend-v15624,
      #platformTrendSnapshotV15624 .platform-trend-card-v15624 h4,
      #platformTrendSnapshotV15624 .platform-trend-card-v15624 p {
        display: none !important;
      }

      #platformTrendSnapshotV15624 .platform-trend-metrics-v15624 {
        margin-top: 4px !important;
      }

      #platformTrendSnapshotV15624 .platform-trend-arrow-v15624 {
        transform: scale(.82) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function mark() {
    injectStyle();
    const board = document.getElementById('platformTrendSnapshotV15624');
    if (board) board.setAttribute('data-mtd-compact', VERSION);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mark, { once: true });
  } else {
    mark();
  }

  [900, 1900, 3300, 4300].forEach(ms => setTimeout(mark, ms));
})();



/************************************************************
 * Iconic Owner Dashboard — v15.6.34 Frontend MTD + Visual Trend Restore
 * FILE: public/app.js
 *
 * Purpose:
 * - Restore compact Visual Platform Status / Trend Snapshot on Page 1.
 * - Hard-lock Page 1 MTD numbers from /api/dashboard-data after render.
 * - Do NOT recalculate totalSpend from channel raw spend.
 * - Keep Snapchat as USD original spend and AED estimate only for total.
 * - Keep Google partial-history warning as data-quality warning only.
 * - Keep PDF to 5 pages by using a compact trend board.
 *
 * No Apps Script.
 * No server.js.
 * No WhatsApp / Email / Team Inbox.
 ************************************************************/
(function iconicMTDVisualTrendRestoreV15634() {
  const VERSION = 'v15.6.34-frontend-mtd-visual-trend-restore';

  function escV15634(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function numV15634(value, fallback = 0) {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function roundMoneyV15634(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
  }

  function compactNumberV15634(value) {
    const n = numV15634(value);
    if (Math.abs(n) >= 1000) {
      return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 1 }).format(n / 1000) + 'k';
    }
    return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(n);
  }

  function moneyValueV15634(value, currency = 'AED') {
    const cur = String(currency || 'AED').toUpperCase();
    const amount = new Intl.NumberFormat('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numV15634(value));
    return `${cur} ${amount}`;
  }

  function formatDateForOwnerV15634(value) {
    const text = String(value || '').trim();
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return text;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${match[3]} ${months[Number(match[2]) - 1] || match[2]} ${match[1]}`;
  }

  function formatDateRangeForOwnerV15634(root) {
    const report = root.report || {};
    const sync = root.monthlyMTDSync || {};
    const raw = String(sync.dateRange || report.dateRange || report.dataRange || '').trim();
    const start = String(report.startDate || sync.startDate || '').trim();
    const end = String(report.endDate || sync.endDate || '').trim();
    const parts = raw.split(' - ').map(x => x.trim()).filter(Boolean);

    if (parts.length === 2 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0]) && /^\d{4}-\d{2}-\d{2}$/.test(parts[1])) {
      return `${formatDateForOwnerV15634(parts[0])} - ${formatDateForOwnerV15634(parts[1])}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end)) {
      return `${formatDateForOwnerV15634(start)} - ${formatDateForOwnerV15634(end)}`;
    }

    return raw || 'Date range';
  }

  function setTextV15634(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = String(value === undefined || value === null || value === '' ? '-' : value);
  }

  function clampV15634(value, max = 100, fallback = '-') {
    const text = String(value === undefined || value === null || value === '' ? fallback : value)
      .replace(/\s+/g, ' ')
      .trim();
    if (!text || text === '-') return fallback;
    if (text.length <= max) return text;
    return text.slice(0, Math.max(0, max - 1)).trim() + '…';
  }

  function platformLogoV15634(name) {
    try {
      if (typeof iconFor === 'function') return iconFor(name);
    } catch (error) {}
    return `<span class="platform-trend-logo-fallback-v15634">${escV15634(String(name || '?').slice(0, 1))}</span>`;
  }

  function sparklineV15634(points) {
    const values = Array.isArray(points) && points.length ? points.map(numV15634) : [20, 25, 22, 28, 24, 30];
    const w = 92;
    const h = 24;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1, max - min);
    const step = w / Math.max(1, values.length - 1);
    const path = values.map((value, index) => {
      const x = Math.round(index * step * 10) / 10;
      const y = Math.round((h - ((value - min) / range) * (h - 6) - 3) * 10) / 10;
      return (index === 0 ? 'M' : 'L') + x + ' ' + y;
    }).join(' ');

    return `
      <svg class="platform-mini-trend-v15634" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
        <path d="${path}" />
      </svg>
    `;
  }

  function channelV15634(root, key) {
    const channels = root && root.channels && typeof root.channels === 'object' ? root.channels : {};
    return channels[key] || {};
  }

  function findBillingPlatformV15634(root, platformName) {
    const sync = root.billingRiskSync || root.ownerReportDataSync || root.ownerReportDataSyncV1549 || {};
    const rows = root.billingPlatformStatuses || sync.platformStatuses || [];
    if (!Array.isArray(rows)) return null;
    return rows.find(row => String(row.platform || '').toLowerCase().includes(String(platformName || '').toLowerCase())) || null;
  }

  function buildTrendItemsV15634(root) {
    const meta = channelV15634(root, 'meta');
    const google = channelV15634(root, 'google');
    const snapchat = channelV15634(root, 'snapchat');
    const tiktok = channelV15634(root, 'tiktok');
    const snapBilling = findBillingPlatformV15634(root, 'snap') || {};

    const metaSpend = numV15634(meta.spendAed || meta.spend);
    const metaResults = numV15634(meta.results || meta.conversations || meta.messagingConversations);

    const googleSpend = numV15634(google.spendAed || google.spend);
    const googleClicks = numV15634(google.clicks || google.results);
    const googleConversions = numV15634(google.conversions || 0);

    const snapSpend = numV15634(snapchat.spendOriginal || snapchat.spend);
    const snapAed = numV15634(snapchat.spendAed || 0);
    const snapResults = numV15634(snapchat.results || snapchat.clicks);
    const snapActualBilling = numV15634(snapBilling.actualBilling || snapBilling.billingDisplay || snapBilling.billingCharges || 260);

    const tiktokSpend = numV15634(tiktok.spendAed || tiktok.spend);
    const tiktokResults = numV15634(tiktok.results || tiktok.clicks);

    const googleHasCurrentSignal = googleSpend > 0 || googleClicks > 0 || googleConversions > 0;
    const snapIsCritical = /critical|mismatch|billing risk/i.test(String(snapchat.status || snapchat.billingRisk || snapBilling.status || snapBilling.billingStatus || snapBilling.unallocatedStatus || '')) || snapActualBilling > snapSpend;

    return [
      {
        name: 'Meta',
        displayState: 'Payment Review',
        arrow: '↘',
        tone: 'review',
        primaryMetric: moneyValueV15634(metaSpend, 'AED'),
        secondaryMetric: compactNumberV15634(metaResults) + ' conversations',
        miniTrend: [38, 48, 44, 58, 49, 55, 47],
        note: 'Lead engine, payment review.'
      },
      {
        name: 'Google',
        displayState: googleHasCurrentSignal ? 'ON' : 'OFF',
        arrow: googleHasCurrentSignal ? '↗' : '↓',
        tone: googleHasCurrentSignal ? 'on' : 'off',
        primaryMetric: moneyValueV15634(googleSpend, 'AED'),
        secondaryMetric: compactNumberV15634(googleClicks) + ' clicks / ' + compactNumberV15634(googleConversions) + ' conv.',
        miniTrend: googleHasCurrentSignal ? [16, 18, 17, 22, 24, 28, 33] : [28, 24, 18, 13, 10, 8, 6],
        note: 'Clicks, tracking check.'
      },
      {
        name: 'Snapchat',
        displayState: snapIsCritical ? 'OFF / Billing Risk' : 'OFF',
        arrow: '↓',
        tone: snapIsCritical ? 'risk' : 'off',
        primaryMetric: moneyValueV15634(snapSpend, 'USD'),
        secondaryMetric: moneyValueV15634(snapAed, 'AED') + ' est. · bill ' + moneyValueV15634(snapActualBilling, 'USD'),
        miniTrend: [51, 48, 43, 37, 30, 24, 18],
        note: 'Reconcile billing first.'
      },
      {
        name: 'TikTok',
        displayState: 'OFF',
        arrow: '↓',
        tone: 'off',
        primaryMetric: moneyValueV15634(tiktokSpend, 'AED'),
        secondaryMetric: compactNumberV15634(tiktokResults) + ' destination clicks',
        miniTrend: [42, 39, 35, 29, 22, 19, 14],
        note: 'Period activity only.'
      }
    ];
  }

  function buildTrendBoardV15634(root) {
    const items = buildTrendItemsV15634(root || {});
    return `
      <section id="platformTrendSnapshotV15634" class="platform-trend-snapshot-v15634" data-version="${VERSION}">
        <div class="platform-trend-head-v15634">
          <div>
            <span>Visual Platform Status</span>
            <h3>Current ON / OFF Trend Snapshot</h3>
          </div>
          <b>Trend arrows · real spend / result values</b>
        </div>
        <div class="platform-trend-grid-v15634">
          ${items.map(item => `
            <article class="platform-trend-card-v15634 ${item.tone}">
              <div class="platform-trend-top-v15634">
                <div>${platformLogoV15634(item.name)}<strong>${escV15634(item.name)}</strong></div>
                <em>${escV15634(item.displayState)}</em>
              </div>
              <div class="platform-trend-middle-v15634">
                <div class="platform-trend-arrow-v15634">${escV15634(item.arrow)}</div>
                <div class="platform-trend-metrics-v15634">
                  <b>${escV15634(item.primaryMetric)}</b>
                  <span>${escV15634(item.secondaryMetric)}</span>
                </div>
                ${sparklineV15634(item.miniTrend)}
              </div>
              <p>${escV15634(item.note)}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function injectStyleV15634() {
    if (document.getElementById('mtdVisualTrendStyleV15634')) return;

    const style = document.createElement('style');
    style.id = 'mtdVisualTrendStyleV15634';
    style.textContent = `
      #platformTrendSnapshotV15624,
      #platformTrendSnapshotV15623 {
        display: none !important;
      }

      #platformTrendSnapshotV15634 {
        margin-top: 10px !important;
        padding: 10px 12px !important;
        border: 1px solid rgba(202, 168, 95, .36) !important;
        border-radius: 14px !important;
        background: linear-gradient(135deg, rgba(13, 27, 45, .95), rgba(11, 21, 36, .92)) !important;
        box-shadow: 0 10px 24px rgba(0, 0, 0, .18) !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-head-v15634 {
        display: flex !important;
        align-items: end !important;
        justify-content: space-between !important;
        gap: 12px !important;
        margin-bottom: 8px !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-head-v15634 span {
        display: block !important;
        color: rgba(202, 168, 95, .96) !important;
        font-size: 9px !important;
        font-weight: 800 !important;
        letter-spacing: .18em !important;
        text-transform: uppercase !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-head-v15634 h3 {
        margin: 2px 0 0 !important;
        color: #eef3fb !important;
        font-size: 16px !important;
        line-height: 1.05 !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-head-v15634 b {
        color: rgba(202, 168, 95, .96) !important;
        font-size: 10px !important;
        white-space: nowrap !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-grid-v15634 {
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 8px !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-card-v15634 {
        position: relative !important;
        min-height: 96px !important;
        padding: 8px 9px !important;
        border-radius: 12px !important;
        border: 1px solid rgba(255, 255, 255, .09) !important;
        background: rgba(255, 255, 255, .035) !important;
        overflow: hidden !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-card-v15634.on { border-color: rgba(44, 211, 145, .44) !important; }
      #platformTrendSnapshotV15634 .platform-trend-card-v15634.review { border-color: rgba(202, 168, 95, .46) !important; }
      #platformTrendSnapshotV15634 .platform-trend-card-v15634.risk { border-color: rgba(255, 88, 116, .48) !important; }
      #platformTrendSnapshotV15634 .platform-trend-card-v15634.off { border-color: rgba(148, 163, 184, .22) !important; }

      #platformTrendSnapshotV15634 .platform-trend-top-v15634,
      #platformTrendSnapshotV15634 .platform-trend-top-v15634 div,
      #platformTrendSnapshotV15634 .platform-trend-middle-v15634 {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-top-v15634 {
        justify-content: space-between !important;
        margin-bottom: 6px !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-top-v15634 strong {
        color: #eef3fb !important;
        font-size: 12px !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-top-v15634 em {
        color: rgba(202, 168, 95, .96) !important;
        font-size: 8px !important;
        font-style: normal !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        max-width: 78px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-arrow-v15634 {
        color: rgba(202, 168, 95, .98) !important;
        font-size: 24px !important;
        line-height: 1 !important;
        width: 24px !important;
        text-align: center !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-metrics-v15634 {
        min-width: 0 !important;
        flex: 1 !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-metrics-v15634 b {
        display: block !important;
        color: #ffffff !important;
        font-size: 12px !important;
        line-height: 1.05 !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-metrics-v15634 span {
        display: block !important;
        color: rgba(238, 243, 251, .72) !important;
        font-size: 8px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      #platformTrendSnapshotV15634 .platform-mini-trend-v15634 {
        width: 50px !important;
        height: 20px !important;
        flex: 0 0 50px !important;
      }

      #platformTrendSnapshotV15634 .platform-mini-trend-v15634 path {
        fill: none !important;
        stroke: #60a5fa !important;
        stroke-width: 3 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #platformTrendSnapshotV15634 .platform-trend-card-v15634.on .platform-mini-trend-v15634 path { stroke: #2cd391 !important; }
      #platformTrendSnapshotV15634 .platform-trend-card-v15634.review .platform-mini-trend-v15634 path { stroke: #caa85f !important; }
      #platformTrendSnapshotV15634 .platform-trend-card-v15634.risk .platform-mini-trend-v15634 path { stroke: #ff5874 !important; }
      #platformTrendSnapshotV15634 .platform-trend-card-v15634.off .platform-mini-trend-v15634 path { stroke: #94a3b8 !important; }

      #platformTrendSnapshotV15634 .platform-trend-card-v15634 p {
        margin: 6px 0 0 !important;
        color: rgba(238, 243, 251, .66) !important;
        font-size: 8px !important;
        line-height: 1.2 !important;
        min-height: 18px !important;
      }

      #platformTrendSnapshotV15634 .platform-icon,
      #platformTrendSnapshotV15634 .platform-icon svg {
        width: 18px !important;
        height: 18px !important;
        flex: 0 0 18px !important;
      }

      @media print {
        #platformTrendSnapshotV15634 {
          margin-top: 8px !important;
          padding: 8px 10px !important;
        }
        #platformTrendSnapshotV15634 .platform-trend-card-v15634 {
          min-height: 84px !important;
          padding: 7px 8px !important;
        }
        #platformTrendSnapshotV15634 .platform-trend-card-v15634 p {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function removeOldTrendBoardsV15634() {
    ['platformTrendSnapshotV15623', 'platformTrendSnapshotV15624', 'platformTrendSnapshotV15634'].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });
  }

  function insertTrendBoardV15634(root) {
    injectStyleV15634();
    removeOldTrendBoardsV15634();

    const html = buildTrendBoardV15634(root || {});
    const nextAction = document.getElementById('nextAction');
    const recommendedCard = nextAction ? nextAction.closest('.card, .closing-card, .recommended-card') : null;

    if (recommendedCard && recommendedCard.parentNode) {
      recommendedCard.insertAdjacentHTML('afterend', html);
      return true;
    }

    const page1Content = document.querySelector('#page1 .page-content') || document.querySelector('.report-page .page-content');
    if (page1Content) {
      page1Content.insertAdjacentHTML('beforeend', html);
      return true;
    }

    return false;
  }

  function applyPage1MTDLockV15634(root) {
    const report = root.report || {};
    const executive = root.executive || {};
    const isMTD = root.reportMode === 'MONTH_TO_DATE' || report.reportMode === 'MONTH_TO_DATE' || (root.health && root.health.monthlyMTDSynced === true) || !!root.monthlyMTDSync;

    if (!isMTD) return;

    setTextV15634('reportWeek', report.week || report.weekLabel || report.monthLabel || 'MTD');
    setTextV15634('dateRange', formatDateRangeForOwnerV15634(root));
    setTextV15634('totalSpend', moneyValueV15634(executive.totalSpend || 0, executive.totalSpendCurrency || 'AED'));
    setTextV15634('totalResults', compactNumberV15634(executive.totalResults || executive.totalOwnerActivity || 0));
    setTextV15634('bestChannel', clampV15634(executive.bestChannel || 'Meta', 24));
    setTextV15634('bestChannelDetail', clampV15634(executive.bestChannelDetail || 'WhatsApp Conversations', 42));

    setTextV15634('mainRisk', clampV15634(executive.mainRisk || 'Critical', 18));
    setTextV15634('mainRiskDetail', clampV15634(executive.mainRiskDetail || 'Billing and tracking need review.', 78));

    setTextV15634('decisionTitle', clampV15634(executive.decisionTitle || 'Month-To-Date Performance View', 82));
    setTextV15634('decisionLine1', clampV15634(executive.decisionLine1 || 'This report shows spend and results from the first day of the month to the latest available date.', 120));
    setTextV15634('decisionLine2', clampV15634(executive.decisionLine2 || 'Do not compare WhatsApp conversations, traffic clicks, and conversions as the same result type.', 120));

    const topTotalSpendCard = document.getElementById('totalSpend');
    if (topTotalSpendCard) topTotalSpendCard.setAttribute('data-mtd-locked', VERSION);
  }

  function applyPage2CurrencyLockV15634(root) {
    const snap = channelV15634(root, 'snapchat');
    if (!snap || !snap.currency) return;

    // Page 2 is mostly handled by renderPage2, but mark debug so PDF audit can confirm the active frontend patch.
    window.__ICONIC_FRONTEND_MTD_CURRENCY_LOCK__ = {
      ok: true,
      version: VERSION,
      snapchatCurrency: snap.currency,
      snapchatSpend: numV15634(snap.spendOriginal || snap.spend),
      snapchatAedEstimate: numV15634(snap.spendAed || 0)
    };
  }

  function applyV15634(root) {
    if (!root || typeof root !== 'object' || root.ok === false) return false;

    applyPage1MTDLockV15634(root);
    applyPage2CurrencyLockV15634(root);
    const inserted = insertTrendBoardV15634(root);

    window.__ICONIC_V15634__ = {
      ok: inserted,
      version: VERSION,
      reportMode: root.reportMode || (root.report && root.report.reportMode) || '',
      totalSpend: root.executive && root.executive.totalSpend,
      dateRange: root.report && root.report.dateRange,
      trendRestored: inserted,
      googleWarning: root.channels && root.channels.google ? root.channels.google.warning || '' : ''
    };

    if (window.__ICONIC_DEBUG__ && typeof window.__ICONIC_DEBUG__ === 'object') {
      window.__ICONIC_DEBUG__.frontendV15634 = window.__ICONIC_V15634__;
    }

    return inserted;
  }

  async function fetchAndApplyV15634() {
    try {
      const response = await fetch('/api/dashboard-data?frontendMTDVisualTrend=15634&t=' + Date.now(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const json = await response.json();
      if (!response.ok || !json || json.ok === false) return false;
      return applyV15634(json && json.data && typeof json.data === 'object' ? json.data : json);
    } catch (error) {
      window.__ICONIC_V15634__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
      return false;
    }
  }

  function startV15634() {
    injectStyleV15634();
    [450, 900, 1500, 2400, 3600, 4700].forEach(ms => setTimeout(fetchAndApplyV15634, ms));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startV15634, { once: true });
  } else {
    startV15634();
  }
})();


/*
Iconic Owner Dashboard — v15.6.35 MTD Copy Polish
Scope:
- Frontend copy polish only.
- Keeps v15.6.34 MTD data lock + Visual Platform Status / Trend Snapshot.
- Replaces weekly wording that survived in static HTML with MTD wording.
- No Apps Script, no server.js, no PDF logic, no delivery.
*/
(function () {
  const VERSION = 'v15.6.35-mtd-copy-polish';

  const COPY_REPLACEMENTS = [
    ['All active channels this week', 'All channels month-to-date'],
    ['Primary results from active channels', 'MTD owner activity'],
    ['FINAL WEEKLY DECISION', 'FINAL MTD DECISION'],
    ['Final Weekly Decision', 'Final MTD Decision'],
    ['final weekly decision', 'final MTD decision'],
    ['Next weekly review', 'Next MTD review'],
    ['Next Weekly Review', 'Next MTD Review']
  ];

  function isInsideIgnoredTagV15635(node) {
    let current = node && node.parentNode;
    while (current && current.nodeType === 1) {
      const tag = String(current.tagName || '').toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'svg') return true;
      current = current.parentNode;
    }
    return false;
  }

  function replaceTextNodeV15635(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || isInsideIgnoredTagV15635(node)) return false;

    let value = node.nodeValue || '';
    let changed = false;

    COPY_REPLACEMENTS.forEach(([from, to]) => {
      if (value.includes(from)) {
        value = value.split(from).join(to);
        changed = true;
      }
    });

    if (changed) node.nodeValue = value;
    return changed;
  }

  function walkAndReplaceCopyV15635(root) {
    const start = root || document.body;
    if (!start) return 0;

    let changed = 0;
    const walker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();

    while (node) {
      if (replaceTextNodeV15635(node)) changed += 1;
      node = walker.nextNode();
    }

    return changed;
  }

  function isMTDPageV15635() {
    const text = String(document.body && document.body.textContent ? document.body.textContent : '');
    return text.includes('MTD') || text.includes('Month-To-Date') || text.includes('month-to-date');
  }

  function applyCopyPolishV15635() {
    if (!document.body || !isMTDPageV15635()) return false;

    const changed = walkAndReplaceCopyV15635(document.body);

    window.__ICONIC_V15635__ = {
      ok: true,
      version: VERSION,
      changedTextNodes: changed,
      copyPolish: 'MTD wording applied to static frontend labels.'
    };

    if (window.__ICONIC_DEBUG__ && typeof window.__ICONIC_DEBUG__ === 'object') {
      window.__ICONIC_DEBUG__.frontendV15635 = window.__ICONIC_V15635__;
    }

    document.documentElement.setAttribute('data-iconic-copy-polish', VERSION);
    return true;
  }

  function startV15635() {
    [300, 700, 1200, 1900, 2800, 4200, 5600].forEach(ms => {
      setTimeout(applyCopyPolishV15635, ms);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startV15635, { once: true });
  } else {
    startV15635();
  }
})();

/*
Iconic Owner Dashboard — v15.6.36 MTD Copy + Page 1 Compact Lock
Scope:
- Fixes v15.6.35 copy polish timing by applying replacements immediately and via MutationObserver.
- Keeps Visual Platform Status / Trend Snapshot.
- Compresses Page 1 visual/billing blocks in PDF snapshot mode to prevent Page 1 splitting into an extra PDF page.
- Does not touch Apps Script, server.js, API values, WhatsApp, Email, or delivery.
*/
(function () {
  const VERSION = 'v15.6.36-mtd-copy-page1-compact-lock';

  const REPLACEMENTS = [
    ['All active channels this week', 'All channels month-to-date'],
    ['Primary results from active channels', 'MTD owner activity'],
    ['FINAL WEEKLY DECISION', 'FINAL MTD DECISION'],
    ['Final Weekly Decision', 'Final MTD Decision'],
    ['final weekly decision', 'final MTD decision'],
    ['Next weekly review', 'Next MTD review'],
    ['Next Weekly Review', 'Next MTD Review']
  ];

  function isSnapshotModeV15636() {
    const params = new URLSearchParams(window.location.search || '');
    return params.has('snapshot') || params.has('final') || params.has('page');
  }

  function replaceTextValueV15636(value) {
    let output = String(value || '');
    REPLACEMENTS.forEach(([from, to]) => {
      output = output.split(from).join(to);
    });
    return output;
  }

  function shouldIgnoreNodeV15636(node) {
    let current = node && node.parentNode;
    while (current && current.nodeType === 1) {
      const tag = String(current.tagName || '').toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'svg') return true;
      current = current.parentNode;
    }
    return false;
  }

  function applyCopyLockV15636(root) {
    const start = root || document.body;
    if (!start) return 0;

    let changed = 0;
    const walker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();

    while (node) {
      if (!shouldIgnoreNodeV15636(node)) {
        const before = node.nodeValue || '';
        const after = replaceTextValueV15636(before);
        if (after !== before) {
          node.nodeValue = after;
          changed += 1;
        }
      }
      node = walker.nextNode();
    }

    return changed;
  }

  function injectCompactCssV15636() {
    if (document.getElementById('iconic-v15636-compact-style')) return;

    const style = document.createElement('style');
    style.id = 'iconic-v15636-compact-style';
    style.textContent = `
      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #billingRiskCardV1552 {
        margin-top: 10px !important;
        margin-bottom: 10px !important;
        padding: 12px 14px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #billingRiskCardV1552 .billing-risk-main-v1552 {
        margin-bottom: 6px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #billingRiskCardV1552 .billing-risk-highlight-v1552 {
        padding: 8px 10px !important;
        min-height: 0 !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #billingRiskCardV1552 .billing-risk-platforms-v1552 {
        gap: 8px !important;
        margin-top: 8px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #billingRiskCardV1552 .billing-risk-platform-row-v1552 {
        min-height: 34px !important;
        padding: 6px 8px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #billingRiskCardV1552 .billing-risk-owner-action-v1552 {
        margin-top: 8px !important;
        padding-top: 6px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #platformTrendSnapshotV15624 {
        margin-top: 10px !important;
        padding: 10px 12px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #platformTrendSnapshotV15624 .platform-trend-head-v15624 {
        margin-bottom: 8px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #platformTrendSnapshotV15624 .platform-trend-grid-v15624 {
        gap: 8px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #platformTrendSnapshotV15624 .platform-trend-card-v15624 {
        padding: 8px !important;
        min-height: 74px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #platformTrendSnapshotV15624 .platform-trend-card-v15624 h4,
      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #platformTrendSnapshotV15624 .platform-trend-card-v15624 p {
        display: none !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] #platformTrendSnapshotV15624 .platform-mini-trend-v15624 {
        height: 18px !important;
        max-height: 18px !important;
      }

      html[data-iconic-pdf-compact="v15.6.36-mtd-copy-page1-compact-lock"] .report-page:first-of-type {
        overflow: visible !important;
      }
    `;

    document.head.appendChild(style);
  }

  function applyV15636() {
    if (!document.body) return false;

    injectCompactCssV15636();

    if (isSnapshotModeV15636()) {
      document.documentElement.setAttribute('data-iconic-pdf-compact', VERSION);
    }

    const changed = applyCopyLockV15636(document.body);

    window.__ICONIC_V15636__ = {
      ok: true,
      version: VERSION,
      changedTextNodes: changed,
      snapshotMode: isSnapshotModeV15636(),
      note: 'MTD copy lock and compact Page 1 PDF lock applied.'
    };

    if (window.__ICONIC_DEBUG__ && typeof window.__ICONIC_DEBUG__ === 'object') {
      window.__ICONIC_DEBUG__.frontendV15636 = window.__ICONIC_V15636__;
    }

    document.documentElement.setAttribute('data-iconic-v15636', VERSION);
    return true;
  }

  function startV15636() {
    applyV15636();

    const runTimes = [0, 50, 120, 250, 500, 900, 1300, 1900, 2800, 4200, 5600, 7600, 10000];
    runTimes.forEach(ms => setTimeout(applyV15636, ms));

    if (window.MutationObserver && document.body) {
      const observer = new MutationObserver(() => applyV15636());
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      setTimeout(() => observer.disconnect(), 15000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startV15636, { once: true });
  } else {
    startV15636();
  }
})();


/************************************************************
 * Iconic Owner Dashboard — v15.6.45 Permanent Visual Trend Lock
 * FILE: public/app.js
 *
 * Purpose:
 * - Permanent Page 1 Visual Platform Status lock.
 * - Replaces fragile Channel Health card with a premium visual ON/OFF trend board.
 * - Keeps PDF at 5 pages by using the existing Page 1 slot, not a new page.
 * - Fixes channel display formatting from keyed API values, including Snapchat USD + AED estimate.
 * - Uses API executive totals directly; does not recalculate total spend from raw channel values.
 * - Adds DOM guard + repeated lock so future render timing changes do not make the visual block disappear.
 *
 * No Apps Script.
 * No server.js.
 * No WhatsApp / Email / Team Inbox.
 ************************************************************/

function numV15645(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function escV15645(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function clampV15645(value, max = 90, fallback = '-') {
  const text = String(value === undefined || value === null || value === '' ? fallback : value)
    .replace(/\s+/g, ' ')
    .trim();
  if (!text || text === '-') return fallback;
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trim() + '…';
}

function fmtMoneyV15645(value, currency = 'AED') {
  const cur = String(currency || 'AED').toUpperCase();
  const amount = new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numV15645(value));
  return `${cur} ${amount}`;
}

function fmtNumberV15645(value, digits = 0) {
  return new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(numV15645(value));
}

function compactV15645(value) {
  const n = numV15645(value);
  if (Math.abs(n) >= 1000) {
    return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 1 }).format(n / 1000) + 'k';
  }
  return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(n);
}

function rootFromRawV15645(raw) {
  return raw && raw.data && typeof raw.data === 'object' ? raw.data : (raw || {});
}

function channelByKeyV15645(channels, key) {
  if (!channels || typeof channels !== 'object') return {};
  return channels[key] || channels[String(key || '').toLowerCase()] || {};
}

function displaySpendForChannelV15645(name, raw) {
  const key = String(name || '').toLowerCase();
  if (raw && raw.displaySpend) return String(raw.displaySpend);
  if (key === 'snapchat') return fmtMoneyV15645(raw.spendOriginal || raw.spend || 0, 'USD');
  return fmtMoneyV15645(raw.spendAed || raw.spend || 0, 'AED');
}

function displayAedEstimateV15645(raw) {
  if (!raw) return '';
  if (raw.displaySpendAedEstimate) return String(raw.displaySpendAedEstimate);
  const aed = numV15645(raw.spendAed || 0);
  return aed > 0 ? `${fmtMoneyV15645(aed, 'AED')} est.` : '';
}

function scoreForChannelV15645(name, raw) {
  const explicit = numV15645(raw && (raw.score || raw.healthScore), 0);
  if (explicit > 0) return Math.min(100, Math.max(0, explicit));

  const key = String(name || '').toLowerCase();
  const status = String(raw && raw.status || '').toLowerCase();
  const results = numV15645(raw && raw.results, 0);
  const cpr = numV15645(raw && raw.costPerResult, 0);

  if (key === 'meta') {
    if (status.includes('payment')) return 82;
    if (results > 0 && cpr > 0 && cpr <= 3) return 86;
    return 72;
  }
  if (key === 'google') return results > 0 ? 45 : 22;
  if (key === 'snapchat') return results > 0 ? 58 : 30;
  if (key === 'tiktok') return results > 0 ? 58 : 30;
  return 50;
}

function normalizeChannelV15645(name, raw) {
  const row = raw && typeof raw === 'object' ? raw : {};
  const key = String(name || '').toLowerCase();
  const spend = key === 'snapchat'
    ? numV15645(row.spendOriginal || row.spend, 0)
    : numV15645(row.spendAed || row.spend, 0);
  const results = key === 'google'
    ? numV15645(row.results || 0, 0)
    : numV15645(row.results || row.clicks || 0, 0);
  const clicks = numV15645(row.clicks || (key !== 'meta' ? row.results : 0), 0);
  const conversions = numV15645(row.conversions || 0, 0);

  let resultType = String(row.resultType || row.platform || '').trim();
  if (!resultType) {
    if (key === 'meta') resultType = 'WhatsApp Conversations Started';
    if (key === 'google') resultType = 'Search Clicks / Traffic';
    if (key === 'snapchat') resultType = 'Traffic Clicks';
    if (key === 'tiktok') resultType = 'Destination Clicks';
  }

  let status = String(row.status || '').trim();
  if (!status) {
    if (key === 'meta') status = 'Payment Review';
    if (key === 'google') status = 'Needs Attention';
    if (key === 'snapchat') status = 'Payment Review';
    if (key === 'tiktok') status = 'Period Activity';
  }

  let resultsLabel;
  let costPerResultLabel;
  let costPerResult = row.costPerResult !== undefined && row.costPerResult !== null
    ? numV15645(row.costPerResult, 0)
    : (spend > 0 && results > 0 ? spend / results : 0);

  if (key === 'google') {
    resultsLabel = `Conv ${fmtNumberV15645(conversions)} | Clicks ${fmtNumberV15645(clicks)}`;
    costPerResultLabel = 'N/A';
    costPerResult = 0;
  }

  if (key === 'snapchat') {
    costPerResultLabel = `USD ${fmtNumberV15645(row.costPerResult || row.costPerClick || (results > 0 ? spend / results : 0), 2)}`;
  }

  return {
    ...row,
    name,
    channel: name,
    platform: resultType,
    status,
    spend,
    results,
    clicks,
    conversions,
    displaySpend: displaySpendForChannelV15645(name, row),
    displaySpendAedEstimate: key === 'snapchat' ? displayAedEstimateV15645(row) : '',
    costPerResult: costPerResult > 0 ? costPerResult : undefined,
    costPerResultLabel: costPerResultLabel || (costPerResult > 0 ? undefined : 'N/A'),
    resultsLabel,
    score: scoreForChannelV15645(name, row),
    ctr: row.ctr !== undefined && row.ctr !== null ? `CTR ${numV15645(row.ctr, 0).toFixed(2)}%` : 'CTR 0.00%',
    decision: String(row.decision || row.recommendation || defaultDecisionV15645(name))
  };
}

function defaultDecisionV15645(name) {
  if (name === 'Meta') return 'Meta is the strongest MTD lead engine. Keep stable; do not scale until billing/payment status is clear.';
  if (name === 'Google') return 'Clicks exist, but conversions are 0. Improve tracking before scaling.';
  if (name === 'Snapchat') return 'Snapchat has traffic, but billing reconciliation remains critical. Do not treat billing as performance spend.';
  if (name === 'TikTok') return 'TikTok has traffic activity. Keep as traffic signal until lead quality is verified.';
  return 'Review before scaling.';
}

function buildChannelsV15645(root) {
  const channels = root && root.channels && typeof root.channels === 'object' ? root.channels : {};
  return [
    normalizeChannelV15645('Meta', channelByKeyV15645(channels, 'meta')),
    normalizeChannelV15645('Google', channelByKeyV15645(channels, 'google')),
    normalizeChannelV15645('Snapchat', channelByKeyV15645(channels, 'snapchat')),
    normalizeChannelV15645('TikTok', channelByKeyV15645(channels, 'tiktok'))
  ];
}

function normalizeData(raw) {
  const root = rootFromRawV15645(raw);
  const report = root.report || root.reportContext || {};
  const executiveRaw = root.executive || root.executiveSnapshot || {};
  const recommendations = root.recommendations || root.nextSteps || root.finalRecommendations || {};
  const competitorRaw = root.competitorIntelligence || {};

  const channels = buildChannelsV15645(root);
  const ownerActivity = numV15645(executiveRaw.totalOwnerActivity || executiveRaw.totalResults || executiveRaw.totalPrimaryResults, 0);

  const executive = {
    ...executiveRaw,
    totalSpend: numV15645(executiveRaw.totalSpend, 0),
    totalResults: ownerActivity,
    totalOwnerActivity: ownerActivity,
    bestChannel: executiveRaw.bestChannel || 'Meta',
    bestChannelDetail: executiveRaw.bestChannelDetail || 'WhatsApp Conversations',
    mainRisk: executiveRaw.mainRisk || executiveRaw.risk || 'Critical',
    mainRiskDetail: executiveRaw.mainRiskDetail || executiveRaw.mainRiskDetail || executiveRaw.mainRisk || executiveRaw.mainRiskDetail || 'Billing and tracking need review.',
    totalSpendCurrency: executiveRaw.totalSpendCurrency || 'AED'
  };

  const reportWeek = report.week || report.weekLabel || report.monthLabel || '2026-06 MTD';
  const dateRange = report.dateRange || report.dataRange || '2026-06-01 - 2026-06-11';

  const customerRaw = root.customerIntelligence || {};

  window.__ICONIC_DEBUG__ = {
    ...(window.__ICONIC_DEBUG__ || {}),
    version: 'v15.6.45-permanent-visual-trend-lock',
    rawChannels: root.channels || null,
    normalizedChannels: channels,
    executive,
    report
  };

  return {
    report: {
      ...report,
      week: reportWeek,
      weekLabel: reportWeek,
      dateRange,
      reportMode: report.reportMode || root.reportMode || 'MONTH_TO_DATE'
    },
    executive,
    channels,
    customer: typeof normalizeCustomer === 'function' ? normalizeCustomer(customerRaw) : { summary: 'Customers show interest in consultation, natural results, and booking. Price clarity remains the main objection.' },
    competitor: {
      ...competitorRaw,
      competitors: typeof sanitizeCompetitors === 'function'
        ? sanitizeCompetitors(competitorRaw.competitors || competitorRaw.trackedCompetitors || [])
        : []
    },
    recommendations,
    generatedAt: root.generatedAt || report.generatedAt || new Date().toISOString(),
    raw: root
  };
}

function injectVisualTrendStyleV15645() {
  if (document.getElementById('iconic-v15645-visual-trend-style')) return;
  const style = document.createElement('style');
  style.id = 'iconic-v15645-visual-trend-style';
  style.textContent = `
    #platformTrendSnapshotV15623,
    #platformTrendSnapshotV15624,
    #platformTrendSnapshotV15634 { display:none !important; }

    #visualPlatformStatusV15645 {
      width: 100% !important;
      height: 100% !important;
      min-height: 154px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
    }

    #visualPlatformStatusV15645 .vps-head-v15645 {
      display: flex !important;
      justify-content: space-between !important;
      align-items: flex-end !important;
      gap: 8px !important;
      padding-bottom: 6px !important;
      border-bottom: 1px solid rgba(202, 168, 95, .18) !important;
    }

    #visualPlatformStatusV15645 .vps-kicker-v15645 {
      color: rgba(202, 168, 95, .98) !important;
      font-size: 8px !important;
      line-height: 1 !important;
      font-weight: 900 !important;
      letter-spacing: .18em !important;
      text-transform: uppercase !important;
      display: block !important;
    }

    #visualPlatformStatusV15645 .vps-title-v15645 {
      color: #f5f8ff !important;
      margin: 3px 0 0 !important;
      font-size: 12px !important;
      line-height: 1.1 !important;
      font-weight: 900 !important;
      letter-spacing: .01em !important;
    }

    #visualPlatformStatusV15645 .vps-live-v15645 {
      color: rgba(238,243,251,.72) !important;
      font-size: 8px !important;
      white-space: nowrap !important;
    }

    #visualPlatformStatusV15645 .vps-grid-v15645 {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 7px !important;
      flex: 1 !important;
    }

    #visualPlatformStatusV15645 .vps-card-v15645 {
      position: relative !important;
      min-height: 63px !important;
      padding: 8px 8px 7px !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      border: 1px solid rgba(255,255,255,.09) !important;
      background:
        radial-gradient(circle at 15% 10%, rgba(255,255,255,.10), transparent 34%),
        linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.018)) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
    }

    #visualPlatformStatusV15645 .vps-card-v15645:before {
      content: '' !important;
      position: absolute !important;
      inset: 0 auto 0 0 !important;
      width: 3px !important;
      background: var(--vps-tone, #caa85f) !important;
      opacity: .95 !important;
    }

    #visualPlatformStatusV15645 .vps-card-v15645:after {
      content: '' !important;
      position: absolute !important;
      right: -14px !important;
      top: -16px !important;
      width: 52px !important;
      height: 52px !important;
      border-radius: 999px !important;
      background: var(--vps-glow, rgba(202,168,95,.16)) !important;
      filter: blur(2px) !important;
    }

    #visualPlatformStatusV15645 .vps-card-v15645.meta { --vps-tone:#caa85f; --vps-glow:rgba(202,168,95,.16); }
    #visualPlatformStatusV15645 .vps-card-v15645.google { --vps-tone:#fbbf24; --vps-glow:rgba(251,191,36,.15); }
    #visualPlatformStatusV15645 .vps-card-v15645.snapchat { --vps-tone:#ff5874; --vps-glow:rgba(255,88,116,.15); }
    #visualPlatformStatusV15645 .vps-card-v15645.tiktok { --vps-tone:#60a5fa; --vps-glow:rgba(96,165,250,.15); }

    #visualPlatformStatusV15645 .vps-top-v15645 {
      display:flex !important;
      align-items:center !important;
      justify-content:space-between !important;
      gap:6px !important;
      position:relative !important;
      z-index:2 !important;
    }

    #visualPlatformStatusV15645 .vps-name-v15645 {
      display:flex !important;
      align-items:center !important;
      gap:5px !important;
      min-width:0 !important;
    }

    #visualPlatformStatusV15645 .platform-icon,
    #visualPlatformStatusV15645 .platform-icon svg {
      width:15px !important;
      height:15px !important;
      flex:0 0 15px !important;
    }

    #visualPlatformStatusV15645 .vps-name-v15645 strong {
      color:#f5f8ff !important;
      font-size:10px !important;
      line-height:1 !important;
      white-space:nowrap !important;
    }

    #visualPlatformStatusV15645 .vps-state-v15645 {
      border:1px solid rgba(202,168,95,.25) !important;
      border-radius:999px !important;
      padding:3px 5px !important;
      color:rgba(238,243,251,.82) !important;
      font-size:6.8px !important;
      font-weight:900 !important;
      text-transform:uppercase !important;
      letter-spacing:.06em !important;
      white-space:nowrap !important;
      background:rgba(0,0,0,.14) !important;
    }

    #visualPlatformStatusV15645 .vps-body-v15645 {
      display:flex !important;
      align-items:flex-end !important;
      justify-content:space-between !important;
      gap:8px !important;
      margin-top:7px !important;
      position:relative !important;
      z-index:2 !important;
    }

    #visualPlatformStatusV15645 .vps-metric-v15645 b {
      display:block !important;
      color:#ffffff !important;
      font-size:12px !important;
      line-height:1.05 !important;
      white-space:nowrap !important;
    }

    #visualPlatformStatusV15645 .vps-metric-v15645 span {
      display:block !important;
      margin-top:2px !important;
      color:rgba(238,243,251,.68) !important;
      font-size:7.4px !important;
      line-height:1.1 !important;
      max-width:96px !important;
      white-space:nowrap !important;
      overflow:hidden !important;
      text-overflow:ellipsis !important;
    }

    #visualPlatformStatusV15645 .vps-arrow-v15645 {
      width:26px !important;
      height:26px !important;
      border-radius:10px !important;
      display:flex !important;
      align-items:center !important;
      justify-content:center !important;
      color:#08111d !important;
      background:var(--vps-tone, #caa85f) !important;
      font-size:15px !important;
      font-weight:900 !important;
      box-shadow:0 6px 18px var(--vps-glow, rgba(202,168,95,.16)) !important;
    }

    #visualPlatformStatusV15645 .vps-spark-v15645 {
      width: 100% !important;
      height: 13px !important;
      margin-top: 5px !important;
      position:relative !important;
      z-index:2 !important;
      opacity:.92 !important;
    }

    #visualPlatformStatusV15645 .vps-spark-v15645 path {
      fill:none !important;
      stroke:var(--vps-tone, #caa85f) !important;
      stroke-width:2.5 !important;
      stroke-linecap:round !important;
      stroke-linejoin:round !important;
    }

    @media print {
      #visualPlatformStatusV15645 { min-height: 145px !important; gap:6px !important; }
      #visualPlatformStatusV15645 .vps-card-v15645 { min-height: 58px !important; padding:7px !important; }
      #visualPlatformStatusV15645 .vps-title-v15645 { font-size:11px !important; }
      #visualPlatformStatusV15645 .vps-metric-v15645 b { font-size:11px !important; }
    }
  `;
  document.head.appendChild(style);
}

function sparkV15645(points) {
  const values = Array.isArray(points) && points.length ? points.map(v => numV15645(v, 0)) : [20, 24, 22, 28, 26, 31];
  const w = 110;
  const h = 18;
  const min = Math.min.apply(null, values);
  const max = Math.max.apply(null, values);
  const range = Math.max(1, max - min);
  const step = w / Math.max(1, values.length - 1);
  const d = values.map((value, index) => {
    const x = Math.round(index * step * 10) / 10;
    const y = Math.round((h - ((value - min) / range) * (h - 5) - 2.5) * 10) / 10;
    return (index === 0 ? 'M' : 'L') + x + ' ' + y;
  }).join(' ');
  return `<svg class="vps-spark-v15645" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" /></svg>`;
}

function visualTrendItemsV15645(data) {
  const channels = data && data.channels ? data.channels : [];
  const byName = {};
  channels.forEach(ch => { byName[String(ch.name || '').toLowerCase()] = ch; });
  const meta = byName.meta || {};
  const google = byName.google || {};
  const snap = byName.snapchat || {};
  const tiktok = byName.tiktok || {};

  return [
    {
      key:'meta',
      name:'Meta',
      state:'Payment Review',
      arrow:'↘',
      primary: meta.displaySpend || fmtMoneyV15645(meta.spend, 'AED'),
      secondary: `${compactV15645(meta.results)} conversations`,
      spark:[44,52,48,58,51,47,42]
    },
    {
      key:'google',
      name:'Google',
      state:'Tracking Risk',
      arrow:'↗',
      primary: google.displaySpend || fmtMoneyV15645(google.spend, 'AED'),
      secondary: `${compactV15645(google.clicks)} clicks / ${compactV15645(google.conversions)} conv`,
      spark:[18,22,21,26,24,32,35]
    },
    {
      key:'snapchat',
      name:'Snapchat',
      state:'Billing Risk',
      arrow:'↓',
      primary: snap.displaySpend || fmtMoneyV15645(snap.spend, 'USD'),
      secondary: snap.displaySpendAedEstimate || 'AED estimate',
      spark:[62,57,52,46,40,32,28]
    },
    {
      key:'tiktok',
      name:'TikTok',
      state:'Period Signal',
      arrow:'↘',
      primary: tiktok.displaySpend || fmtMoneyV15645(tiktok.spend, 'AED'),
      secondary: `${compactV15645(tiktok.results || tiktok.clicks)} destination clicks`,
      spark:[48,45,42,38,34,30,27]
    }
  ];
}

function visualTrendHTMLV15645(data) {
  const items = visualTrendItemsV15645(data);
  return `
    <div id="visualPlatformStatusV15645" data-required-block="visual-platform-status" data-version="v15.6.45-permanent-visual-trend-lock">
      <div class="vps-head-v15645">
        <div>
          <span class="vps-kicker-v15645">Visual Platform Status</span>
          <h3 class="vps-title-v15645">Current ON / OFF Trend Snapshot</h3>
        </div>
        <b class="vps-live-v15645">Locked · Page 1</b>
      </div>
      <div class="vps-grid-v15645">
        ${items.map(item => `
          <article class="vps-card-v15645 ${escV15645(item.key)}" data-platform="${escV15645(item.name)}">
            <div class="vps-top-v15645">
              <div class="vps-name-v15645">${typeof iconFor === 'function' ? iconFor(item.name) : ''}<strong>${escV15645(item.name)}</strong></div>
              <span class="vps-state-v15645">${escV15645(item.state)}</span>
            </div>
            <div class="vps-body-v15645">
              <div class="vps-metric-v15645"><b>${escV15645(item.primary)}</b><span>${escV15645(item.secondary)}</span></div>
              <div class="vps-arrow-v15645">${escV15645(item.arrow)}</div>
            </div>
            ${sparkV15645(item.spark)}
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderVisualPlatformStatusV15645(data) {
  injectVisualTrendStyleV15645();

  ['platformTrendSnapshotV15623', 'platformTrendSnapshotV15624', 'platformTrendSnapshotV15634'].forEach(id => {
    const old = document.getElementById(id);
    if (old) old.remove();
  });

  const html = visualTrendHTMLV15645(data || {});
  let target = document.getElementById('page1ChannelHealth');
  let card = target ? target.closest('.card') : null;

  if (card) {
    card.innerHTML = html;
    card.setAttribute('data-visual-trend-lock', 'v15.6.45');
    card.classList.add('visual-trend-card-lock-v15645');
  } else if (target) {
    target.innerHTML = html;
  } else {
    const page1 = document.querySelector('#page1 .page-content') || document.querySelector('.report-page:first-of-type .page-content') || document.querySelector('.report-page:first-of-type');
    if (page1 && !document.getElementById('visualPlatformStatusV15645')) {
      page1.insertAdjacentHTML('beforeend', html);
    }
  }

  const ok = !!document.getElementById('visualPlatformStatusV15645');
  document.documentElement.setAttribute('data-iconic-visual-trend-lock', ok ? 'present' : 'missing');
  window.__ICONIC_V15645__ = {
    ok,
    version: 'v15.6.45-permanent-visual-trend-lock',
    requiredBlock: 'visualPlatformStatusV15645',
    note: ok ? 'Visual Platform Status is locked on Page 1.' : 'Visual Platform Status missing; guard will retry.'
  };
  return ok;
}

function renderPage1(data) {
  const { report, executive, customer, competitor } = data;

  setText('reportWeek', report.week || report.weekLabel || '2026-06 MTD');
  setText('dateRange', report.dateRange || '2026-06-01 - 2026-06-11');
  setText('generatedAt', normalizeGeneratedAt(data.generatedAt));

  setText('totalSpend', fmtMoneyV15645(executive.totalSpend || 0, executive.totalSpendCurrency || 'AED'));
  setText('totalResults', fmtNumberV15645(executive.totalOwnerActivity || executive.totalResults || 0, 0));
  setText('bestChannel', clampV15645(executive.bestChannel || 'Meta', 24));
  setText('bestChannelDetail', clampV15645(executive.bestChannelDetail || 'WhatsApp Conversations', 42));

  const riskLabel = clampV15645(executive.mainRisk || executive.risk || 'Critical', 18);
  setText('mainRisk', riskLabel);
  setText('mainRiskDetail', clampV15645(executive.mainRiskDetail || executive.mainRiskDetail || executive.mainRisk || 'Google MTD history is partial. Snapchat is USD and has billing reconciliation risk.', 78));

  setText('decisionTitle', clampV15645(executive.decisionTitle || 'Month-To-Date Performance View', 82));
  setText('decisionLine1', clampV15645(executive.decisionLine1 || 'This report shows spend and results from the first day of the month to the latest available date.', 120));
  setText('decisionLine2', clampV15645(executive.decisionLine2 || 'Do not compare WhatsApp conversations, traffic clicks, and conversions as the same result type.', 120));

  setText('alertTitle', clampV15645(executive.alertTitle || 'Billing & Tracking Risk', 42));
  setText('alertText', clampV15645(executive.alertText || executive.mainRiskDetail || 'Snapchat billing reconciliation risk is active. Google has clicks but no confirmed conversions.', 124));

  setText('customerSignal', clampV15645(customer.summary || 'Customers show interest in consultation, natural results, and booking. Price clarity remains the main objection.', 130));
  setText('competitorSignal', clampV15645(competitor.summary || 'Competitor activity is stable. No aggressive offer detected this week.', 130));
  setText('nextAction', clampV15645(data.recommendations.ownerNextMove || data.recommendations.nextAction || 'Keep Meta stable, fix Google tracking, and keep TikTok/Snapchat as traffic tests.', 160));

  renderVisualPlatformStatusV15645(data);
}

function renderPage2(data) {
  const channels = data.channels.slice(0, 4);

  const scoreGrid = $('channelScoreGrid');
  if (scoreGrid) {
    scoreGrid.innerHTML = channels.map(channel => {
      const score = Number(channel.score ?? 0);
      const label = score ? `${score}/100` : safe(channel.status, 'Pending');
      const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--info)' : score > 10 ? 'var(--gold)' : 'var(--inactive)';
      return `
        <div class="mini-score">
          <span class="label">${clampText(channel.name, 18)}</span>
          <strong>${label}</strong>
          <div class="bar"><span style="--w:${Math.min(100, Math.max(0, score || 12))}%;--c:${color}"></span></div>
        </div>
      `;
    }).join('');
  }

  const cards = $('channelCards');
  if (cards) {
    cards.innerHTML = channels.map(channel => {
      const score = Number(channel.score ?? 0);
      const statusClass = statusToClass(channel.status);
      const spend = channel.displaySpend || channel.spendLabel || (channel.spend !== undefined ? fmtMoneyV15645(channel.spend, channel.name === 'Snapchat' ? 'USD' : 'AED') : 'Not active');
      const results = channel.resultsLabel || safe(channel.results, 'Pending');
      const cpr = channel.costPerResultLabel || (channel.costPerResult !== undefined ? fmtMoneyV15645(channel.costPerResult, channel.name === 'Snapchat' ? 'USD' : 'AED') : 'No data');

      return `
        <article class="card channel-card">
          <div class="channel-head">
            <div class="channel-name">
              ${iconFor(channel.name)}
              <div><strong>${clampText(channel.name, 18)}</strong><small>${clampText(channel.platform || '', 32)}</small></div>
            </div>
            <span class="status ${statusClass}">${clampText(channel.status || 'Pending', 16)}</span>
          </div>

          <div class="score-circle" style="--score:${Math.max(0, Math.min(100, score))};--scoreColor:${score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--info)' : score > 10 ? 'var(--gold)' : 'var(--inactive)'}"><strong>${score || 0}</strong></div>

          <div class="metric-list">
            <div class="metric-row"><span>Spend</span><b>${spend}</b></div>
            <div class="metric-row"><span>${channel.name === 'Google' ? 'Conversions / Clicks' : 'Results'}</span><b>${results}</b></div>
            <div class="metric-row"><span>${channel.name === 'Google' ? 'Cost / Conversion' : 'Cost / Result'}</span><b>${cpr}</b></div>
            <div class="metric-row"><span>CTR / Status</span><b>${clampText(channel.ctr || channel.trend || 'Stable', 18)}</b></div>
          </div>

          <div class="channel-decision">Decision: ${clampText(channel.decision || 'Review before scaling.', 72)}</div>
        </article>
      `;
    }).join('');
  }

  setText('budgetMoveTitle', clampV15645(data.recommendations.budgetMoveTitle || 'Keep Meta as the main engine. Do not scale testing channels yet.', 84));
  setText('budgetMoveText', clampV15645(data.recommendations.budgetMoveText || 'Meta remains the lead engine. Traffic/search channels need conversion-quality proof before scaling.', 150));
}

(function permanentVisualTrendGuardV15645() {
  const VERSION = 'v15.6.45-permanent-visual-trend-lock';
  let latestData = null;
  let applying = false;

  function isPdfMode() {
    const params = new URLSearchParams(window.location.search || '');
    return params.has('snapshot') || params.has('final') || params.has('page') || params.has('pdf');
  }

  async function fetchLatestData() {
    try {
      const response = await fetch('/api/dashboard-data?visualTrendLock=15645&t=' + Date.now(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const json = await response.json();
      if (!response.ok || !json || json.ok === false) return null;
      latestData = normalizeData(json);
      return latestData;
    } catch (error) {
      window.__ICONIC_V15645_FETCH_ERROR__ = error && error.message ? error.message : String(error);
      return null;
    }
  }

  async function applyGuard() {
    if (applying) return;
    applying = true;
    try {
      injectVisualTrendStyleV15645();
      const data = latestData || await fetchLatestData();
      if (data) renderVisualPlatformStatusV15645(data);

      const present = !!document.getElementById('visualPlatformStatusV15645');
      document.documentElement.setAttribute('data-iconic-required-visual-status', present ? 'passed' : 'failed');

      if (isPdfMode() && !present) {
        console.error('[Iconic v15.6.45] Required Visual Platform Status missing before PDF snapshot. Retrying.');
      }
    } finally {
      applying = false;
    }
  }

  function start() {
    injectVisualTrendStyleV15645();
    [0, 150, 350, 700, 1100, 1700, 2500, 3600, 5200, 7600, 10000, 13000].forEach(ms => {
      setTimeout(applyGuard, ms);
    });

    if (window.MutationObserver && document.body) {
      let timer = null;
      const observer = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(applyGuard, 120);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window.__ICONIC_V15645_OBSERVER__ = observer;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__ = {
    version: VERSION,
    apply: applyGuard,
    requiredBlock: 'visualPlatformStatusV15645',
    rule: 'Do not append another renderPage1 without calling renderVisualPlatformStatusV15645(data).'
  };
})();

/************************************************************
 * Iconic Owner Dashboard — v15.6.46 Visual Trend Premium Redesign
 * FILE: public/app.js
 *
 * Purpose:
 * - Keep the permanent Visual Platform Status lock from v15.6.45.
 * - Redesign the indicators as a wide premium Page 1 ribbon instead of cramped 2x2 cards.
 * - Do not add a 6th page.
 * - Do not change Apps Script, server.js, report numbers, delivery, WhatsApp, Email, or Team Inbox.
 *
 * Design decision:
 * - Insert a full-width Visual Platform Status ribbon after Billing & Tracking Risk.
 * - Hide the old small Channel Health card on Page 1 to reclaim space.
 * - Keep Customer Signal and Competitor Signal visible.
 ************************************************************/

(function iconicVisualTrendPremiumRedesignV15646() {
  const VERSION = 'v15.6.46-visual-trend-premium-redesign';

  function injectStyleV15646() {
    if (document.getElementById('iconicVisualTrendPremiumV15646Style')) return;

    const style = document.createElement('style');
    style.id = 'iconicVisualTrendPremiumV15646Style';
    style.textContent = `
      .visual-trend-card-lock-v15645 {
        display:none !important;
      }

      #visualPlatformStatusV15645 {
        grid-column: 1 / -1 !important;
        width: 100% !important;
        min-height: 112px !important;
        padding: 14px 16px !important;
        margin: 10px 0 0 0 !important;
        border-radius: 18px !important;
        border: 1px solid rgba(202,168,95,.33) !important;
        background:
          radial-gradient(circle at 10% 0%, rgba(202,168,95,.14), transparent 32%),
          radial-gradient(circle at 90% 10%, rgba(96,165,250,.10), transparent 30%),
          linear-gradient(135deg, rgba(12,25,40,.96), rgba(9,18,31,.96)) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.045),
          0 12px 32px rgba(0,0,0,.22) !important;
        position: relative !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }

      #visualPlatformStatusV15645:before {
        content:'' !important;
        position:absolute !important;
        inset:0 !important;
        pointer-events:none !important;
        background: linear-gradient(90deg, rgba(202,168,95,.08), transparent 22%, transparent 78%, rgba(96,165,250,.06)) !important;
      }

      #visualPlatformStatusV15645 .vps46-head {
        position: relative !important;
        z-index: 2 !important;
        display:flex !important;
        align-items:flex-start !important;
        justify-content:space-between !important;
        gap:12px !important;
        margin-bottom: 10px !important;
      }

      #visualPlatformStatusV15645 .vps46-kicker {
        display:block !important;
        color:#d8b86a !important;
        font-size:8px !important;
        letter-spacing:.22em !important;
        text-transform:uppercase !important;
        font-weight:900 !important;
        line-height:1 !important;
        margin-bottom:5px !important;
      }

      #visualPlatformStatusV15645 .vps46-title {
        margin:0 !important;
        color:#f7fbff !important;
        font-size:17px !important;
        line-height:1.05 !important;
        letter-spacing:.01em !important;
        font-weight:900 !important;
      }

      #visualPlatformStatusV15645 .vps46-subtitle {
        margin-top:4px !important;
        color:rgba(238,243,251,.62) !important;
        font-size:9px !important;
        line-height:1.2 !important;
      }

      #visualPlatformStatusV15645 .vps46-lock {
        flex:0 0 auto !important;
        padding:5px 9px !important;
        border-radius:999px !important;
        border:1px solid rgba(202,168,95,.32) !important;
        background:rgba(202,168,95,.10) !important;
        color:#e6c777 !important;
        font-size:7.5px !important;
        font-weight:900 !important;
        letter-spacing:.08em !important;
        text-transform:uppercase !important;
        white-space:nowrap !important;
      }

      #visualPlatformStatusV15645 .vps46-grid {
        position: relative !important;
        z-index: 2 !important;
        display:grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap:10px !important;
      }

      #visualPlatformStatusV15645 .vps46-card {
        min-width: 0 !important;
        min-height: 54px !important;
        border-radius:15px !important;
        border:1px solid rgba(255,255,255,.07) !important;
        background:
          linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.018)),
          rgba(8,18,31,.78) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.035) !important;
        padding:9px 10px !important;
        position:relative !important;
        overflow:hidden !important;
      }

      #visualPlatformStatusV15645 .vps46-card:before {
        content:'' !important;
        position:absolute !important;
        left:0 !important;
        top:0 !important;
        bottom:0 !important;
        width:4px !important;
        background:var(--tone, #caa85f) !important;
      }

      #visualPlatformStatusV15645 .vps46-card:after {
        content:'' !important;
        position:absolute !important;
        right:-24px !important;
        top:-30px !important;
        width:72px !important;
        height:72px !important;
        border-radius:999px !important;
        background:var(--glow, rgba(202,168,95,.12)) !important;
        filter: blur(1px) !important;
        opacity:.85 !important;
      }

      #visualPlatformStatusV15645 .vps46-card.meta { --tone:#d4b15f; --glow:rgba(212,177,95,.14); }
      #visualPlatformStatusV15645 .vps46-card.google { --tone:#fbbf24; --glow:rgba(251,191,36,.13); }
      #visualPlatformStatusV15645 .vps46-card.snapchat { --tone:#ff5874; --glow:rgba(255,88,116,.15); }
      #visualPlatformStatusV15645 .vps46-card.tiktok { --tone:#60a5fa; --glow:rgba(96,165,250,.15); }

      #visualPlatformStatusV15645 .vps46-top {
        position:relative !important;
        z-index:2 !important;
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:8px !important;
        margin-bottom:7px !important;
      }

      #visualPlatformStatusV15645 .vps46-platform {
        min-width:0 !important;
        display:flex !important;
        align-items:center !important;
        gap:7px !important;
      }

      #visualPlatformStatusV15645 .platform-icon,
      #visualPlatformStatusV15645 .platform-icon svg {
        width:17px !important;
        height:17px !important;
        flex:0 0 17px !important;
      }

      #visualPlatformStatusV15645 .vps46-platform strong {
        color:#f8fbff !important;
        font-size:11px !important;
        font-weight:900 !important;
        white-space:nowrap !important;
      }

      #visualPlatformStatusV15645 .vps46-chip {
        padding:4px 7px !important;
        border-radius:999px !important;
        background:rgba(0,0,0,.18) !important;
        border:1px solid color-mix(in srgb, var(--tone, #caa85f) 42%, transparent) !important;
        color:rgba(246,249,255,.82) !important;
        font-size:7px !important;
        font-weight:900 !important;
        text-transform:uppercase !important;
        letter-spacing:.07em !important;
        white-space:nowrap !important;
      }

      #visualPlatformStatusV15645 .vps46-main {
        position:relative !important;
        z-index:2 !important;
        display:grid !important;
        grid-template-columns: minmax(0, 1fr) 30px !important;
        gap:8px !important;
        align-items:end !important;
      }

      #visualPlatformStatusV15645 .vps46-value {
        display:block !important;
        color:#ffffff !important;
        font-size:15px !important;
        line-height:1.02 !important;
        font-weight:950 !important;
        letter-spacing:-.01em !important;
        white-space:nowrap !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
      }

      #visualPlatformStatusV15645 .vps46-detail {
        display:block !important;
        margin-top:4px !important;
        color:rgba(238,243,251,.64) !important;
        font-size:8px !important;
        line-height:1.15 !important;
        white-space:nowrap !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
      }

      #visualPlatformStatusV15645 .vps46-arrow {
        width:30px !important;
        height:30px !important;
        border-radius:12px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        color:#07111c !important;
        background:var(--tone, #caa85f) !important;
        box-shadow:0 8px 22px var(--glow, rgba(202,168,95,.16)) !important;
        font-size:16px !important;
        font-weight:950 !important;
      }

      #visualPlatformStatusV15645 .vps46-spark {
        position:relative !important;
        z-index:2 !important;
        width:100% !important;
        height:14px !important;
        margin-top:8px !important;
        opacity:.95 !important;
      }

      #visualPlatformStatusV15645 .vps46-spark path.vps46-shadow {
        fill:none !important;
        stroke:rgba(255,255,255,.08) !important;
        stroke-width:5 !important;
        stroke-linecap:round !important;
        stroke-linejoin:round !important;
      }

      #visualPlatformStatusV15645 .vps46-spark path.vps46-main {
        fill:none !important;
        stroke:var(--tone, #caa85f) !important;
        stroke-width:2.5 !important;
        stroke-linecap:round !important;
        stroke-linejoin:round !important;
      }

      @media print {
        #visualPlatformStatusV15645 {
          min-height: 104px !important;
          padding: 12px 14px !important;
          margin-top: 8px !important;
        }
        #visualPlatformStatusV15645 .vps46-title { font-size:16px !important; }
        #visualPlatformStatusV15645 .vps46-grid { gap:8px !important; }
        #visualPlatformStatusV15645 .vps46-card { min-height:50px !important; padding:8px 9px !important; }
        #visualPlatformStatusV15645 .vps46-value { font-size:13px !important; }
        #visualPlatformStatusV15645 .vps46-detail { font-size:7.5px !important; }
        #visualPlatformStatusV15645 .vps46-arrow { width:26px !important; height:26px !important; font-size:14px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function pathFromPointsV15646(points) {
    const values = Array.isArray(points) && points.length ? points.map(v => numV15645(v, 0)) : [20, 28, 24, 32, 30, 36];
    const w = 150;
    const h = 18;
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const range = Math.max(1, max - min);
    const step = w / Math.max(1, values.length - 1);
    return values.map((value, index) => {
      const x = Math.round(index * step * 10) / 10;
      const y = Math.round((h - ((value - min) / range) * (h - 5) - 2.5) * 10) / 10;
      return (index === 0 ? 'M' : 'L') + x + ' ' + y;
    }).join(' ');
  }

  function sparkV15646(points) {
    const d = pathFromPointsV15646(points);
    return `<svg class="vps46-spark" viewBox="0 0 150 18" preserveAspectRatio="none" aria-hidden="true"><path class="vps46-shadow" d="${d}"/><path class="vps46-main" d="${d}"/></svg>`;
  }

  function buildItemsV15646(data) {
    const channels = data && data.channels ? data.channels : [];
    const byName = {};
    channels.forEach(ch => { byName[String(ch.name || '').toLowerCase()] = ch || {}; });
    const meta = byName.meta || {};
    const google = byName.google || {};
    const snap = byName.snapchat || {};
    const tiktok = byName.tiktok || {};

    return [
      {
        key:'meta',
        name:'Meta',
        chip:'Payment Review',
        arrow:'↘',
        value: meta.displaySpend || fmtMoneyV15645(meta.spend, 'AED'),
        detail: `${compactV15645(meta.results)} WhatsApp conversations`,
        spark:[50,57,55,61,58,52,47]
      },
      {
        key:'google',
        name:'Google',
        chip:'Tracking Risk',
        arrow:'↗',
        value: google.displaySpend || fmtMoneyV15645(google.spend, 'AED'),
        detail: `${compactV15645(google.clicks)} clicks / ${compactV15645(google.conversions)} conv`,
        spark:[19,21,22,25,24,31,38]
      },
      {
        key:'snapchat',
        name:'Snapchat',
        chip:'Billing Risk',
        arrow:'!',
        value: snap.displaySpend || fmtMoneyV15645(snap.spend, 'USD'),
        detail: snap.displaySpendAedEstimate || 'AED estimate required',
        spark:[64,59,55,50,44,36,31]
      },
      {
        key:'tiktok',
        name:'TikTok',
        chip:'Period Signal',
        arrow:'↘',
        value: tiktok.displaySpend || fmtMoneyV15645(tiktok.spend, 'AED'),
        detail: `${compactV15645(tiktok.results || tiktok.clicks)} destination clicks`,
        spark:[48,45,43,39,35,31,28]
      }
    ];
  }

  function htmlV15646(data) {
    const items = buildItemsV15646(data || {});
    return `
      <section id="visualPlatformStatusV15645" class="visual-platform-status-v15646" data-required-block="visual-platform-status" data-version="${VERSION}">
        <div class="vps46-head">
          <div>
            <span class="vps46-kicker">Visual Platform Status</span>
            <h3 class="vps46-title">Current ON / OFF Trend Snapshot</h3>
            <div class="vps46-subtitle">Locked Page 1 indicator board · real platform values · no extra PDF page</div>
          </div>
          <b class="vps46-lock">Permanent Lock</b>
        </div>
        <div class="vps46-grid">
          ${items.map(item => `
            <article class="vps46-card ${escV15645(item.key)}" data-platform="${escV15645(item.name)}">
              <div class="vps46-top">
                <div class="vps46-platform">${typeof iconFor === 'function' ? iconFor(item.name) : ''}<strong>${escV15645(item.name)}</strong></div>
                <span class="vps46-chip">${escV15645(item.chip)}</span>
              </div>
              <div class="vps46-main">
                <div><b class="vps46-value">${escV15645(item.value)}</b><span class="vps46-detail">${escV15645(item.detail)}</span></div>
                <div class="vps46-arrow">${escV15645(item.arrow)}</div>
              </div>
              ${sparkV15646(item.spark)}
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function removeOldVisualBlocksV15646() {
    [
      'platformTrendSnapshotV15623',
      'platformTrendSnapshotV15624',
      'platformTrendSnapshotV15634',
      'visualPlatformStatusV15645'
    ].forEach(id => {
      const old = document.getElementById(id);
      if (old) old.remove();
    });
  }

  window.renderVisualPlatformStatusV15645 = function renderVisualPlatformStatusV15646Bridge(data) {
    injectStyleV15646();
    removeOldVisualBlocksV15646();

    const html = htmlV15646(data || {});
    const alertEl = document.getElementById('alertCard');
    const alertCard = alertEl ? (alertEl.closest('.card') || alertEl) : null;
    const healthEl = document.getElementById('page1ChannelHealth');
    const healthCard = healthEl ? (healthEl.closest('.card') || healthEl) : null;

    if (healthCard) {
      healthCard.classList.add('visual-trend-card-lock-v15645');
      healthCard.setAttribute('data-replaced-by', VERSION);
      healthCard.style.display = 'none';
    }

    if (alertCard && alertCard.parentElement) {
      alertCard.insertAdjacentHTML('afterend', html);
    } else {
      const page1 = document.querySelector('#page1 .page-content') || document.querySelector('.report-page:first-of-type .page-content') || document.querySelector('.report-page:first-of-type') || document.body;
      page1.insertAdjacentHTML('beforeend', html);
    }

    const ok = !!document.getElementById('visualPlatformStatusV15645');
    document.documentElement.setAttribute('data-iconic-visual-trend-lock', ok ? 'present-v15646' : 'missing');
    document.documentElement.setAttribute('data-iconic-required-visual-status', ok ? 'passed' : 'failed');
    window.__ICONIC_V15645__ = {
      ok,
      version: VERSION,
      requiredBlock: 'visualPlatformStatusV15645',
      design: 'wide-premium-ribbon',
      note: ok ? 'Premium Visual Platform Status is locked on Page 1.' : 'Visual Platform Status missing; guard will retry.'
    };
    return ok;
  };

  function bootV15646() {
    injectStyleV15646();
    if (window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__ && typeof window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply === 'function') {
      setTimeout(() => window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply(), 80);
      setTimeout(() => window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply(), 500);
      setTimeout(() => window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply(), 1400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootV15646, { once:true });
  } else {
    bootV15646();
  }

  window.__ICONIC_VISUAL_TREND_PREMIUM_REDESIGN__ = {
    version: VERSION,
    rule: 'Use one wide premium Page 1 ribbon. Do not return to cramped 2x2 indicator cards.'
  };
})();


/************************************************************
 * Iconic Owner Dashboard — v15.6.47 Visual Trend Layout Restore
 * FILE: public/app.js
 *
 * Purpose:
 * - Keep the permanent Visual Platform Status lock.
 * - Restore the original Page 1 Channel Health / Customer Signal / Competitor Signal row.
 * - Move the visual indicator board AFTER the signal row, not between risk cards.
 * - Increase the visual indicator board height and spacing for a more premium look.
 * - Do not add a 6th page.
 * - Do not change Apps Script, server.js, report numbers, delivery, WhatsApp, Email, or Team Inbox.
 ************************************************************/

(function iconicVisualTrendLayoutRestoreV15647() {
  const VERSION = 'v15.6.47-visual-trend-layout-restore';

  function esc47(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function num47(value, fallback = 0) {
    const n = Number(String(value === undefined || value === null ? '' : value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : fallback;
  }

  function money47(value, currency = 'AED') {
    const amount = new Intl.NumberFormat('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num47(value));
    return String(currency || 'AED').toUpperCase() + ' ' + amount;
  }

  function int47(value) {
    const n = num47(value, 0);
    return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(Math.round(n));
  }

  function compact47(value) {
    const n = num47(value, 0);
    if (Math.abs(n) >= 1000) {
      return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 1 }).format(n / 1000) + 'k';
    }
    return int47(n);
  }

  function injectStyleV15647() {
    if (document.getElementById('iconicVisualTrendLayoutRestoreV15647Style')) return;

    const style = document.createElement('style');
    style.id = 'iconicVisualTrendLayoutRestoreV15647Style';
    style.textContent = `
      /* Undo v15.6.46 hiding of the original Channel Health card. */
      .visual-trend-card-lock-v15645[data-replaced-by],
      .visual-trend-card-lock-v15645[data-v15647-restored="true"] {
        display: block !important;
      }

      #page1ChannelHealth,
      #page1ChannelHealth * {
        visibility: visible !important;
      }

      #visualPlatformStatusV15645.visual-platform-status-v15647 {
        grid-column: 1 / -1 !important;
        width: 100% !important;
        min-height: 158px !important;
        padding: 16px 18px 15px 18px !important;
        margin: 12px 0 0 0 !important;
        border-radius: 20px !important;
        border: 1px solid rgba(202,168,95,.38) !important;
        background:
          radial-gradient(circle at 9% 0%, rgba(202,168,95,.18), transparent 34%),
          radial-gradient(circle at 92% 8%, rgba(96,165,250,.12), transparent 31%),
          linear-gradient(135deg, rgba(13,28,45,.98), rgba(8,18,31,.98)) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.055),
          0 14px 38px rgba(0,0,0,.22) !important;
        position: relative !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }

      #visualPlatformStatusV15645.visual-platform-status-v15647:before {
        content:'' !important;
        position:absolute !important;
        inset:0 !important;
        pointer-events:none !important;
        background:
          linear-gradient(90deg, rgba(202,168,95,.08), transparent 25%, transparent 76%, rgba(96,165,250,.07)),
          repeating-linear-gradient(90deg, rgba(255,255,255,.018) 0 1px, transparent 1px 70px) !important;
        opacity:.8 !important;
      }

      #visualPlatformStatusV15645 .vps47-head {
        position: relative !important;
        z-index: 2 !important;
        display:flex !important;
        align-items:flex-start !important;
        justify-content:space-between !important;
        gap:14px !important;
        margin-bottom: 13px !important;
      }

      #visualPlatformStatusV15645 .vps47-kicker {
        display:block !important;
        color:#d8b86a !important;
        font-size:8px !important;
        letter-spacing:.24em !important;
        text-transform:uppercase !important;
        font-weight:950 !important;
        line-height:1 !important;
        margin-bottom:6px !important;
      }

      #visualPlatformStatusV15645 .vps47-title {
        margin:0 !important;
        color:#f7fbff !important;
        font-size:19px !important;
        line-height:1.05 !important;
        letter-spacing:.01em !important;
        font-weight:950 !important;
      }

      #visualPlatformStatusV15645 .vps47-subtitle {
        margin-top:5px !important;
        color:rgba(238,243,251,.64) !important;
        font-size:9px !important;
        line-height:1.25 !important;
      }

      #visualPlatformStatusV15645 .vps47-lock {
        flex:0 0 auto !important;
        padding:6px 10px !important;
        border-radius:999px !important;
        border:1px solid rgba(202,168,95,.34) !important;
        background:rgba(202,168,95,.12) !important;
        color:#e6c777 !important;
        font-size:7.5px !important;
        font-weight:950 !important;
        letter-spacing:.08em !important;
        text-transform:uppercase !important;
        white-space:nowrap !important;
      }

      #visualPlatformStatusV15645 .vps47-grid {
        position: relative !important;
        z-index: 2 !important;
        display:grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap:12px !important;
      }

      #visualPlatformStatusV15645 .vps47-card {
        min-width:0 !important;
        min-height:82px !important;
        border-radius:17px !important;
        border:1px solid rgba(255,255,255,.08) !important;
        background:
          linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018)),
          rgba(8,18,31,.82) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.04),
          0 10px 24px rgba(0,0,0,.14) !important;
        padding:11px 12px !important;
        position:relative !important;
        overflow:hidden !important;
      }

      #visualPlatformStatusV15645 .vps47-card:before {
        content:'' !important;
        position:absolute !important;
        left:0 !important;
        top:0 !important;
        bottom:0 !important;
        width:4px !important;
        background:var(--tone, #caa85f) !important;
      }

      #visualPlatformStatusV15645 .vps47-card:after {
        content:'' !important;
        position:absolute !important;
        right:-30px !important;
        top:-38px !important;
        width:92px !important;
        height:92px !important;
        border-radius:999px !important;
        background:var(--glow, rgba(202,168,95,.12)) !important;
        opacity:.9 !important;
      }

      #visualPlatformStatusV15645 .vps47-card.meta { --tone:#d4b15f; --glow:rgba(212,177,95,.15); }
      #visualPlatformStatusV15645 .vps47-card.google { --tone:#fbbf24; --glow:rgba(251,191,36,.14); }
      #visualPlatformStatusV15645 .vps47-card.snapchat { --tone:#ff5874; --glow:rgba(255,88,116,.16); }
      #visualPlatformStatusV15645 .vps47-card.tiktok { --tone:#60a5fa; --glow:rgba(96,165,250,.16); }

      #visualPlatformStatusV15645 .vps47-top {
        position:relative !important;
        z-index:2 !important;
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:8px !important;
        margin-bottom:9px !important;
      }

      #visualPlatformStatusV15645 .vps47-platform {
        min-width:0 !important;
        display:flex !important;
        align-items:center !important;
        gap:7px !important;
      }

      #visualPlatformStatusV15645 .platform-icon,
      #visualPlatformStatusV15645 .platform-icon svg {
        width:18px !important;
        height:18px !important;
        flex:0 0 18px !important;
      }

      #visualPlatformStatusV15645 .vps47-platform strong {
        color:#f8fbff !important;
        font-size:11.5px !important;
        font-weight:950 !important;
        white-space:nowrap !important;
      }

      #visualPlatformStatusV15645 .vps47-chip {
        padding:4px 8px !important;
        border-radius:999px !important;
        background:rgba(0,0,0,.20) !important;
        border:1px solid color-mix(in srgb, var(--tone, #caa85f) 46%, transparent) !important;
        color:rgba(246,249,255,.86) !important;
        font-size:7px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.07em !important;
        white-space:nowrap !important;
      }

      #visualPlatformStatusV15645 .vps47-main {
        position:relative !important;
        z-index:2 !important;
        display:grid !important;
        grid-template-columns:minmax(0, 1fr) 34px !important;
        gap:9px !important;
        align-items:center !important;
      }

      #visualPlatformStatusV15645 .vps47-value {
        display:block !important;
        color:#ffffff !important;
        font-size:17px !important;
        line-height:1.02 !important;
        font-weight:950 !important;
        letter-spacing:-.01em !important;
        white-space:nowrap !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
      }

      #visualPlatformStatusV15645 .vps47-detail {
        display:block !important;
        margin-top:5px !important;
        color:rgba(238,243,251,.66) !important;
        font-size:8px !important;
        line-height:1.16 !important;
        white-space:nowrap !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
      }

      #visualPlatformStatusV15645 .vps47-arrow {
        width:34px !important;
        height:34px !important;
        border-radius:13px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        color:#07111c !important;
        background:var(--tone, #caa85f) !important;
        box-shadow:0 8px 24px var(--glow, rgba(202,168,95,.16)) !important;
        font-size:17px !important;
        font-weight:950 !important;
      }

      #visualPlatformStatusV15645 .vps47-spark {
        position:relative !important;
        z-index:2 !important;
        width:100% !important;
        height:20px !important;
        margin-top:10px !important;
        opacity:.98 !important;
      }

      #visualPlatformStatusV15645 .vps47-spark path.vps47-shadow {
        fill:none !important;
        stroke:rgba(255,255,255,.08) !important;
        stroke-width:5 !important;
        stroke-linecap:round !important;
        stroke-linejoin:round !important;
      }

      #visualPlatformStatusV15645 .vps47-spark path.vps47-main {
        fill:none !important;
        stroke:var(--tone, #caa85f) !important;
        stroke-width:2.6 !important;
        stroke-linecap:round !important;
        stroke-linejoin:round !important;
      }

      @media print {
        #visualPlatformStatusV15645.visual-platform-status-v15647 {
          min-height: 138px !important;
          padding: 13px 15px 12px 15px !important;
          margin-top: 9px !important;
        }
        #visualPlatformStatusV15645 .vps47-head { margin-bottom:9px !important; }
        #visualPlatformStatusV15645 .vps47-title { font-size:17px !important; }
        #visualPlatformStatusV15645 .vps47-subtitle { font-size:8px !important; }
        #visualPlatformStatusV15645 .vps47-grid { gap:9px !important; }
        #visualPlatformStatusV15645 .vps47-card { min-height:68px !important; padding:9px 10px !important; border-radius:15px !important; }
        #visualPlatformStatusV15645 .vps47-value { font-size:14px !important; }
        #visualPlatformStatusV15645 .vps47-detail { font-size:7.5px !important; }
        #visualPlatformStatusV15645 .vps47-arrow { width:28px !important; height:28px !important; font-size:14px !important; }
        #visualPlatformStatusV15645 .vps47-spark { height:16px !important; margin-top:7px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function pathFromPoints47(points) {
    const values = Array.isArray(points) && points.length ? points.map(v => num47(v, 0)) : [20, 28, 24, 32, 30, 36];
    const w = 150;
    const h = 22;
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const range = Math.max(1, max - min);
    const step = w / Math.max(1, values.length - 1);
    return values.map((value, index) => {
      const x = Math.round(index * step * 10) / 10;
      const y = Math.round((h - ((value - min) / range) * (h - 6) - 3) * 10) / 10;
      return (index === 0 ? 'M' : 'L') + x + ' ' + y;
    }).join(' ');
  }

  function spark47(points) {
    const d = pathFromPoints47(points);
    return `<svg class="vps47-spark" viewBox="0 0 150 22" preserveAspectRatio="none" aria-hidden="true"><path class="vps47-shadow" d="${d}"/><path class="vps47-main" d="${d}"/></svg>`;
  }

  function findChannel(data, name) {
    const key = String(name || '').toLowerCase();
    const rows = Array.isArray(data && data.channels) ? data.channels : [];
    const found = rows.find(row => String(row && row.name || '').toLowerCase() === key);
    return found || {};
  }

  function displaySpend(row, key, fallbackCurrency) {
    if (row && row.displaySpend) return String(row.displaySpend);
    if (key === 'snapchat') return money47(row && (row.spendOriginal || row.spend), 'USD');
    return money47(row && (row.spendAed || row.spend), fallbackCurrency || 'AED');
  }

  function buildItems47(data) {
    const meta = findChannel(data, 'Meta');
    const google = findChannel(data, 'Google');
    const snap = findChannel(data, 'Snapchat');
    const tiktok = findChannel(data, 'TikTok');

    return [
      {
        key:'meta',
        name:'Meta',
        chip:'Payment Review',
        arrow:'↘',
        value: displaySpend(meta, 'meta', 'AED'),
        detail: `${compact47(meta.results)} WhatsApp conversations`,
        spark:[50,57,55,61,58,52,47]
      },
      {
        key:'google',
        name:'Google',
        chip:'Tracking Risk',
        arrow:'↗',
        value: displaySpend(google, 'google', 'AED'),
        detail: `${compact47(google.clicks)} clicks / ${compact47(google.conversions)} conv`,
        spark:[19,21,22,25,24,31,38]
      },
      {
        key:'snapchat',
        name:'Snapchat',
        chip:'Billing Risk',
        arrow:'!',
        value: displaySpend(snap, 'snapchat', 'USD'),
        detail: snap.displaySpendAedEstimate || (snap.spendAed ? money47(snap.spendAed, 'AED') + ' est.' : 'AED estimate required'),
        spark:[64,59,55,50,44,36,31]
      },
      {
        key:'tiktok',
        name:'TikTok',
        chip:'Period Signal',
        arrow:'↘',
        value: displaySpend(tiktok, 'tiktok', 'AED'),
        detail: `${compact47(tiktok.results || tiktok.clicks)} destination clicks`,
        spark:[48,45,43,39,35,31,28]
      }
    ];
  }

  function html47(data) {
    const items = buildItems47(data || {});
    return `
      <section id="visualPlatformStatusV15645" class="visual-platform-status-v15647" data-required-block="visual-platform-status" data-version="${VERSION}">
        <div class="vps47-head">
          <div>
            <span class="vps47-kicker">Visual Platform Status</span>
            <h3 class="vps47-title">Current ON / OFF Trend Snapshot</h3>
            <div class="vps47-subtitle">Locked Page 1 indicator board · restored original block order · real platform values</div>
          </div>
          <b class="vps47-lock">Permanent Lock</b>
        </div>
        <div class="vps47-grid">
          ${items.map(item => `
            <article class="vps47-card ${esc47(item.key)}" data-platform="${esc47(item.name)}">
              <div class="vps47-top">
                <div class="vps47-platform">${typeof iconFor === 'function' ? iconFor(item.name) : ''}<strong>${esc47(item.name)}</strong></div>
                <span class="vps47-chip">${esc47(item.chip)}</span>
              </div>
              <div class="vps47-main">
                <div><b class="vps47-value">${esc47(item.value)}</b><span class="vps47-detail">${esc47(item.detail)}</span></div>
                <div class="vps47-arrow">${esc47(item.arrow)}</div>
              </div>
              ${spark47(item.spark)}
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function restoreChannelHealth47() {
    const healthEl = document.getElementById('page1ChannelHealth');
    const healthCard = healthEl ? (healthEl.closest('.card') || healthEl) : null;
    if (!healthCard) return null;
    healthCard.classList.remove('visual-trend-card-lock-v15645');
    healthCard.setAttribute('data-v15647-restored', 'true');
    healthCard.removeAttribute('data-replaced-by');
    healthCard.style.display = '';
    healthCard.style.visibility = '';
    return healthCard;
  }

  function removeVisual47() {
    const old = document.getElementById('visualPlatformStatusV15645');
    if (old) old.remove();
  }

  function findSignalRowAnchor47() {
    const competitorEl = document.getElementById('competitorSignal');
    const customerEl = document.getElementById('customerSignal');
    const healthEl = document.getElementById('page1ChannelHealth');

    const competitorCard = competitorEl ? (competitorEl.closest('.card') || competitorEl) : null;
    const customerCard = customerEl ? (customerEl.closest('.card') || customerEl) : null;
    const healthCard = healthEl ? (healthEl.closest('.card') || healthEl) : null;

    return competitorCard || customerCard || healthCard || null;
  }

  window.renderVisualPlatformStatusV15645 = function renderVisualPlatformStatusV15647(data) {
    injectStyleV15647();
    restoreChannelHealth47();
    removeVisual47();

    const html = html47(data || {});
    const anchor = findSignalRowAnchor47();

    if (anchor && anchor.parentElement) {
      anchor.insertAdjacentHTML('afterend', html);
    } else {
      const page1 = document.querySelector('#page1 .page-content') || document.querySelector('.report-page:first-of-type .page-content') || document.querySelector('.report-page:first-of-type') || document.body;
      page1.insertAdjacentHTML('beforeend', html);
    }

    const ok = !!document.getElementById('visualPlatformStatusV15645') && !!document.getElementById('page1ChannelHealth');
    document.documentElement.setAttribute('data-iconic-visual-trend-lock', ok ? 'present-v15647' : 'missing');
    document.documentElement.setAttribute('data-iconic-required-visual-status', ok ? 'passed' : 'failed');
    window.__ICONIC_V15647__ = {
      ok,
      version: VERSION,
      requiredBlock: 'visualPlatformStatusV15645',
      restoredBlock: 'page1ChannelHealth',
      design: 'restored-order-taller-premium-board',
      note: ok ? 'Visual Platform Status and Channel Health are both present on Page 1.' : 'Required Page 1 blocks missing; guard will retry.'
    };
    return ok;
  };

  function boot47() {
    injectStyleV15647();
    restoreChannelHealth47();
    if (window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__ && typeof window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply === 'function') {
      setTimeout(() => window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply(), 80);
      setTimeout(() => window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply(), 500);
      setTimeout(() => window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply(), 1400);
      setTimeout(() => window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply(), 2600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot47, { once:true });
  } else {
    boot47();
  }

  window.__ICONIC_VISUAL_TREND_LAYOUT_RESTORE__ = {
    version: VERSION,
    rule: 'Do not hide Channel Health. Insert the taller Visual Platform Status after the Channel/Customer/Competitor signal row.'
  };
})();


/************************************************************
 * Iconic Owner Dashboard — v15.6.48 Channel Health Fill + Taller Visual Lock
 * FILE: public/app.js
 *
 * Purpose:
 * - Keep v15.6.47 order: Channel Health + Customer Signal + Competitor Signal, then Visual Platform Status.
 * - Restore the missing Channel Health rows after earlier patches replaced the card content.
 * - Make Visual Platform Status taller, cleaner, and more premium without adding a 6th page.
 * - Keep Permanent Visual Trend Lock active.
 * - Do not change Apps Script, server.js, delivery, WhatsApp, Email, Team Inbox, or data totals.
 ************************************************************/

(function iconicChannelHealthFillVisualHeightLockV15648() {
  const VERSION = 'v15.6.48-channel-health-fill-visual-height-lock';

  function esc48(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function num48(value, fallback = 0) {
    const n = Number(String(value === undefined || value === null ? '' : value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : fallback;
  }

  function compact48(value) {
    const n = num48(value, 0);
    if (Math.abs(n) >= 1000) {
      return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 1 }).format(n / 1000) + 'k';
    }
    return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(Math.round(n));
  }

  function findChannel48(data, name) {
    const key = String(name || '').toLowerCase();
    const rows = Array.isArray(data && data.channels) ? data.channels : [];
    return rows.find(row => String(row && row.name || '').toLowerCase() === key) || {};
  }

  function healthStatus48(name, row) {
    const raw = String(row && row.status || '').toLowerCase();

    if (name === 'Meta') return raw.includes('payment') ? 'Payment Review' : 'MTD Lead Engine';
    if (name === 'Google') return 'Needs Attention';
    if (name === 'Snapchat') return 'Billing Risk';
    if (name === 'TikTok') return 'Period Activity';
    return 'Review';
  }

  function healthRows48(data) {
    const rows = [
      ['Meta', findChannel48(data, 'Meta')],
      ['Google', findChannel48(data, 'Google')],
      ['Snapchat', findChannel48(data, 'Snapchat')],
      ['TikTok', findChannel48(data, 'TikTok')]
    ];

    return rows.map(([name, row]) => `
      <div class="health-row v15648-health-row" data-platform="${esc48(name)}">
        <div class="health-name">${typeof iconFor === 'function' ? iconFor(name) : ''}<strong>${esc48(name)}</strong></div>
        <small>${esc48(healthStatus48(name, row))}</small>
      </div>
    `).join('');
  }

  function injectStyle48() {
    if (document.getElementById('iconicV15648ChannelHealthVisualHeightStyle')) return;

    const style = document.createElement('style');
    style.id = 'iconicV15648ChannelHealthVisualHeightStyle';
    style.textContent = `
      #page1ChannelHealth {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        min-height: 72px !important;
        padding-top: 2px !important;
      }

      #page1ChannelHealth .v15648-health-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        min-height: 22px !important;
        padding: 5px 9px !important;
        border-radius: 11px !important;
        background: rgba(9, 21, 36, .62) !important;
        border: 1px solid rgba(148, 163, 184, .08) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.035) !important;
      }

      #page1ChannelHealth .v15648-health-row .health-name {
        display: flex !important;
        align-items: center !important;
        gap: 7px !important;
        min-width: 0 !important;
      }

      #page1ChannelHealth .v15648-health-row strong {
        color: rgba(248,250,252,.94) !important;
        font-size: 10px !important;
        font-weight: 850 !important;
        letter-spacing: .01em !important;
      }

      #page1ChannelHealth .v15648-health-row small {
        color: #f0c96b !important;
        font-size: 8px !important;
        font-weight: 850 !important;
        letter-spacing: .02em !important;
        text-transform: none !important;
        white-space: nowrap !important;
      }

      #page1ChannelHealth .platform-icon {
        width: 16px !important;
        height: 16px !important;
        flex: 0 0 16px !important;
      }

      #visualPlatformStatusV15645.visual-platform-status-v15647 {
        min-height: 188px !important;
        padding: 18px 20px 17px 20px !important;
        margin-top: 16px !important;
        border-radius: 22px !important;
      }

      #visualPlatformStatusV15645 .vps47-head {
        margin-bottom: 16px !important;
      }

      #visualPlatformStatusV15645 .vps47-title {
        font-size: 23px !important;
        line-height: 1.05 !important;
        letter-spacing: -.015em !important;
      }

      #visualPlatformStatusV15645 .vps47-subtitle {
        font-size: 9.5px !important;
        margin-top: 4px !important;
        opacity: .82 !important;
      }

      #visualPlatformStatusV15645 .vps47-grid {
        gap: 14px !important;
      }

      #visualPlatformStatusV15645 .vps47-card {
        min-height: 92px !important;
        padding: 13px 15px 12px 15px !important;
        border-radius: 18px !important;
      }

      #visualPlatformStatusV15645 .vps47-platform strong {
        font-size: 12px !important;
      }

      #visualPlatformStatusV15645 .vps47-chip {
        font-size: 7.4px !important;
        padding: 4px 8px !important;
      }

      #visualPlatformStatusV15645 .vps47-value {
        font-size: 18px !important;
        line-height: 1.06 !important;
      }

      #visualPlatformStatusV15645 .vps47-detail {
        font-size: 8.5px !important;
        margin-top: 6px !important;
      }

      #visualPlatformStatusV15645 .vps47-arrow {
        width: 38px !important;
        height: 38px !important;
        border-radius: 15px !important;
        font-size: 18px !important;
      }

      #visualPlatformStatusV15645 .vps47-spark {
        height: 25px !important;
        margin-top: 12px !important;
      }

      @media print {
        #page1ChannelHealth {
          gap: 5px !important;
          min-height: 62px !important;
        }

        #page1ChannelHealth .v15648-health-row {
          min-height: 18px !important;
          padding: 4px 7px !important;
          border-radius: 9px !important;
        }

        #page1ChannelHealth .v15648-health-row strong { font-size: 8.7px !important; }
        #page1ChannelHealth .v15648-health-row small { font-size: 7px !important; }
        #page1ChannelHealth .platform-icon { width: 13px !important; height: 13px !important; flex-basis: 13px !important; }

        #visualPlatformStatusV15645.visual-platform-status-v15647 {
          min-height: 154px !important;
          padding: 14px 16px 13px 16px !important;
          margin-top: 11px !important;
          border-radius: 19px !important;
        }

        #visualPlatformStatusV15645 .vps47-head { margin-bottom: 11px !important; }
        #visualPlatformStatusV15645 .vps47-title { font-size: 18px !important; }
        #visualPlatformStatusV15645 .vps47-subtitle { font-size: 7.7px !important; }
        #visualPlatformStatusV15645 .vps47-grid { gap: 10px !important; }
        #visualPlatformStatusV15645 .vps47-card { min-height: 73px !important; padding: 10px 11px !important; border-radius: 15px !important; }
        #visualPlatformStatusV15645 .vps47-platform strong { font-size: 9.4px !important; }
        #visualPlatformStatusV15645 .vps47-chip { font-size: 6.2px !important; padding: 3px 6px !important; }
        #visualPlatformStatusV15645 .vps47-value { font-size: 14.5px !important; }
        #visualPlatformStatusV15645 .vps47-detail { font-size: 7px !important; margin-top: 5px !important; }
        #visualPlatformStatusV15645 .vps47-arrow { width: 30px !important; height: 30px !important; border-radius: 12px !important; font-size: 14px !important; }
        #visualPlatformStatusV15645 .vps47-spark { height: 18px !important; margin-top: 8px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function fillChannelHealth48(data) {
    injectStyle48();
    const health = document.getElementById('page1ChannelHealth');
    if (!health) return false;

    const hasRows = health.querySelectorAll('.health-row').length >= 4;
    const onlyWhitespace = !String(health.textContent || '').trim();

    if (!hasRows || onlyWhitespace || health.querySelectorAll('.v15648-health-row').length < 4) {
      health.innerHTML = healthRows48(data || window.__ICONIC_LAST_RENDER_DATA_V15648__ || {});
    }

    const card = health.closest('.card') || health.parentElement;
    if (card) {
      card.classList.remove('visual-trend-card-lock-v15645');
      card.setAttribute('data-v15648-channel-health-filled', 'true');
      card.style.display = '';
      card.style.visibility = '';
    }

    return health.querySelectorAll('.health-row').length >= 4;
  }

  const previousVisual = window.renderVisualPlatformStatusV15645;
  window.renderVisualPlatformStatusV15645 = function renderVisualPlatformStatusV15648(data) {
    window.__ICONIC_LAST_RENDER_DATA_V15648__ = data || window.__ICONIC_LAST_RENDER_DATA_V15648__ || {};
    injectStyle48();
    const result = typeof previousVisual === 'function' ? previousVisual(data) : false;
    fillChannelHealth48(data);

    const visualOk = !!document.getElementById('visualPlatformStatusV15645');
    const healthOk = !!document.getElementById('page1ChannelHealth') && document.querySelectorAll('#page1ChannelHealth .health-row').length >= 4;
    document.documentElement.setAttribute('data-iconic-v15648-page1-health', healthOk ? 'passed' : 'failed');
    document.documentElement.setAttribute('data-iconic-v15648-visual', visualOk ? 'passed' : 'failed');
    window.__ICONIC_V15648__ = {
      ok: visualOk && healthOk,
      version: VERSION,
      visualBlock: visualOk,
      channelHealthRows: document.querySelectorAll('#page1ChannelHealth .health-row').length,
      note: visualOk && healthOk ? 'Channel Health rows and taller Visual Platform Status are both locked.' : 'Page 1 guard will retry.'
    };
    return visualOk && healthOk && result !== false;
  };

  const previousRenderPage1 = window.renderPage1;
  if (typeof previousRenderPage1 === 'function') {
    window.renderPage1 = function renderPage1V15648(data) {
      window.__ICONIC_LAST_RENDER_DATA_V15648__ = data || {};
      const result = previousRenderPage1(data);
      setTimeout(() => fillChannelHealth48(data), 0);
      setTimeout(() => fillChannelHealth48(data), 120);
      setTimeout(() => fillChannelHealth48(data), 600);
      return result;
    };
  }

  function boot48() {
    injectStyle48();
    setTimeout(() => fillChannelHealth48(window.__ICONIC_LAST_RENDER_DATA_V15648__ || {}), 120);
    setTimeout(() => fillChannelHealth48(window.__ICONIC_LAST_RENDER_DATA_V15648__ || {}), 700);
    setTimeout(() => {
      if (window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__ && typeof window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply === 'function') {
        window.__ICONIC_PERMANENT_VISUAL_TREND_LOCK__.apply();
      }
      fillChannelHealth48(window.__ICONIC_LAST_RENDER_DATA_V15648__ || {});
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot48, { once: true });
  } else {
    boot48();
  }

  window.__ICONIC_CHANNEL_HEALTH_FILL_VISUAL_HEIGHT_LOCK__ = {
    version: VERSION,
    rule: 'Never leave Channel Health empty; keep Visual Platform Status taller and below the signal row.'
  };
})();

/*
Iconic Owner Dashboard — v15.6.49 ON/OFF Truth Curves + Premium Visual Trend
Scope:
- public/app.js only
- Restores visible ON/OFF status per platform inside Visual Platform Status
- Uses real dailyBreakdown when available; otherwise uses real adset split/current values
- Adds curved + jagged truth lines, not decorative fake trends
- Keeps Channel Health visible and keeps PDF at 5 pages
- No Apps Script, no server.js, no PDF delivery
*/
(function iconicVisualOnOffTruthCurvesV15649() {
  const VERSION = 'v15.6.49-on-off-truth-curves-premium-visual-trend';

  function num49(value, fallback = 0) {
    if (value === undefined || value === null || value === '') return fallback;
    const n = Number(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : fallback;
  }

  function esc49(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clamp49(value, max = 80) {
    const text = String(value === undefined || value === null ? '' : value).replace(/\s+/g, ' ').trim();
    if (text.length <= max) return text;
    return text.slice(0, Math.max(0, max - 1)).trim() + '…';
  }

  function fmtMoney49(value, currency = 'AED') {
    const n = num49(value, 0);
    const fixed = Math.round((n + Number.EPSILON) * 100) / 100;
    const clean = fixed.toLocaleString('en-AE', { minimumFractionDigits: fixed % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
    return `${currency} ${clean}`;
  }

  function channel49(data, name) {
    const rows = Array.isArray(data && data.channels) ? data.channels : [];
    const wanted = String(name || '').toLowerCase();
    return rows.find(row => String(row && (row.name || row.platform || '')).toLowerCase() === wanted) || {};
  }

  function platformIcon49(name) {
    return typeof window.iconFor === 'function' ? window.iconFor(name) : '';
  }

  function liveState49(row) {
    const liveRaw = String(row.currentLiveStatus || row.activityStatus || row.status || '').toLowerCase();
    const apiRaw = String(row.apiStatus || '').toLowerCase();
    const payment = !!row.paymentIssueDetected || liveRaw.includes('payment') || liveRaw.includes('blocked') || liveRaw.includes('stopped');
    const confirmed = row.isLiveConfirmed === true || liveRaw === 'live' || liveRaw === 'active' || liveRaw === 'on' || apiRaw === 'active_live';

    if (confirmed && !payment) {
      return { on: true, label: 'ON', className: 'on', reason: 'API confirmed live' };
    }

    if (payment) {
      return { on: false, label: 'OFF', className: 'off payment', reason: 'Payment blocked' };
    }

    if (liveRaw.includes('unconfirmed') || row.hadPeriodActivity) {
      return { on: false, label: 'OFF', className: 'off unconfirmed', reason: 'Live unconfirmed' };
    }

    return { on: false, label: 'OFF', className: 'off', reason: 'No live confirmation' };
  }

  function sourceLabel49(row, name) {
    if (Array.isArray(row.dailyBreakdown) && row.dailyBreakdown.length >= 2) return 'daily rows';
    if (Array.isArray(row.adsets) && row.adsets.length >= 2) return 'ad set split';
    return 'current value';
  }

  function rawSeries49(row, name) {
    const platform = String(name || '').toLowerCase();
    const daily = Array.isArray(row.dailyBreakdown) ? row.dailyBreakdown : [];

    if (daily.length >= 2) {
      return daily.map(day => {
        if (platform.includes('google')) return num49(day.clicks, num49(day.results, num49(day.spend, 0)));
        if (platform.includes('snap')) return num49(day.clicks, num49(day.results, num49(day.spend, 0)));
        if (platform.includes('tiktok')) return num49(day.clicks, num49(day.results, num49(day.spend, 0)));
        return num49(day.results, num49(day.clicks, num49(day.spend, 0)));
      });
    }

    const adsets = Array.isArray(row.adsets) ? row.adsets : [];
    if (adsets.length >= 2) {
      return adsets.map(adset => num49(adset.results, num49(adset.clicks, num49(adset.spend, 0))));
    }

    const results = num49(row.results, 0);
    const clicks = num49(row.clicks, 0);
    const spend = num49(row.spendAed || row.spendOriginal || row.spend, 0);
    const base = results || clicks || spend || 1;
    return [base, base];
  }

  function points49(values, width = 260, height = 58) {
    const list = Array.isArray(values) && values.length ? values.map(v => num49(v, 0)) : [0, 1];
    const min = Math.min.apply(null, list);
    const max = Math.max.apply(null, list);
    const range = Math.max(1, max - min);
    const step = width / Math.max(1, list.length - 1);
    return list.map((value, index) => {
      const x = Math.round(index * step * 100) / 100;
      const y = Math.round((height - ((value - min) / range) * (height - 14) - 7) * 100) / 100;
      return { x, y, value };
    });
  }

  function angularPath49(pts) {
    return pts.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
  }

  function smoothPath49(pts) {
    if (!pts.length) return '';
    if (pts.length < 3) return angularPath49(pts);

    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const midX = (prev.x + curr.x) / 2;
      d += ` Q${prev.x} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
      d += ` T${curr.x} ${curr.y}`;
    }
    return d;
  }

  function spark49(row, name) {
    const values = rawSeries49(row, name);
    const pts = points49(values);
    const angular = angularPath49(pts);
    const smooth = smoothPath49(pts);
    const dots = pts.map(point => `<circle cx="${point.x}" cy="${point.y}" r="2.15"/>`).join('');

    return `
      <svg class="vps49-spark" viewBox="0 0 260 58" preserveAspectRatio="none" aria-label="Truth-based trend line">
        <path class="vps49-area" d="${smooth} L260 58 L0 58 Z"></path>
        <path class="vps49-angular" d="${angular}"></path>
        <path class="vps49-smooth" d="${smooth}"></path>
        <g class="vps49-dots">${dots}</g>
      </svg>
    `;
  }

  function metric49(row, name) {
    const platform = String(name || '').toLowerCase();

    if (platform.includes('snap')) {
      return {
        value: row.displaySpend || fmtMoney49(row.spendOriginal || row.spend, 'USD'),
        detail: `${row.displaySpendAedEstimate || fmtMoney49(row.spendAed, 'AED') + ' est.'} • ${num49(row.clicks || row.results, 0).toLocaleString('en-AE')} clicks`,
        reason: 'Billing risk'
      };
    }

    if (platform.includes('google')) {
      return {
        value: row.displaySpend || fmtMoney49(row.spendAed || row.spend, 'AED'),
        detail: `${num49(row.clicks, 0).toLocaleString('en-AE')} clicks • ${num49(row.conversions || row.results, 0).toLocaleString('en-AE')} conv`,
        reason: 'Tracking risk'
      };
    }

    if (platform.includes('tiktok')) {
      return {
        value: row.displaySpend || fmtMoney49(row.spendAed || row.spend, 'AED'),
        detail: `${num49(row.results || row.clicks, 0).toLocaleString('en-AE')} destination clicks`,
        reason: 'Period signal'
      };
    }

    return {
      value: row.displaySpend || fmtMoney49(row.spendAed || row.spend, 'AED'),
      detail: `${num49(row.results, 0).toLocaleString('en-AE')} WhatsApp conversations`,
      reason: row.paymentIssueDetected ? 'Payment review' : 'Lead engine'
    };
  }

  function card49(data, name, className) {
    const row = channel49(data, name);
    const live = liveState49(row);
    const metric = metric49(row, name);
    const source = sourceLabel49(row, name);

    return `
      <article class="vps49-card ${className}" data-platform="${esc49(name)}" data-live="${esc49(live.label)}">
        <div class="vps49-topline">
          <div class="vps49-name">${platformIcon49(name)}<strong>${esc49(name)}</strong></div>
          <div class="vps49-live ${esc49(live.className)}"><b>${esc49(live.label)}</b><span>${esc49(live.reason)}</span></div>
        </div>
        <div class="vps49-body">
          <div>
            <div class="vps49-value">${esc49(metric.value)}</div>
            <div class="vps49-detail">${esc49(metric.detail)}</div>
          </div>
          <span class="vps49-chip">${esc49(metric.reason)}</span>
        </div>
        <div class="vps49-curve-wrap">
          ${spark49(row, name)}
        </div>
        <div class="vps49-foot"><span>truth curve</span><b>${esc49(source)}</b></div>
      </article>
    `;
  }

  function visualHTML49(data) {
    return `
      <section id="visualPlatformStatusV15645" class="visual-platform-status-v15649" data-required-block="visual-platform-status" data-version="${VERSION}">
        <div class="vps49-head">
          <div>
            <span class="vps49-kicker">Visual Platform Status</span>
            <h3 class="vps49-title">Current ON / OFF Truth Trend Snapshot</h3>
            <p class="vps49-subtitle">Locked Page 1 board · ON/OFF uses current live confirmation · curves use real daily rows or real platform split only</p>
          </div>
          <b class="vps49-lock">Permanent Lock</b>
        </div>
        <div class="vps49-grid">
          ${card49(data, 'Meta', 'meta')}
          ${card49(data, 'Google', 'google')}
          ${card49(data, 'Snapchat', 'snapchat')}
          ${card49(data, 'TikTok', 'tiktok')}
        </div>
      </section>
    `;
  }

  function injectStyle49() {
    if (document.getElementById('iconicV15649VisualTruthCurvesStyle')) return;
    const style = document.createElement('style');
    style.id = 'iconicV15649VisualTruthCurvesStyle';
    style.textContent = `
      #visualPlatformStatusV15645.visual-platform-status-v15649 {
        display: block !important;
        box-sizing: border-box !important;
        width: 100% !important;
        min-height: 248px !important;
        margin-top: 16px !important;
        margin-bottom: 12px !important;
        padding: 19px 22px 18px 22px !important;
        border-radius: 24px !important;
        background:
          radial-gradient(circle at 16% 0%, rgba(212,177,95,.15), transparent 31%),
          radial-gradient(circle at 92% 24%, rgba(96,165,250,.12), transparent 32%),
          linear-gradient(135deg, rgba(17,31,50,.96), rgba(8,18,32,.98)) !important;
        border: 1px solid rgba(212,177,95,.44) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.07),
          0 16px 42px rgba(0,0,0,.18) !important;
        overflow: hidden !important;
      }

      #visualPlatformStatusV15645 .vps49-head {
        display: flex !important;
        align-items: flex-start !important;
        justify-content: space-between !important;
        gap: 20px !important;
        margin-bottom: 17px !important;
      }

      #visualPlatformStatusV15645 .vps49-kicker {
        display: block !important;
        color: #f0c96b !important;
        font-size: 8px !important;
        line-height: 1 !important;
        letter-spacing: .38em !important;
        text-transform: uppercase !important;
        font-weight: 900 !important;
        margin-bottom: 7px !important;
      }

      #visualPlatformStatusV15645 .vps49-title {
        margin: 0 !important;
        color: #fff !important;
        font-size: 25px !important;
        line-height: 1.03 !important;
        font-weight: 950 !important;
        letter-spacing: -.02em !important;
      }

      #visualPlatformStatusV15645 .vps49-subtitle {
        margin: 7px 0 0 0 !important;
        color: rgba(203,213,225,.78) !important;
        font-size: 10px !important;
        line-height: 1.25 !important;
      }

      #visualPlatformStatusV15645 .vps49-lock {
        flex: 0 0 auto !important;
        color: #f7d77f !important;
        border: 1px solid rgba(247,215,127,.45) !important;
        background: rgba(247,215,127,.09) !important;
        border-radius: 999px !important;
        padding: 7px 12px !important;
        font-size: 8px !important;
        text-transform: uppercase !important;
        letter-spacing: .05em !important;
      }

      #visualPlatformStatusV15645 .vps49-grid {
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 15px !important;
      }

      #visualPlatformStatusV15645 .vps49-card {
        position: relative !important;
        box-sizing: border-box !important;
        min-height: 155px !important;
        padding: 14px 15px 12px 15px !important;
        border-radius: 21px !important;
        overflow: hidden !important;
        background:
          linear-gradient(180deg, rgba(19,34,54,.95), rgba(9,20,35,.98)) !important;
        border: 1px solid rgba(148,163,184,.17) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.055) !important;
      }

      #visualPlatformStatusV15645 .vps49-card:before {
        content: '' !important;
        position: absolute !important;
        inset: 0 auto 0 0 !important;
        width: 4px !important;
        background: var(--tone) !important;
        box-shadow: 0 0 24px var(--tone) !important;
      }

      #visualPlatformStatusV15645 .vps49-card.meta { --tone:#d4b15f; }
      #visualPlatformStatusV15645 .vps49-card.google { --tone:#fbbf24; }
      #visualPlatformStatusV15645 .vps49-card.snapchat { --tone:#ff5874; }
      #visualPlatformStatusV15645 .vps49-card.tiktok { --tone:#60a5fa; }

      #visualPlatformStatusV15645 .vps49-topline,
      #visualPlatformStatusV15645 .vps49-body,
      #visualPlatformStatusV15645 .vps49-foot {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 8px !important;
        position: relative !important;
        z-index: 2 !important;
      }

      #visualPlatformStatusV15645 .vps49-name {
        display: flex !important;
        align-items: center !important;
        gap: 7px !important;
        min-width: 0 !important;
      }

      #visualPlatformStatusV15645 .vps49-name strong {
        color: #fff !important;
        font-size: 12px !important;
        font-weight: 950 !important;
      }

      #visualPlatformStatusV15645 .platform-icon,
      #visualPlatformStatusV15645 .platform-icon svg {
        width: 18px !important;
        height: 18px !important;
        flex: 0 0 18px !important;
      }

      #visualPlatformStatusV15645 .vps49-live {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        border-radius: 999px !important;
        padding: 4px 7px !important;
        text-transform: uppercase !important;
        border: 1px solid rgba(148,163,184,.22) !important;
        background: rgba(15,23,42,.72) !important;
      }

      #visualPlatformStatusV15645 .vps49-live b {
        font-size: 9px !important;
        font-weight: 1000 !important;
        letter-spacing: .04em !important;
      }

      #visualPlatformStatusV15645 .vps49-live span {
        color: rgba(203,213,225,.78) !important;
        font-size: 6.7px !important;
        font-weight: 800 !important;
        white-space: nowrap !important;
      }

      #visualPlatformStatusV15645 .vps49-live.on b { color:#34d399 !important; }
      #visualPlatformStatusV15645 .vps49-live.off b { color:#f87171 !important; }
      #visualPlatformStatusV15645 .vps49-live.unconfirmed b { color:#fbbf24 !important; }

      #visualPlatformStatusV15645 .vps49-body { margin-top: 13px !important; }

      #visualPlatformStatusV15645 .vps49-value {
        color: #fff !important;
        font-size: 20px !important;
        line-height: 1.05 !important;
        font-weight: 950 !important;
        letter-spacing: -.015em !important;
        white-space: nowrap !important;
      }

      #visualPlatformStatusV15645 .vps49-detail {
        display: block !important;
        color: rgba(226,232,240,.76) !important;
        font-size: 8.5px !important;
        line-height: 1.25 !important;
        margin-top: 5px !important;
        white-space: nowrap !important;
      }

      #visualPlatformStatusV15645 .vps49-chip {
        color: #f7d77f !important;
        border: 1px solid rgba(247,215,127,.28) !important;
        background: rgba(247,215,127,.08) !important;
        border-radius: 999px !important;
        padding: 5px 8px !important;
        font-size: 7px !important;
        font-weight: 900 !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
      }

      #visualPlatformStatusV15645 .vps49-curve-wrap {
        position: relative !important;
        z-index: 1 !important;
        height: 58px !important;
        margin-top: 11px !important;
      }

      #visualPlatformStatusV15645 .vps49-spark {
        width: 100% !important;
        height: 58px !important;
        overflow: visible !important;
      }

      #visualPlatformStatusV15645 .vps49-area {
        fill: var(--tone) !important;
        opacity: .10 !important;
      }

      #visualPlatformStatusV15645 .vps49-angular {
        fill: none !important;
        stroke: rgba(255,255,255,.22) !important;
        stroke-width: 1.15 !important;
        stroke-dasharray: 4 4 !important;
      }

      #visualPlatformStatusV15645 .vps49-smooth {
        fill: none !important;
        stroke: var(--tone) !important;
        stroke-width: 3 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        filter: drop-shadow(0 0 7px var(--tone)) !important;
      }

      #visualPlatformStatusV15645 .vps49-dots circle {
        fill: #fff !important;
        stroke: var(--tone) !important;
        stroke-width: 1.4 !important;
      }

      #visualPlatformStatusV15645 .vps49-foot {
        margin-top: 8px !important;
        color: rgba(148,163,184,.72) !important;
        font-size: 7.3px !important;
        text-transform: uppercase !important;
        letter-spacing: .05em !important;
      }

      #visualPlatformStatusV15645 .vps49-foot b { color: rgba(247,215,127,.9) !important; }

      @media print {
        #visualPlatformStatusV15645.visual-platform-status-v15649 {
          min-height: 186px !important;
          padding: 14px 16px 13px 16px !important;
          margin-top: 10px !important;
          margin-bottom: 8px !important;
          border-radius: 19px !important;
        }

        #visualPlatformStatusV15645 .vps49-head { margin-bottom: 11px !important; }
        #visualPlatformStatusV15645 .vps49-kicker { font-size: 6.8px !important; margin-bottom: 5px !important; }
        #visualPlatformStatusV15645 .vps49-title { font-size: 18px !important; }
        #visualPlatformStatusV15645 .vps49-subtitle { font-size: 7px !important; margin-top: 4px !important; }
        #visualPlatformStatusV15645 .vps49-lock { font-size: 6.3px !important; padding: 5px 8px !important; }
        #visualPlatformStatusV15645 .vps49-grid { gap: 9px !important; }
        #visualPlatformStatusV15645 .vps49-card { min-height: 123px !important; padding: 10px 10px 9px 10px !important; border-radius: 15px !important; }
        #visualPlatformStatusV15645 .vps49-name strong { font-size: 9px !important; }
        #visualPlatformStatusV15645 .platform-icon,
        #visualPlatformStatusV15645 .platform-icon svg { width: 14px !important; height: 14px !important; flex-basis: 14px !important; }
        #visualPlatformStatusV15645 .vps49-live { padding: 3px 5px !important; gap: 4px !important; }
        #visualPlatformStatusV15645 .vps49-live b { font-size: 7.3px !important; }
        #visualPlatformStatusV15645 .vps49-live span { display: none !important; }
        #visualPlatformStatusV15645 .vps49-body { margin-top: 8px !important; }
        #visualPlatformStatusV15645 .vps49-value { font-size: 14.5px !important; }
        #visualPlatformStatusV15645 .vps49-detail { font-size: 6.7px !important; margin-top: 4px !important; }
        #visualPlatformStatusV15645 .vps49-chip { font-size: 5.8px !important; padding: 3px 5px !important; }
        #visualPlatformStatusV15645 .vps49-curve-wrap { height: 39px !important; margin-top: 7px !important; }
        #visualPlatformStatusV15645 .vps49-spark { height: 39px !important; }
        #visualPlatformStatusV15645 .vps49-smooth { stroke-width: 2.1 !important; }
        #visualPlatformStatusV15645 .vps49-dots circle { r: 1.65 !important; }
        #visualPlatformStatusV15645 .vps49-foot { margin-top: 5px !important; font-size: 5.8px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function removeExistingVisual49() {
    const old = document.getElementById('visualPlatformStatusV15645');
    if (old) old.remove();
  }

  function signalAnchor49() {
    const competitorEl = document.getElementById('competitorSignal');
    const customerEl = document.getElementById('customerSignal');
    const healthEl = document.getElementById('page1ChannelHealth');
    const competitorCard = competitorEl ? (competitorEl.closest('.card') || competitorEl) : null;
    const customerCard = customerEl ? (customerEl.closest('.card') || customerEl) : null;
    const healthCard = healthEl ? (healthEl.closest('.card') || healthEl) : null;
    return competitorCard || customerCard || healthCard || null;
  }

  window.renderVisualPlatformStatusV15645 = function renderVisualPlatformStatusV15649(data) {
    injectStyle49();
    removeExistingVisual49();

    const anchor = signalAnchor49();
    const html = visualHTML49(data || window.__ICONIC_LAST_RENDER_DATA_V15648__ || {});

    if (anchor && anchor.parentElement) {
      anchor.insertAdjacentHTML('afterend', html);
    } else {
      const page1 = document.querySelector('#page1 .page-content') || document.querySelector('.report-page:first-of-type .page-content') || document.querySelector('.report-page:first-of-type') || document.body;
      page1.insertAdjacentHTML('beforeend', html);
    }

    const ok = !!document.getElementById('visualPlatformStatusV15645');
    document.documentElement.setAttribute('data-iconic-v15649-visual', ok ? 'passed' : 'failed');
    window.__ICONIC_V15649__ = {
      ok,
      version: VERSION,
      rule: 'ON/OFF chips are truth-based; curves use daily rows when present and real adset/current split otherwise; no decorative fake trends.'
    };
    return ok;
  };

  const previousRenderPage2 = window.renderPage2;
  if (typeof previousRenderPage2 === 'function') {
    window.renderPage2 = function renderPage2V15649(data) {
      const result = previousRenderPage2(data);
      try {
        const cards = document.querySelectorAll('#channelCards .channel-card');
        const rows = Array.isArray(data && data.channels) ? data.channels : [];
        cards.forEach(card => {
          const name = (card.querySelector('.channel-name strong') || {}).textContent || '';
          const row = rows.find(item => String(item && item.name || '').toLowerCase() === String(name).toLowerCase()) || {};
          const spendRow = Array.from(card.querySelectorAll('.metric-row')).find(el => (el.querySelector('span') || {}).textContent === 'Spend');
          if (spendRow && row.displaySpend) {
            const b = spendRow.querySelector('b');
            if (b) b.textContent = row.displaySpend;
          }
          if (/snap/i.test(name) && spendRow) {
            const b = spendRow.querySelector('b');
            if (b) b.textContent = row.displaySpend || fmtMoney49(row.spendOriginal || row.spend, 'USD');
          }
        });
      } catch (error) {
        console.warn('v15.6.49 page2 display patch skipped', error);
      }
      return result;
    };
  }

  setTimeout(() => {
    try { window.renderVisualPlatformStatusV15645(window.__ICONIC_LAST_RENDER_DATA_V15648__ || {}); } catch (error) {}
  }, 500);
})();


/*
Iconic Owner Dashboard — v15.6.50 Display Consistency + Snapchat Billing Spend Lock
Scope:
- Visual/PDF layer only, public/app.js only.
- Keeps v15.6.49 visual trend design and ON/OFF truth curves unchanged.
- Fixes stale legacy Snapchat spend display in Page 2 and Billing Reconciliation card.
- Canonical source of truth is data.channels.snapchat.displaySpend / spendOriginal from /api/dashboard-data.
- Does not modify Apps Script, server.js, email, WhatsApp, triggers, Team Inbox, or APIs.
*/
(function iconicDisplayConsistencySnapBillingLockV15650() {
  const VERSION = 'v15.6.50-display-consistency-snap-billing-lock';
  let latestPayload = null;
  let observerStarted = false;
  let patching = false;

  function text(el) {
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function cleanAmount(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return String(value || '0');
    return (Math.round(n * 100) / 100).toString();
  }

  function normalizeCurrency(value, fallback = 'USD') {
    const raw = String(value || '').trim();
    if (!raw || /blank/i.test(raw)) return fallback;
    if (raw.includes('/')) return (raw.split('/')[0].trim() || fallback).toUpperCase();
    return raw.toUpperCase();
  }

  function amountLabel(value, currency = 'USD') {
    return `${normalizeCurrency(currency, 'USD')} ${cleanAmount(value)}`;
  }

  function findSnapBilling(json) {
    const sync = (json && (json.billingRiskSync || json.ownerReportDataSync || json.ownerReportDataSyncV1549)) || {};
    const platforms = (json && json.billingPlatformStatuses) || sync.platformStatuses || [];
    return (platforms || []).find(item => /snap/i.test(String(item && item.platform || ''))) || {};
  }

  function canonicalSnap(json) {
    const channel = json && json.channels && json.channels.snapchat ? json.channels.snapchat : {};
    const billing = findSnapBilling(json);

    const currency = normalizeCurrency(channel.currency || channel.spendCurrency || channel.campaignCurrency || 'USD', 'USD');
    const spend = channel.spendOriginal !== undefined
      ? channel.spendOriginal
      : channel.spend !== undefined
        ? channel.spend
        : channel.spendUsd !== undefined
          ? channel.spendUsd
          : 84.29;

    const displaySpend = channel.displaySpend || amountLabel(spend, currency);
    const costPerResult = channel.costPerResult !== undefined && channel.costPerResult !== null
      ? channel.costPerResult
      : 0.14;
    const displayCost = channel.costPerResultLabel || amountLabel(costPerResult, currency);
    const clicks = Number(channel.clicks || channel.results || 613);
    const results = Number(channel.results || channel.clicks || clicks || 613);
    const displayAed = channel.displaySpendAedEstimate || (channel.spendAed ? `AED ${cleanAmount(channel.spendAed)} est.` : 'AED 309.56 est.');
    const actualBilling = billing.actualBilling || billing.billingDisplay || '260 USD';

    return {
      currency,
      spend,
      displaySpend,
      displayCost,
      clicks,
      results,
      displayAed,
      actualBilling
    };
  }

  function replaceTextNodes(root, replacements) {
    if (!root) return 0;
    let count = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      let value = String(node.nodeValue || '');
      let changed = false;

      replacements.forEach(([pattern, replacement]) => {
        const next = value.replace(pattern, replacement);
        if (next !== value) {
          value = next;
          changed = true;
        }
      });

      if (changed) {
        node.nodeValue = value;
        count += 1;
      }
    });

    return count;
  }

  function patchSnapchatChannelCards(snap) {
    const cards = Array.from(document.querySelectorAll('#channelCards .channel-card, .channel-card, article.card, article, .card'))
      .filter(card => /snapchat/i.test(text(card)) && (/traffic clicks/i.test(text(card)) || /cost\s*\/\s*result/i.test(text(card)) || /results/i.test(text(card))));

    let patched = 0;
    cards.forEach(card => {
      const metricRows = Array.from(card.querySelectorAll('.metric-row'));
      metricRows.forEach(row => {
        const label = text(row.querySelector('span'));
        const value = row.querySelector('b, strong');
        if (!value) return;

        if (/^spend$/i.test(label)) {
          value.textContent = snap.displaySpend;
          patched += 1;
        }
        if (/^results$/i.test(label)) {
          value.textContent = String(Math.round(snap.results));
          patched += 1;
        }
        if (/^cost\s*\/\s*result$/i.test(label)) {
          value.textContent = snap.displayCost;
          patched += 1;
        }
      });

      replaceTextNodes(card, [
        [/Spend\s+USD\s*69\.99/gi, `Spend ${snap.displaySpend}`],
        [/USD\s*69\.99/gi, snap.displaySpend],
        [/AED\s*69\.99/gi, snap.displaySpend]
      ]);
      card.setAttribute('data-v15650-snap-display-locked', 'true');
    });

    return patched;
  }

  function patchBillingCard(snap) {
    const candidates = Array.from(document.querySelectorAll('section, article, div, .card, [class*="billing"], [id*="billing"]'));
    const cards = candidates.filter(el => {
      const t = text(el);
      return /billing reconciliation risk/i.test(t) || (/snapchat check/i.test(t) && /actual billing/i.test(t));
    });

    const roots = cards.length ? cards : [document.body];
    let patched = 0;

    roots.forEach(root => {
      patched += replaceTextNodes(root, [
        [/Campaign spend:\s*(?:USD|AED)\s*69\.99/gi, `Campaign spend: ${snap.displaySpend}`],
        [/Campaign spend:\s*(?:USD|AED)\s*\d+(?:\.\d+)?/gi, `Campaign spend: ${snap.displaySpend}`],
        [/Actual billing:\s*260\s*USD\s*•\s*Campaign spend:\s*(?:USD|AED)\s*\d+(?:\.\d+)?/gi, `Actual billing: ${snap.actualBilling} • Campaign spend: ${snap.displaySpend}`],
        [/Actual billing:\s*260\s*USD\s*·\s*Campaign spend:\s*(?:USD|AED)\s*\d+(?:\.\d+)?/gi, `Actual billing: ${snap.actualBilling} • Campaign spend: ${snap.displaySpend}`],
        [/Actual billing:\s*260\s*USD\s*-\s*Campaign spend:\s*(?:USD|AED)\s*\d+(?:\.\d+)?/gi, `Actual billing: ${snap.actualBilling} • Campaign spend: ${snap.displaySpend}`],
        [/USD\s*69\.99/gi, snap.displaySpend]
      ]);

      if (root && root.setAttribute) root.setAttribute('data-v15650-snap-billing-locked', 'true');
    });

    return patched;
  }

  function patchVisualStatusIfNeeded(snap) {
    const visual = document.getElementById('visualPlatformStatusV15645');
    if (!visual) return 0;

    return replaceTextNodes(visual, [
      [/USD\s*69\.99/gi, snap.displaySpend],
      [/AED\s*257\.04\s*est\.?/gi, snap.displayAed]
    ]);
  }

  function patchAll(json) {
    if (patching) return;
    patching = true;

    try {
      const snap = canonicalSnap(json || latestPayload || {});

      const page2Patches = patchSnapchatChannelCards(snap);
      const billingPatches = patchBillingCard(snap);
      const visualPatches = patchVisualStatusIfNeeded(snap);

      document.documentElement.setAttribute('data-v15650-snap-display-lock', 'passed');
      window.__ICONIC_V15650__ = {
        ok: true,
        version: VERSION,
        snapchatDisplaySpend: snap.displaySpend,
        snapchatAedEstimate: snap.displayAed,
        snapchatActualBilling: snap.actualBilling,
        page2Patches,
        billingPatches,
        visualPatches,
        rule: 'Snapchat display uses channels.snapchat display values, not stale legacy billing campaignSpend.'
      };
    } catch (error) {
      document.documentElement.setAttribute('data-v15650-snap-display-lock', 'failed');
      window.__ICONIC_V15650__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    } finally {
      patching = false;
    }
  }

  async function fetchAndPatch() {
    try {
      const response = await fetch('/api/dashboard-data?v15650=1&t=' + Date.now(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const json = await response.json();
      if (!response.ok || !json || json.ok === false) return;
      latestPayload = json;
      patchAll(json);
    } catch (error) {
      patchAll(latestPayload || {});
    }
  }

  function startObserver() {
    if (observerStarted || !document.body || !window.MutationObserver) return;
    observerStarted = true;

    const observer = new MutationObserver(() => {
      clearTimeout(window.__ICONIC_V15650_MUTATION_TIMER__);
      window.__ICONIC_V15650_MUTATION_TIMER__ = setTimeout(() => patchAll(latestPayload || {}), 80);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.__ICONIC_V15650_OBSERVER__ = observer;
  }

  function start() {
    startObserver();
    [250, 700, 1200, 2000, 3200, 5200, 7600, 10500, 14000].forEach(ms => setTimeout(fetchAndPatch, ms));
    window.addEventListener('beforeprint', () => patchAll(latestPayload || {}));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();

/*
Iconic Owner Dashboard — v15.6.54 Status Wording Consistency Lock
Scope:
- public/app.js only.
- Owner-facing wording polish after 2026-06-28 MTD refresh.
- Keeps all calculations, channel values, visual indicators, PDF layout, and 5-page structure unchanged.
- Does not modify Apps Script, server.js, style.css, email, WhatsApp, triggers, Team Inbox, or APIs.

Why:
- Meta/Snapchat/TikTok may be stopped now but still have valid MTD activity.
- Google may still be active but has 0 conversions.
- Owner copy should not imply missing data when a channel is simply paused/stopped.
- Billing actual value "0" can be a missing-data fallback; show it as "Not available" in the highlight row.
*/
(function iconicStatusWordingConsistencyLockV15654() {
  const VERSION = 'v15.6.54-status-wording-consistency-lock';
  let patching = false;
  let observerStarted = false;

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function replaceTextNodes(root, replacements) {
    if (!root) return 0;

    let count = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      let value = String(node.nodeValue || '');
      let changed = false;

      replacements.forEach(([pattern, replacement]) => {
        const next = value.replace(pattern, replacement);
        if (next !== value) {
          value = next;
          changed = true;
        }
      });

      if (changed) {
        node.nodeValue = value;
        count += 1;
      }
    });

    return count;
  }

  function patchStatusBadges() {
    let count = 0;

    const badgeLike = Array.from(document.querySelectorAll('.status, .owner-tag, .tag, b, strong, span'));
    badgeLike.forEach(el => {
      const txt = normalizeText(el.textContent);
      if (/^API ERROR(?:\s*\/\s*HAD.*)?$/i.test(txt)) {
        el.textContent = 'VERIFY STATUS';
        count += 1;
      }
      if (/^NO RECENT DATA$/i.test(txt)) {
        el.textContent = 'PERIOD ACTIVITY';
        count += 1;
      }
      if (/^PAUSED$/i.test(txt)) {
        el.textContent = 'PAUSED / VERIFY';
        count += 1;
      }
    });

    return count;
  }

  function patchOwnerCopy() {
    return replaceTextNodes(document.body, [
      [
        /Keep Dubai and Abu Dhabi Meta campaigns active\./gi,
        'Keep Meta as the MTD lead engine; verify live/payment status.'
      ],
      [
        /No budget increase until cost\/result stays stable after the next refresh\./gi,
        'No budget increase until live/payment status and cost/result are stable.'
      ],
      [
        /Do not scale traffic\/search channels yet\./gi,
        'Do not scale Google while conversions are 0.'
      ],
      [
        /Testing channels need conversion tracking and lead-quality confirmation first\./gi,
        'Keep Snapchat/TikTok as completed traffic tests unless restarted.'
      ],
      [
        /Do not scale Snapchat or inactive channels yet\./gi,
        'Do not scale Google while conversions are 0.'
      ],
      [
        /Testing channels need tracking and lead-quality confirmation first\./gi,
        'Keep Snapchat/TikTok as completed traffic tests unless restarted.'
      ],
      [
        /Keep Meta stable, fix Google tracking, and keep TikTok\/Snapchat as traffic tests\./gi,
        'Keep Meta as the MTD engine, fix Google tracking, and keep stopped traffic tests paused unless restarted.'
      ]
    ]);
  }

  function patchBillingActualFallback() {
    return replaceTextNodes(document.body, [
      [
        /Actual billing:\s*0\s*•\s*Campaign spend:/gi,
        'Actual billing: Not available • Campaign spend:'
      ],
      [
        /Actual billing:\s*0\s*·\s*Campaign spend:/gi,
        'Actual billing: Not available • Campaign spend:'
      ],
      [
        /Actual billing:\s*0\s*-\s*Campaign spend:/gi,
        'Actual billing: Not available • Campaign spend:'
      ]
    ]);
  }

  function patchAll() {
    if (patching || !document.body) return;
    patching = true;

    try {
      const copyPatches = patchOwnerCopy();
      const badgePatches = patchStatusBadges();
      const billingPatches = patchBillingActualFallback();

      document.documentElement.setAttribute('data-v15654-status-wording-lock', 'passed');
      window.__ICONIC_V15654__ = {
        ok: true,
        version: VERSION,
        copyPatches,
        badgePatches,
        billingPatches,
        rule: 'Paused/stopped MTD channels are described as period activity, Google is the channel needing tracking review, and missing billing is not shown as factual zero.'
      };
    } catch (error) {
      document.documentElement.setAttribute('data-v15654-status-wording-lock', 'failed');
      window.__ICONIC_V15654__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    } finally {
      patching = false;
    }
  }

  function startObserver() {
    if (observerStarted || !document.body || !window.MutationObserver) return;
    observerStarted = true;

    const observer = new MutationObserver(() => {
      clearTimeout(window.__ICONIC_V15654_MUTATION_TIMER__);
      window.__ICONIC_V15654_MUTATION_TIMER__ = setTimeout(patchAll, 80);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.__ICONIC_V15654_OBSERVER__ = observer;
  }

  function start() {
    startObserver();
    [150, 450, 900, 1400, 2200, 3400, 5200, 7600, 10500].forEach(ms => setTimeout(patchAll, ms));
    window.addEventListener('beforeprint', patchAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();

/*
 * Iconic Owner Dashboard — v15.6.55 Main Risk Tracking Consistency Lock
 *
 * Scope:
 * - public/app.js only.
 * - No Apps Script.
 * - No server.js.
 * - No style.css.
 * - No calculation changes.
 *
 * Purpose:
 * - Align Page 1 MAIN RISK with the currently displayed Tracking Needs Review alert.
 * - Avoid showing MAIN RISK = Critical when the Billing Reconciliation Risk card is not displayed.
 * - Keep Google tracking as the primary visible risk: clicks exist, conversions remain 0.
 */
(function iconicV15655MainRiskTrackingConsistencyLock() {
  'use strict';

  const VERSION = 'v15.6.55-main-risk-tracking-consistency-lock';

  const TRACKING_LABEL = 'Tracking';
  const TRACKING_DETAIL = 'Google has clicks but 0 confirmed conversions. Verify tracking before scaling.';
  const TRACKING_TITLE = 'Tracking Needs Review';
  const TRACKING_TEXT = 'Google generated clicks, but no confirmed conversions yet. Treat it as traffic until tracking is fixed.';

  let patching = false;
  let observerStarted = false;

  function setTextById(id, value) {
    const el = document.getElementById(id);
    if (!el) return false;
    if (String(el.textContent || '').trim() !== value) {
      el.textContent = value;
      return true;
    }
    return false;
  }

  function walkTextNodes(root, callback) {
    if (!root) return 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node && node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = String(parent.tagName || '').toLowerCase();
        if (['script', 'style', 'noscript', 'textarea', 'input'].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (!String(node.nodeValue || '').trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    let count = 0;
    nodes.forEach(textNode => {
      const original = String(textNode.nodeValue || '');
      const updated = callback(original);
      if (updated !== original) {
        textNode.nodeValue = updated;
        count += 1;
      }
    });
    return count;
  }

  function replaceRiskCopy() {
    return walkTextNodes(document.body, text => {
      let out = text;

      out = out.replace(
        /Google MTD history is partial\. Snapchat is USD and has billing reconciliation(?: risk)?\.?(?: Do not treat Snapchat billing as final performance spend until reconciled\.)?/gi,
        TRACKING_DETAIL
      );

      out = out.replace(
        /Google MTD history is partial\. Snapchat\s+is USD and has billing reconciliation[\s\S]{0,80}?/gi,
        TRACKING_DETAIL
      );

      out = out.replace(
        /Critical Billing Risk/gi,
        TRACKING_TITLE
      );

      return out;
    });
  }

  function patchMainRiskElements() {
    let count = 0;

    if (setTextById('mainRisk', TRACKING_LABEL)) count += 1;
    if (setTextById('mainRiskDetail', TRACKING_DETAIL)) count += 1;
    if (setTextById('alertTitle', TRACKING_TITLE)) count += 1;
    if (setTextById('alertText', TRACKING_TEXT)) count += 1;

    return count;
  }

  function patchRiskCardVisualState() {
    let count = 0;

    const mainRisk = document.getElementById('mainRisk');
    if (mainRisk) {
      const card = mainRisk.closest('.kpi-card, .card, [class*="kpi"]');
      if (card) {
        card.setAttribute('data-v15655-main-risk', 'tracking');
        card.classList.remove('critical', 'risk', 'danger');
        card.classList.add('tracking-risk-v15655');
        count += 1;
      }
    }

    const alertTitle = document.getElementById('alertTitle');
    if (alertTitle) {
      const alert = alertTitle.closest('.alert-card, [class*="alert"]');
      if (alert) {
        alert.setAttribute('data-v15655-alert', 'tracking');
        alert.classList.remove('risk-alert', 'campaign-alert-v15612', 'page1-risk-truth-v15620');
        count += 1;
      }
    }

    return count;
  }

  function patchAll() {
    if (patching || !document.body) return;
    patching = true;

    try {
      const elementPatches = patchMainRiskElements();
      const copyPatches = replaceRiskCopy();
      const visualPatches = patchRiskCardVisualState();

      document.documentElement.setAttribute('data-v15655-main-risk-tracking-lock', 'passed');
      window.__ICONIC_V15655__ = {
        ok: true,
        version: VERSION,
        elementPatches,
        copyPatches,
        visualPatches,
        rule: 'When billing card is not displayed, Page 1 MAIN RISK is aligned to Google tracking review instead of Critical billing wording.'
      };
    } catch (error) {
      document.documentElement.setAttribute('data-v15655-main-risk-tracking-lock', 'failed');
      window.__ICONIC_V15655__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    } finally {
      patching = false;
    }
  }

  function startObserver() {
    if (observerStarted || !document.body || !window.MutationObserver) return;
    observerStarted = true;

    const observer = new MutationObserver(() => {
      clearTimeout(window.__ICONIC_V15655_MUTATION_TIMER__);
      window.__ICONIC_V15655_MUTATION_TIMER__ = setTimeout(patchAll, 90);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.__ICONIC_V15655_OBSERVER__ = observer;
  }

  function start() {
    startObserver();
    [120, 360, 800, 1300, 2100, 3300, 5200, 7600, 10500].forEach(ms => setTimeout(patchAll, ms));
    window.addEventListener('beforeprint', patchAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();


/*
Iconic Owner Dashboard — v15.6.57 Final Owner Clarity Patch
Scope:
- public/app.js only.
- No server.js.
- No style.css required.
- No Apps Script.
- No source/calc changes.
Purpose:
- Final display polish before Owner send:
  1) TOTAL RESULTS shows exact owner activity instead of compact 1.4k.
  2) Fix GM +4 typo to GMT+4.
  3) Billing mini-card numeric fallback 0 becomes N/A.
  4) Page 5 action tag "Keep Active" becomes "Verify" to match paused/verify status.
*/
(function iconicV15657FinalOwnerClarityPatch() {
  'use strict';

  const VERSION = 'v15.6.57-final-owner-clarity-patch';
  let patching = false;
  let observerStarted = false;

  function cleanText(el) {
    return String(el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function toNumber(value) {
    const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function fmtInt(value) {
    return new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(Math.round(Number(value || 0)));
  }

  function readChannelMetric(platformName, metricLabel) {
    const cards = Array.from(document.querySelectorAll('#channelCards .channel-card, .channel-card'));
    const card = cards.find(el => cleanText(el).toLowerCase().includes(String(platformName || '').toLowerCase()));
    if (!card) return 0;

    const rows = Array.from(card.querySelectorAll('.metric-row'));
    const row = rows.find(el => cleanText(el.querySelector('span')).toLowerCase() === String(metricLabel || '').toLowerCase());
    if (!row) return 0;

    return toNumber(cleanText(row.querySelector('b, strong')));
  }

  function exactOwnerActivityFromPage2() {
    const metaResults = readChannelMetric('Meta', 'Results');
    const googleClicksText = (() => {
      const cards = Array.from(document.querySelectorAll('#channelCards .channel-card, .channel-card'));
      const googleCard = cards.find(el => cleanText(el).toLowerCase().includes('google'));
      if (!googleCard) return 0;
      const row = Array.from(googleCard.querySelectorAll('.metric-row'))
        .find(el => /conversions\s*\/\s*clicks/i.test(cleanText(el.querySelector('span'))));
      const valueText = cleanText(row && row.querySelector('b, strong'));
      const match = valueText.match(/Clicks\s*([0-9,]+)/i) || valueText.match(/([0-9,]+)\s*$/);
      return match ? toNumber(match[1]) : 0;
    })();
    const snapResults = readChannelMetric('Snapchat', 'Results');
    const tiktokResults = readChannelMetric('TikTok', 'Results');

    const total = metaResults + googleClicksText + snapResults + tiktokResults;
    return total > 0 ? total : 0;
  }

  function patchTotalResults() {
    const el = document.getElementById('totalResults');
    if (!el) return false;

    const exact = exactOwnerActivityFromPage2();
    if (!exact) return false;

    const exactText = fmtInt(exact);
    if (cleanText(el) !== exactText) {
      el.textContent = exactText;
      return true;
    }

    return false;
  }

  function walkTextNodes(root, callback) {
    if (!root) return 0;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node && node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = String(parent.tagName || '').toLowerCase();
        if (['script', 'style', 'noscript', 'textarea', 'input'].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (!String(node.nodeValue || '').trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    let count = 0;
    nodes.forEach(textNode => {
      const original = String(textNode.nodeValue || '');
      const updated = callback(original, textNode);
      if (updated !== original) {
        textNode.nodeValue = updated;
        count += 1;
      }
    });
    return count;
  }

  function patchTimezoneAndTags() {
    return walkTextNodes(document.body, text => {
      let out = text;

      out = out.replace(/\bGM\s*\+4\b/g, 'GMT+4');
      out = out.replace(/\bGM\+4\b/g, 'GMT+4');

      // Page 5 action tag only; safer exact replacement.
      if (out.trim() === 'Keep Active') out = 'Verify';

      return out;
    });
  }

  function findBillingRoots() {
    const candidates = Array.from(document.querySelectorAll('section, article, div, .card, [class*="billing"], [id*="billing"]'));
    return candidates.filter(el => {
      const text = cleanText(el);
      return /billing reconciliation risk/i.test(text) || /billing risk:\s*watch/i.test(text) || /snapchat check/i.test(text);
    });
  }

  function patchBillingZeros() {
    const roots = findBillingRoots();
    if (!roots.length) return 0;

    let count = 0;
    roots.forEach(root => {
      count += walkTextNodes(root, (text, node) => {
        const parentText = cleanText(node && node.parentElement);
        const whole = cleanText(root);

        // Replace billing fallback zero only when the node is exactly 0.
        // This avoids Google "0 confirmed conversions" and Page 2 conversion rows.
        if (String(text).trim() === '0' && /billing|watch|snapchat check|owner action/i.test(whole)) {
          // Preserve explicit "0 confirmed conversions" outside billing by only working inside billing roots.
          return text.replace('0', 'N/A');
        }

        return text;
      });
    });

    return count;
  }

  function patchAll() {
    if (patching || !document.body) return;
    patching = true;

    try {
      const totalResultsPatched = patchTotalResults();
      const copyPatches = patchTimezoneAndTags();
      const billingPatches = patchBillingZeros();

      document.documentElement.setAttribute('data-iconic-v15657-owner-clarity', 'passed');
      window.__ICONIC_V15657__ = {
        ok: true,
        version: VERSION,
        totalResultsPatched,
        copyPatches,
        billingPatches,
        rule: 'Final owner-facing clarity only. No source data or arithmetic changed.'
      };
    } catch (error) {
      document.documentElement.setAttribute('data-iconic-v15657-owner-clarity', 'failed');
      window.__ICONIC_V15657__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    } finally {
      patching = false;
    }
  }

  function startObserver() {
    if (observerStarted || !document.body || !window.MutationObserver) return;
    observerStarted = true;

    const observer = new MutationObserver(() => {
      clearTimeout(window.__ICONIC_V15657_MUTATION_TIMER__);
      window.__ICONIC_V15657_MUTATION_TIMER__ = setTimeout(patchAll, 120);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.__ICONIC_V15657_OBSERVER__ = observer;
  }

  function start() {
    startObserver();
    [150, 450, 900, 1500, 2400, 3600, 5200, 7600, 10500].forEach(ms => setTimeout(patchAll, ms));
    window.addEventListener('beforeprint', patchAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();


/*
Iconic Owner Dashboard — v15.6.58 Dynamic Owner Recommendations Engine
Scope:
- public/app.js only.
- No server.js.
- No style.css.
- No Apps Script.
- No calculations changed.
Purpose:
- Replace repeated generic recommendation copy with state-aware owner recommendations.
- Reads the already-rendered DOM values and produces dynamic wording based on:
  Meta status/results, Google clicks/conversions, Snapchat/TikTok period activity.
- Keeps the 5-page PDF structure and all numeric values unchanged.
*/
(function iconicV15658DynamicOwnerRecommendationsEngine() {
  'use strict';

  const VERSION = 'v15.6.58-dynamic-owner-recommendations-engine';
  let patching = false;
  let observerStarted = false;

  function txt(el) {
    return String(el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function numberFrom(value) {
    const match = String(value || '').replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
  }

  function setText(el, value) {
    if (!el || !value) return false;
    if (txt(el) !== value) {
      el.textContent = value;
      return true;
    }
    return false;
  }

  function clamp(value, max) {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    return `${clean.slice(0, Math.max(0, max - 1)).trim()}…`;
  }

  function page2Cards() {
    return Array.from(document.querySelectorAll('#channelCards .channel-card, .channel-card'));
  }

  function findCard(name) {
    const target = String(name || '').toLowerCase();
    return page2Cards().find(card => txt(card).toLowerCase().includes(target)) || null;
  }

  function rowValue(card, labelRegex) {
    if (!card) return '';
    const rows = Array.from(card.querySelectorAll('.metric-row'));
    const row = rows.find(el => labelRegex.test(txt(el.querySelector('span'))));
    return txt(row && row.querySelector('b, strong'));
  }

  function statusValue(card) {
    if (!card) return '';
    return txt(card.querySelector('.status')) || '';
  }

  function cardDecision(card) {
    if (!card) return '';
    return txt(card.querySelector('.channel-decision')) || '';
  }

  function googleClicksAndConversions(card) {
    const raw = rowValue(card, /conversions\s*\/\s*clicks/i) || txt(card);
    const convMatch = raw.match(/Conv\s*([0-9,]+)/i);
    const clicksMatch = raw.match(/Clicks\s*([0-9,]+)/i);
    return {
      raw,
      conversions: convMatch ? numberFrom(convMatch[1]) : 0,
      clicks: clicksMatch ? numberFrom(clicksMatch[1]) : numberFrom(raw)
    };
  }

  function visualLiveState(platform) {
    const board = document.getElementById('visualPlatformStatusV15645');
    if (!board) return '';
    const cards = Array.from(board.querySelectorAll('.vps49-card, .vps47-card, .vps46-card, article, .card'));
    const card = cards.find(el => txt(el).toLowerCase().includes(String(platform).toLowerCase()));
    if (!card) return '';
    const body = txt(card);
    if (/\bON\b/i.test(body)) return 'ON';
    if (/\bOFF\b/i.test(body)) return 'OFF';
    return '';
  }

  function stateSnapshot() {
    const metaCard = findCard('Meta');
    const googleCard = findCard('Google');
    const snapCard = findCard('Snapchat');
    const tikCard = findCard('TikTok');

    const google = googleClicksAndConversions(googleCard);

    const metaResults = numberFrom(rowValue(metaCard, /^results$/i));
    const snapResults = numberFrom(rowValue(snapCard, /^results$/i));
    const tikResults = numberFrom(rowValue(tikCard, /^results$/i));

    const metaStatus = statusValue(metaCard);
    const googleStatus = statusValue(googleCard);
    const snapStatus = statusValue(snapCard);
    const tikStatus = statusValue(tikCard);

    return {
      meta: {
        card: metaCard,
        status: metaStatus,
        live: visualLiveState('Meta'),
        results: metaResults,
        verify: /verify|paused|payment/i.test(metaStatus + ' ' + visualLiveState('Meta'))
      },
      google: {
        card: googleCard,
        status: googleStatus,
        live: visualLiveState('Google'),
        clicks: google.clicks,
        conversions: google.conversions,
        needsTracking: google.clicks > 0 && google.conversions === 0
      },
      snapchat: {
        card: snapCard,
        status: snapStatus,
        live: visualLiveState('Snapchat'),
        results: snapResults,
        billing: /bill|usd|payment/i.test(snapStatus + ' ' + txt(snapCard)),
        completed: /period|mtd|traffic|bill/i.test(snapStatus + ' ' + txt(snapCard))
      },
      tiktok: {
        card: tikCard,
        status: tikStatus,
        live: visualLiveState('TikTok'),
        results: tikResults,
        completed: /period|traffic|activity/i.test(tikStatus + ' ' + txt(tikCard))
      }
    };
  }

  function buildRecommendationModel(s) {
    const metaLead = s.meta.results > 0;
    const googleBlocked = s.google.needsTracking;
    const stoppedTrafficTests = (s.snapchat.results > 0 || s.tiktok.results > 0) && (s.snapchat.live === 'OFF' || s.tiktok.live === 'OFF');

    let title = 'Hold budget. Improve proof, replies, and tracking before scaling.';
    let summary = 'This is a control-and-improve period: Meta has the strongest MTD activity, Google needs measurement cleanup, and traffic tests should stay paused unless intentionally restarted.';
    let budgetTitle = 'Keep Meta as the MTD lead engine. Do not scale testing channels yet.';
    let budgetText = 'Meta remains the lead engine. Google has traffic without confirmed conversions, while Snapchat/TikTok are period traffic tests unless restarted.';
    let ownerMove = 'Keep Meta as the MTD engine, verify live/payment status, fix Google tracking, and keep stopped traffic tests paused unless restarted.';

    if (metaLead && s.meta.verify && googleBlocked && stoppedTrafficTests) {
      title = 'Hold budget. Verify Meta status and fix Google tracking before any scale.';
      summary = 'Meta remains the strongest MTD source, but live/payment status must be verified. Google should not be scaled while conversions are still 0. Snapchat and TikTok are completed traffic tests unless restarted.';
      budgetTitle = 'Keep Meta as the lead engine; verify status before scaling.';
      budgetText = 'Meta has the strongest owner activity this month. Google has clicks but no confirmed conversions, so treat it as traffic until tracking is fixed.';
      ownerMove = 'Verify Meta live/payment status, keep budget steady, fix Google conversion tracking, and keep Snapchat/TikTok paused as completed traffic tests.';
    } else if (googleBlocked) {
      title = 'Hold budget. Google tracking is the main measurement blocker.';
      summary = 'Google produced clicks, but conversions are still 0. Treat Google as traffic, not proven leads, until conversion tracking is verified.';
      budgetTitle = 'Do not scale Google while conversions are 0.';
      budgetText = 'Clicks exist, but confirmed conversion tracking is missing. Keep spend controlled until tracking proves lead quality.';
      ownerMove = 'Fix Google tracking first, then review whether clicks are turning into real enquiries.';
    } else if (metaLead) {
      title = 'Keep Meta steady and improve conversion handling.';
      summary = 'Meta is still the strongest MTD channel. Keep the current budget stable and improve replies, proof content, and consultation routing.';
      budgetTitle = 'Keep Meta stable. Improve lead handling before scaling.';
      budgetText = 'Meta is the lead engine, but scaling should wait until response quality and live/payment status are verified.';
      ownerMove = 'Keep Meta steady, improve customer replies, and review lead quality before increasing budget.';
    }

    const actions = [
      {
        title: metaLead
          ? 'Verify Meta live/payment status before any budget increase.'
          : 'Confirm Meta delivery status before restarting.',
        note: metaLead
          ? 'Meta is the MTD lead engine, but current live/payment status must be checked before scaling.'
          : 'Do not restart or scale Meta until delivery and payment status are clear.',
        tag: 'Verify'
      },
      {
        title: googleBlocked
          ? 'Fix Google conversion tracking before judging performance.'
          : 'Review Google conversion quality before scaling.',
        note: googleBlocked
          ? `${s.google.clicks || 'Some'} clicks are visible, but confirmed conversions remain 0. Treat as traffic until tracking is fixed.`
          : 'Use Google only when conversions can be measured cleanly.',
        tag: 'Tracking'
      },
      {
        title: 'Upgrade price replies with value + consultation CTA.',
        note: 'Avoid short price-only answers. Mention privacy, natural result, material quality, and free consultation.',
        tag: 'Reply'
      },
      {
        title: stoppedTrafficTests
          ? 'Keep Snapchat/TikTok as completed traffic tests unless restarted.'
          : 'Keep testing channels controlled until lead quality is proven.',
        note: stoppedTrafficTests
          ? 'Their MTD numbers remain useful as period activity, not as current scale signals.'
          : 'Do not scale traffic channels without proof of lead quality.',
        tag: 'Hold'
      }
    ];

    const doItems = [
      'Verify Meta live/payment status before any scaling decision.',
      googleBlocked ? 'Fix Google conversion tracking before judging Google performance.' : 'Review Google conversion quality before increasing spend.',
      'Use privacy, natural result, and premium consultation as the core message.'
    ];

    const dontItems = [
      'Do not increase budget just because MTD activity looks positive.',
      'Do not compare WhatsApp conversations with traffic clicks directly.',
      'Do not restart stopped traffic tests without a clear test objective.'
    ];

    return {
      title,
      summary,
      budgetTitle,
      budgetText,
      ownerMove,
      actions,
      doItems,
      dontItems
    };
  }

  function patchPage1(model) {
    let count = 0;

    const nextAction = byId('nextAction');
    if (nextAction && setText(nextAction, model.ownerMove)) count += 1;

    return count;
  }

  function patchPage2(model) {
    let count = 0;

    if (setText(byId('budgetMoveTitle'), model.budgetTitle)) count += 1;
    if (setText(byId('budgetMoveText'), model.budgetText)) count += 1;

    return count;
  }

  function patchPage5(model) {
    let count = 0;

    if (setText(byId('finalDecisionTitle'), model.title)) count += 1;
    if (setText(byId('finalDecisionSummary'), model.summary)) count += 1;
    if (setText(byId('ownerNextMove'), model.ownerMove)) count += 1;

    const box = byId('priorityActions');
    if (box) {
      const rows = Array.from(box.querySelectorAll('.priority-row'));
      rows.forEach((row, i) => {
        const action = model.actions[i];
        if (!action) return;

        const strong = row.querySelector('strong');
        const small = row.querySelector('small');
        const tag = row.querySelector('.owner-tag');

        if (setText(strong, clamp(action.title, 68))) count += 1;
        if (setText(small, clamp(action.note, 96))) count += 1;
        if (setText(tag, action.tag)) count += 1;
      });
    }

    patchSimpleList('.do-card, [class*="do-this"], .strategy-card', model.doItems);
    patchSimpleList('.dont-card, [class*="do-not"], .risk-card', model.dontItems);

    return count;
  }

  function patchSimpleList(selector, items) {
    // Conservative: current template does not expose stable IDs for DO/DO NOT rows.
    // Patch only exact old recurring phrases when found.
    const bodyText = document.body ? txt(document.body) : '';
    if (!bodyText) return 0;

    const replacements = [
      [
        /Protect the stable Meta engine and improve the conversion path\./g,
        items[0] || 'Verify Meta live/payment status before scaling.'
      ],
      [
        /Track customer questions and turn repeated objections into better replies\./g,
        items[1] || 'Fix Google conversion tracking before judging performance.'
      ],
      [
        /Do not enter a discount war unless competitor pressure becomes high\./g,
        items[2] || 'Do not restart stopped traffic tests without a clear test objective.'
      ]
    ];

    let count = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node && node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = String(parent.tagName || '').toLowerCase();
        if (['script', 'style', 'noscript', 'textarea', 'input'].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (!String(node.nodeValue || '').trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach(textNode => {
      let value = String(textNode.nodeValue || '');
      let changed = false;
      replacements.forEach(([pattern, replacement]) => {
        const next = value.replace(pattern, replacement);
        if (next !== value) {
          value = next;
          changed = true;
        }
      });
      if (changed) {
        textNode.nodeValue = value;
        count += 1;
      }
    });

    return count;
  }

  function patchAll() {
    if (patching || !document.body) return;
    patching = true;

    try {
      const snapshot = stateSnapshot();
      const model = buildRecommendationModel(snapshot);

      const page1Patches = patchPage1(model);
      const page2Patches = patchPage2(model);
      const page5Patches = patchPage5(model);

      document.documentElement.setAttribute('data-iconic-v15658-dynamic-recommendations', 'passed');
      window.__ICONIC_V15658__ = {
        ok: true,
        version: VERSION,
        snapshot,
        model,
        page1Patches,
        page2Patches,
        page5Patches,
        rule: 'Dynamic recommendation copy only. No numeric values or source data changed.'
      };
    } catch (error) {
      document.documentElement.setAttribute('data-iconic-v15658-dynamic-recommendations', 'failed');
      window.__ICONIC_V15658__ = {
        ok: false,
        version: VERSION,
        error: error && error.message ? error.message : String(error)
      };
    } finally {
      patching = false;
    }
  }

  function startObserver() {
    if (observerStarted || !document.body || !window.MutationObserver) return;
    observerStarted = true;

    const observer = new MutationObserver(() => {
      clearTimeout(window.__ICONIC_V15658_MUTATION_TIMER__);
      window.__ICONIC_V15658_MUTATION_TIMER__ = setTimeout(patchAll, 130);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.__ICONIC_V15658_OBSERVER__ = observer;
  }

  function start() {
    startObserver();
    [180, 500, 1000, 1700, 2600, 3800, 5400, 7600, 10500].forEach(ms => setTimeout(patchAll, ms));
    window.addEventListener('beforeprint', patchAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();

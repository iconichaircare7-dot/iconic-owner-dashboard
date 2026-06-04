/*
Iconic AI CMO — Clean Dynamic Web Report Base
Version: v15.0.1-CLEAN-DYNAMIC-WEB-REPORT-BASE
Scope:
- Full replacement candidate for public/app.js
- Dynamic Web Report only
- Fetches /api/dashboard-data
- No PDF / No delivery
*/

const money = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 2
});

const number = new Intl.NumberFormat('en-AE');

function $(id) {
  return document.getElementById(id);
}

function safe(value, fallback = '-') {
  return value === undefined || value === null || value === '' ? fallback : value;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function setText(id, value, fallback = '-') {
  const el = $(id);
  if (!el) return;
  el.textContent = safe(value, fallback);
}

function setHTML(id, value, fallback = '-') {
  const el = $(id);
  if (!el) return;
  el.innerHTML = safe(value, fallback);
}

function clampText(value, max = 90, fallback = '-') {
  const text = String(safe(value, fallback)).trim();
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
  const n = String(name).toLowerCase();
  if (n.includes('google')) return 'google';
  if (n.includes('snap')) return 'snapchat';
  if (n.includes('tiktok') || n.includes('tik')) return 'tiktok';
  return 'meta';
}

function iconFor(name) {
  return PLATFORM_ICONS[platformKey(name)] || PLATFORM_ICONS.meta;
}

function normalizeData(raw) {
  const data = raw || {};
  const report = data.report || data.reportContext || {};
  const executive = data.executive || data.executiveSnapshot || {};
  const channels = data.channelsSummary || data.channels || data.channelSummary || [];
  const customer = data.customerIntelligence || {};
  const competitor = data.competitorIntelligence || {};
  const recommendations = data.recommendations || data.nextSteps || data.finalRecommendations || {};

  const fallbackChannels = [
    { name: 'Meta', platform: 'Facebook / Instagram', status: 'Strong', spend: 461.01, results: 287, costPerResult: 1.61, ctr: 'Stable', score: 94, decision: 'Keep active. No budget increase yet.' },
    { name: 'Google', platform: 'Search / Maps / Booking', status: 'Pending', spendLabel: 'Not active', resultsLabel: 'Pending', costPerResultLabel: 'No data', ctr: 'Tracking needed', score: 22, decision: 'Activate tracking before judging.' },
    { name: 'Snapchat', platform: 'Awareness / Testing', status: 'Testing', spendLabel: 'Testing', resultsLabel: 'Early signal', costPerResultLabel: 'Needs data', ctr: 'Watch 3 days', score: 58, decision: 'Keep testing. No scale yet.' },
    { name: 'TikTok', platform: 'Video / Future Growth', status: 'Not Active', spend: 0, results: 0, costPerResultLabel: 'No data', ctr: 'Not connected', score: 8, decision: 'Keep inactive until tracking is ready.' }
  ];

  return {
    report,
    executive,
    channels: asArray(channels).length ? channels : fallbackChannels,
    customer,
    competitor,
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

    const normalized = normalizeData(data);
    renderReport(normalized);
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
  setText('mainRisk', clampText(executive.mainRisk || 'Low', 24));
  setText('mainRiskDetail', clampText(executive.mainRiskDetail || 'No critical risk detected', 42));

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
    health.innerHTML = data.channels.slice(0, 4).map(channel => `
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
  const customer = data.customer || data.customerIntelligence || data.customer;

  setText('customerScore', customer.score || 82);
  setText('customerInsightTitle', clampText(customer.title || 'Strong buying signal. Price questions need better handling.', 80));
  setText('customerInsightText', clampText(customer.summary || 'Customers show interest in consultation, natural results, and booking. Price clarity remains the main objection.', 140));
  setText('buyingIntent', clampText(customer.buyingIntent || 'High', 18));
  setText('customerSentiment', clampText(customer.sentiment || 'Positive', 18));
  setText('mainObjection', clampText(customer.mainObjection || 'Price', 18));
  setText('repeatedObjection', clampText(customer.repeatedObjection || 'Price needs stronger framing.', 58));
  setText('conversionSignal', clampText(customer.conversionSignal || 'Booking questions are valuable.', 58));
  setText('replyRisk', clampText(customer.replyRisk || 'Weak replies can lose warm leads.', 58));
  setText('aiReplyAction', clampText(customer.aiReplyAction || 'Update replies to handle price with value, privacy, natural result, and direct consultation CTA.', 150));

  const fallbackQuestions = [
    { q: 'How much does hair replacement cost?', note: 'Use price range + value + consultation CTA.', tag: 'High Intent' },
    { q: 'Is the result natural and private?', note: 'Reassure privacy, natural look, and consultation.', tag: 'Trust Signal' },
    { q: 'Can I book a free consultation?', note: 'Send booking link and confirm branch timing.', tag: 'Booking' },
    { q: 'Dubai or Abu Dhabi branch availability?', note: 'Route to the nearest branch with clear timing.', tag: 'Branch' }
  ];

  const questions = asArray(customer.topQuestions).length ? customer.topQuestions : fallbackQuestions;
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

  renderBars('intentMix', asArray(customer.intentMix).length ? customer.intentMix : fallbackMix);
}

function renderPage4(data) {
  const competitor = data.competitor || data.competitorIntelligence || {};

  setText('radarClosestThreat', `Closest threat: ${clampText(competitor.topThreat || 'Yalla Hair', 26)}`);
  setText('radarIconicEdge', `Iconic edge: ${clampText(competitor.iconicEdge || 'privacy + premium consultation', 42)}`);
  setText('topThreat', clampText(competitor.topThreat || 'Yalla Hair', 28));
  setText('iconicEdge', clampText(competitor.iconicEdge || 'Privacy', 22));
  setText('competitorRisk', clampText(competitor.riskLevel || 'Medium', 18));
  setText('competitorResponse', clampText(competitor.response || 'Defend', 18));
  setText('counterMove', clampText(competitor.counterMove || 'Strengthen private premium consultation and proof-led content. Avoid discount war unless market pressure becomes high.', 155));

  const fallbackCompetitors = [
    { name: 'Yalla Hair', sub: 'Hair Patch Fixing & Hair Replacement Centre', score: 92, level: 'high', description: 'Strongest current threat because of direct messaging, visible social proof, and conversion-focused positioning.', tags: ['High Threat', 'Social Proof', 'Direct Offer'] },
    { name: 'Advanced Hair Studio', sub: 'Brand authority / trust competitor', score: 76, level: 'medium', description: 'Established authority. Threat is strongest around brand recognition and professional perception.', tags: ['Brand Threat', 'Trust', 'Authority'] },
    { name: 'Modern Hair Fixing Studio', sub: 'Regional hair fixing competitor', score: 61, level: 'watch', description: 'Tracked for hair fixing visibility and regional competitor messaging. Watch offers, reels, and consultation angles.', tags: ['Watch', 'Regional', 'Service Signal'] }
  ];

  const competitors = asArray(competitor.competitors).length ? competitor.competitors : fallbackCompetitors;
  const box = $('competitorCards');
  if (box) {
    box.innerHTML = competitors.slice(0, 3).map(item => `
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
  if (s.includes('strong') || s.includes('active')) return 'strong';
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

// v14.1.2 FINAL VISUAL REBUILD — Premium Owner Web Dashboard

const money = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 2
});

const number = new Intl.NumberFormat('en-AE');

const CHANNEL_META = {
  meta: { icon: '∞', accent: '#22c55e', label: 'Meta' },
  google: { icon: 'G', accent: '#fb923c', label: 'Google' },
  snapchat: { icon: '👻', accent: '#facc15', label: 'Snapchat' },
  tiktok: { icon: '♪', accent: '#a78bfa', label: 'TikTok' }
};

function $(id) {
  return document.getElementById(id);
}

function safe(value, fallback = '-') {
  return value === undefined || value === null || value === '' ? fallback : value;
}

function html(value, fallback = '-') {
  return String(safe(value, fallback))
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function fm(value) {
  return money.format(Number(value || 0)).replace('AED', 'AED ');
}

function fp(value) {
  return Number(value || 0).toFixed(2) + '%';
}

function setText(id, value, fallback = '-') {
  const el = $(id);
  if (el) el.textContent = safe(value, fallback);
}

async function loadDashboard() {
  try {
    const response = await fetch('/api/dashboard-data', {
      headers: { Accept: 'application/json' }
    });

    const data = await response.json();

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || 'Dashboard API failed');
    }

    render(data);
    document.body.classList.add('is-loaded');
  } catch (error) {
    setText('errorBox', error.message || String(error));
    $('errorBox')?.classList.remove('hidden');
  }
}

function render(data) {
  hero(data);
  exec(data.executive || {});
  channels(data.channels || {});
  customers(data.customerIntelligence || {});
  competitors(data.competitorIntelligence || {});
  recs(data.recommendations || {}, data.report || {});
}

function hero(data) {
  const report = data.report || {};
  const executive = data.executive || {};
  const health = data.health || {};

  setText('reportWeek', report.week, 'Week');
  setText('dateRange', report.dateRange, 'Date range');
  setText('generatedAt', data.generatedAt, 'Checking systems...');
  setText('executiveDecision', executive.decisionTitle, 'Decision loading...');
  setText('reportStatus', executive.status, 'All Systems Active');

  setText('healthData', health.dataSourcesConnected ? '✓ Data Sources Connected' : 'Data Sources Pending');
  setText('healthAI', health.aiAnalysisCompleted ? '✓ AI Analysis Completed' : 'AI Pending');
  setText('healthReady', health.readyForDecision ? '✓ Ready for Decision' : 'Not Ready');
}

function exec(executive) {
  setText('totalSpend', fm(executive.totalSpend));
  setText('totalSpendChange', executive.totalSpendChange, '+0.0%');

  setText('totalResults', number.format(Number(executive.totalResults || 0)));
  setText('totalResultsChange', executive.totalResultsChange, '+0.0%');

  setText('bestChannel', executive.bestChannel);
  setText('bestChannelDetail', executive.bestChannelDetail);

  setText('mainRisk', executive.mainRisk);
  setText('mainRiskDetail', executive.mainRiskDetail);

  setText('decisionTitle', executive.decisionTitle, 'Keep performance under review.');
  setText('decisionLine1', executive.decisionLine1, '');
  setText('decisionLine2', executive.decisionLine2, '');
}

function channels(channelsData) {
  const grid = $('channelsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  ['meta', 'google', 'snapchat', 'tiktok'].forEach((key) => {
    const channel = channelsData[key] || {};
    const meta = CHANNEL_META[key];

    const card = document.createElement('article');
    card.className = `channel channel-${key}`;
    card.dataset.channel = key;
    card.style.setProperty('--accent', meta.accent);

    card.innerHTML = `
      <div class="channel-head channelTop">
        <div>
          <div class="channel-name channelName">${html(channel.name, meta.label)}</div>
          <div class="channel-type channelType">${html(channel.resultType, 'Performance')}</div>
        </div>
        <div class="channel-icon channelIcon">${meta.icon}</div>
      </div>

      <div class="metric-grid">
        <div class="metric"><span>Spend</span><b>${html(fm(channel.spend))}</b></div>
        <div class="metric"><span>Results</span><b>${html(number.format(Number(channel.results || 0)))}</b></div>
        <div class="metric"><span>Cost / Result</span><b>${html(fm(channel.costPerResult))}</b></div>
        <div class="metric"><span>CTR</span><b>${html(fp(channel.ctr))}</b></div>
      </div>

      <div class="status-pill statusPill">${html(channel.status, 'WATCH')}</div>
    `;

    grid.appendChild(card);
  });
}

function customers(customerData) {
  bars('questionsList', customerData.topQuestions || [], 'label', 'ar');

  const sentiment = customerData.sentiment || {};
  const positive = Number(sentiment.positive || sentiment.mainPercent || 0);
  const neutral = Number(sentiment.neutral || 0);
  const negative = Math.max(0, Number(sentiment.negative || (100 - positive - neutral)));

  const donut = $('sentimentDonut');
  if (donut) {
    donut.style.background = `conic-gradient(var(--green) 0 ${positive}%, #cbd5e1 ${positive}% ${positive + neutral}%, var(--red) ${positive + neutral}% 100%)`;
  }

  setText('sentimentPercent', Math.round(Number(sentiment.mainPercent || positive || 0)) + '%');
  setText('sentimentLabel', sentiment.mainLabel, 'Positive');

  const legend = $('sentimentLegend');
  if (legend) {
    legend.innerHTML = `
      <div class="legendItem" style="color:#16a34a">● Positive ${Math.round(positive)}%</div>
      <div class="legendItem" style="color:#64748b">● Neutral ${Math.round(neutral)}%</div>
      <div class="legendItem" style="color:#dc2626">● Negative ${Math.round(negative)}%</div>
    `;
  }

  setText('customerRecommendation', customerData.recommendation, 'No recommendation yet.');
  chips('customerInsights', customerData.insights || [], '✓ ');
}

function competitors(competitorData) {
  const list = $('competitorsList');
  if (list) {
    list.innerHTML = '';

    (competitorData.competitors || []).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'competitor-row row';
      row.innerHTML = `
        <b>${html(item.name)}</b>
        <span>${html(item.status, 'Watch')}</span>
      `;
      list.appendChild(row);
    });
  }

  bars('promoThemes', competitorData.promoThemes || [], 'label', 'ar');

  const market = competitorData.marketPosition || {};
  setText('marketRank', market.rank, '#1');
  setText('shareOfVoice', Math.round(Number(market.shareOfVoice || 0)) + '% Share of Voice');
  setText('marketNote', market.note, 'Market position is being monitored.');

  chips('competitorInsights', competitorData.insights || [], '◉ ');
}

function recs(recommendations, report) {
  setText('nextReportDate', report.nextReportDate, '-');

  const topRecommendations = $('recommendationsList');
  if (topRecommendations) {
    topRecommendations.innerHTML = '';

    (recommendations.topRecommendations || []).forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'next-row numrow';
      row.innerHTML = `
        <div class="num">${index + 1}</div>
        <div>
          <b>${html(item.title)}</b>
          <div class="ar">${html(item.ar, '')}</div>
        </div>
      `;
      topRecommendations.appendChild(row);
    });
  }

  const nextSteps = $('nextStepsList');
  if (nextSteps) {
    nextSteps.innerHTML = '';

    (recommendations.nextSteps || []).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'next-row numrow';
      row.innerHTML = `
        <div class="num">✓</div>
        <div>
          <b>${html(item.title)}</b>
          <div class="ar">${html(item.ar, '')}</div>
        </div>
        <div class="date">${html(item.date, '')}</div>
      `;
      nextSteps.appendChild(row);
    });
  }
}

function bars(id, items, labelKey, subKey) {
  const target = $(id);
  if (!target) return;

  target.innerHTML = '';

  (items || []).forEach((item) => {
    const percent = Math.max(0, Math.min(100, Number(item.percent || 0)));
    const row = document.createElement('div');

    row.className = 'barRow';
    row.innerHTML = `
      <div class="barMeta">
        <div>
          <div>${html(item[labelKey])}</div>
          <div class="barSub">${html(item[subKey], '')}</div>
        </div>
        <b>${Math.round(percent)}%</b>
      </div>
      <div class="barTrack">
        <div class="barFill" style="width:${percent}%"></div>
      </div>
    `;

    target.appendChild(row);
  });
}

function chips(id, items, prefix) {
  const target = $(id);
  if (!target) return;

  target.innerHTML = '';

  (items || []).forEach((item) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = prefix + item;
    target.appendChild(chip);
  });
}

loadDashboard();

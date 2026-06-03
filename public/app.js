const money = new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-AE');

function $(id) {
  return document.getElementById(id);
}

function setText(id, value, fallback = '-') {
  const el = $(id);
  if (!el) return;
  el.textContent = value === undefined || value === null || value === '' ? fallback : value;
}

function safe(value, fallback = '-') {
  return value === undefined || value === null || value === '' ? fallback : value;
}

function fm(value) {
  return money.format(Number(value || 0)).replace('AED', 'AED ');
}

function compactMoney(value) {
  const formatted = fm(value);
  return formatted.replace('AED ', 'AED\n');
}

function normalizeDate(value) {
  if (!value) return 'Checking systems...';
  return String(value).replace('T', ' ').replace(/\.\d+Z?$/, '').replace('Z', ' GMT+4');
}

async function loadDashboard() {
  try {
    const response = await fetch('/api/dashboard-data', { headers: { Accept: 'application/json' } });
    const data = await response.json();

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || 'Dashboard API failed');
    }

    renderPageOne(data);
  } catch (error) {
    setText('errorBox', error.message || String(error));
    const box = $('errorBox');
    if (box) box.classList.remove('hidden');
  }
}

function renderPageOne(data) {
  const report = data.report || {};
  const executive = data.executive || {};
  const health = data.health || {};

  setText('reportWeek', safe(report.week, 'Week'));
  setText('dateRange', safe(report.dateRange, 'Date range'));

  setText('totalSpend', compactMoney(executive.totalSpend), 'AED\n0.00');
  setText('totalSpendChange', safe(executive.totalSpendChange, '+0.0%'));

  setText('totalResults', number.format(Number(executive.totalResults || 0)), '0');
  setText('totalResultsChange', safe(executive.totalResultsChange, '+0.0%'));

  setText('bestChannel', safe(executive.bestChannel, 'Meta'));
  setText('bestChannelDetail', safe(executive.bestChannelDetail, 'WhatsApp Conversations'));

  const roasDriver = safe(
    executive.mainRoasDriver || executive.roasDriver || executive.bestChannelDetail,
    'WhatsApp Conversations'
  );
  const roasDriverDetail = safe(
    executive.mainRoasDriverDetail || executive.roasDriverDetail || 'Lowest Cost / Result',
    'Lowest Cost / Result'
  );
  setText('mainRoasDriver', roasDriver);
  setText('mainRoasDriverDetail', roasDriverDetail);

  setText('mainRisk', safe(executive.mainRisk, 'No major risk detected'));
  setText('mainRiskDetail', safe(executive.mainRiskDetail, 'Stable'));

  setText('decisionTitle', safe(executive.decisionTitle, 'Keep Meta as the main engine.'));
  setText('decisionLine1', safe(executive.decisionLine1, 'Keep budget stable and review again after the next import.'));
  setText('decisionLine2', safe(executive.decisionLine2, 'Do not compare traffic clicks with WhatsApp conversations.'));

  setText('reportStatus', safe(executive.status, 'All Systems Active'));
  setText('generatedAt', normalizeDate(data.generatedAt));

  setText('healthData', health.dataSourcesConnected ? 'Data Sources Connected' : 'Data Sources Pending');
  setText('healthAI', health.aiAnalysisCompleted ? 'AI Analysis Completed' : 'AI Analysis Pending');
  setText('healthGenerated', data.generatedAt ? 'Report Generated' : 'Report Pending');
  setText('healthReady', health.readyForDecision ? 'Ready for Decision' : 'Not Ready');
}

loadDashboard();

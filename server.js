const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const OWNER_DASHBOARD_USER = process.env.OWNER_DASHBOARD_USER || 'admin';
const OWNER_DASHBOARD_PASS = process.env.OWNER_DASHBOARD_PASS || 'change-me';
const OWNER_DATA_API_URL = process.env.OWNER_DATA_API_URL || '';

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

app.use(basicAuth);
app.use(express.static('public', { etag: false, maxAge: 0 }));

app.get('/api/dashboard-data', async (req, res) => {
  try {
    if (!OWNER_DATA_API_URL) {
      return res.status(500).json({ ok: false, error: 'OWNER_DATA_API_URL is missing.' });
    }
    const response = await fetch(OWNER_DATA_API_URL, { headers: { Accept: 'application/json' } });
    const text = await response.text();
    if (!response.ok) return res.status(response.status).json({ ok: false, error: text.slice(0, 500) });
    return res.json(JSON.parse(text));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
});

app.get('/health', (req, res) => res.json({ ok: true, service: 'Iconic Owner Dashboard', version: 'v14.1.0' }));

app.listen(PORT, () => console.log(`Iconic Owner Dashboard running on ${PORT}`));

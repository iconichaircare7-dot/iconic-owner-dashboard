# Iconic AI CMO Owner Web Dashboard v14.1.0

## Scope

- Separate Render web app
- Node.js + Express
- Basic Auth
- Fetches Apps Script JSON from `OWNER_DATA_API_URL`
- No PDF export
- No WhatsApp
- No Email
- No Trigger
- No Team Inbox changes

## Render Environment Variables

```text
OWNER_DASHBOARD_USER=admin
OWNER_DASHBOARD_PASS=change-this-password
OWNER_DATA_API_URL=https://script.google.com/macros/s/XXXXX/exec?action=ownerDashboardData
```

## Local test

```bash
npm install
OWNER_DASHBOARD_USER=admin OWNER_DASHBOARD_PASS=123 OWNER_DATA_API_URL="https://script.google.com/macros/s/XXXXX/exec?action=ownerDashboardData" npm start
```

Open:

```text
http://localhost:3000
```

## Health

```text
/health
```

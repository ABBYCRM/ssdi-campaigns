DigitalOcean App Platform source: ABBYCRM/ssdi-campaigns
App: ssdi-campaigns (id fbb96140-d784-4008-87b4-9e7418318f2b)
Domains: ssdicampaigns.com, www.ssdicampaigns.com

This app is an independent SSDI campaign. Do **not** attach CaseClosedFL domains,
Resend keys, HubSpot tokens, or Vapi assistants.

Bind secrets in the App Platform dashboard (see `.do/app.yaml` placeholders):

- `HUBSPOT_ACCESS_TOKEN` — SSDI HubSpot private app (primary CRM)
- `GOOGLE_SHEETS_*` — optional backup / failover only
- `RESEND_API_KEY` — SSDI Resend project for ssdicampaigns.com
- `RESEND_FROM_EMAIL` — default `SSDI Campaigns <noreply@ssdicampaigns.com>`
- `RESEND_REPLY_TO` — default `info@ssdicampaigns.com`
- `VAPI_WEBHOOK_SECRET` / `VAPI_ASSISTANT_ID` — SSDI assistant only

Frontend: Docker web service on port 8080.
Intake API: `node backend/server.mjs` on port 8787 (`GET /health`, `POST /intake`, `POST /webhooks/vapi`).

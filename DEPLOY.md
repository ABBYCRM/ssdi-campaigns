DigitalOcean App Platform source: ABBYCRM/ssdi-campaigns
App: ssdi-campaigns (id fbb96140-d784-4008-87b4-9e7418318f2b)
Domains: ssdicampaigns.com, www.ssdicampaigns.com

This app is an independent SSDI campaign. Do **not** attach CaseClosedFL domains,
Resend keys, HubSpot tokens, Vapi assistants, or phone numbers (`+15615661360`).

Bind secrets in the App Platform dashboard (see `.do/app.yaml` placeholders):

- `HUBSPOT_ACCESS_TOKEN` — SSDI HubSpot private app (primary CRM)
- `GOOGLE_SHEETS_*` — optional backup / failover only
- `RESEND_API_KEY` — SSDI Resend project for ssdicampaigns.com
- `RESEND_FROM_EMAIL` — `SSDI Campaigns <noreply@ssdicampaigns.com>`
- `RESEND_REPLY_TO` — `Intake@abbycrm.com` (Luis-approved)
- `VITE_PUBLIC_PHONE` / `INBOUND_PHONE_NUMBER` — SSDI Vapi inbound (rebuild after setting)
- `VAPI_WEBHOOK_SECRET` / `VAPI_ASSISTANT_ID` — SSDI assistant only

## Verify ssdicampaigns.com in Resend

1. In the **SSDI** Resend project (not CaseClosedFL), open Domains → Add `ssdicampaigns.com`.
2. Add the DNS records Resend shows (SPF, DKIM; optional DMARC on the zone).
3. Wait until the domain status is **Verified**.
4. Send only from `noreply@ssdicampaigns.com` (`RESEND_FROM_EMAIL`). Reply-To is `Intake@abbycrm.com`.

Frontend: Docker web service on port 8080.
Intake API: `node backend/server.mjs` on port 8787 (`GET /health`, `POST /intake`, `POST /webhooks/vapi`).

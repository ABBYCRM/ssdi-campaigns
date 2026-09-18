DigitalOcean App Platform source: ABBYCRM/ssdi-campaigns
App: ssdi-campaigns (id fbb96140-d784-4008-87b4-9e7418318f2b)
Domains: ssdicampaigns.com, www.ssdicampaigns.com

This app is an independent SSDI campaign. Do **not** attach CaseClosedFL domains,
Resend keys, HubSpot tokens, Vapi assistants, or phone numbers (`+15615661360`).

Public contact:
- Phone: +1 (561) 652-0362 (`tel:+15616520362`)
- Email: Intake@abbycrm.com

Bind secrets in the App Platform dashboard (see `.do/app.yaml`):

- `HUBSPOT_ACCESS_TOKEN` — SSDI HubSpot private app (primary CRM)
- `GOOGLE_SHEETS_*` — optional backup / failover only
- `RESEND_API_KEY` — SSDI Resend project for ssdicampaigns.com
- `RESEND_FROM_EMAIL` — `SSDI Campaigns <noreply@ssdicampaigns.com>`
- `RESEND_REPLY_TO` — `Intake@abbycrm.com`
- `VITE_PUBLIC_PHONE` / `INBOUND_PHONE_NUMBER` — `+15616520362` (rebuild for VITE_*)
- `VAPI_ASSISTANT_ID` — `c0f5dd63-3c51-4eb6-9f62-8a6e2391c954`
- `VAPI_WEBHOOK_SECRET` — optional

Vapi server URL: `https://ssdicampaigns.com/api/vapi/inbound`

## Verify ssdicampaigns.com in Resend

1. In the **SSDI** Resend project (not CaseClosedFL), open Domains → Add `ssdicampaigns.com`.
2. Add the DNS records Resend shows (SPF, DKIM; optional DMARC on the zone).
3. Wait until the domain status is **Verified**.
4. Send only from `noreply@ssdicampaigns.com` (`RESEND_FROM_EMAIL`). Reply-To is `Intake@abbycrm.com`.

Frontend: Docker web service on port 8080 (includes `/api/vapi/inbound`).
Optional standalone intake: `node backend/server.mjs` on port 8787.

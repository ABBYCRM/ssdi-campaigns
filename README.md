# SSDI Campaigns

Independent Social Security Disability Insurance education and intake site. Helps people understand eligibility, applications, denials, and appeals — and connect with a campaign advisor.

**Not affiliated with, endorsed by, or authorized by the U.S. Social Security Administration.**

Live domain (planned): [ssdicampaigns.com](https://ssdicampaigns.com)

## What’s in this repo

- Multi-page campaign site (eligibility, application, denials, appeals, hearings, Blue Book, SSDI vs SSI, work credits, 50-state pages)
- TCPA-compliant screening form (E-SIGN + prior express written consent copy)
- SEO: JSON-LD, sitemap, robots, `llms.txt` / `ai.txt`
- Legal pages: privacy, terms, disclaimer, SMS terms, cookies, accessibility, do-not-sell, privacy request
- DigitalOcean App Platform spec (`.do/app.yaml`) + production `Dockerfile`
- Intake API in `backend/` — HubSpot-primary CRM persist, optional Google Sheets backup, SSDI-only Resend placeholders, Vapi webhook skeleton

## Stack

React 19 · TanStack Start/Router · Tailwind v4 · Zustand · Zod

## Local development

```bash
npm install
npm run dev
```

The app binds to `0.0.0.0:8080`.

```bash
npm run build
npm run typecheck
```

## Intake / CRM

Leads POST to `/intake` (standalone `backend/server.mjs`, also used in-process by the site when `HUBSPOT_ACCESS_TOKEN` is set on the web service).

1. **HubSpot is primary.** Create a private app in the **SSDI** HubSpot portal (`crm.objects.contacts.read` + `crm.objects.contacts.write`) and set `HUBSPOT_ACCESS_TOKEN`. Never commit it. Never use a CaseClosedFL token.
2. **Google Sheets is backup / failover only.** Set `GOOGLE_SHEETS_SPREADSHEET_ID` plus a service account (`GOOGLE_SHEETS_CLIENT_EMAIL` + `GOOGLE_SHEETS_PRIVATE_KEY`, or `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`). Sheets runs after a successful HubSpot write, or when HubSpot is unwired/unavailable. It is not the primary CRM.
3. **TCPA is fail-closed** (`tcpa === true` required). Consent and `source` are mapped onto the HubSpot contact.
4. **Resend is SSDI-domain only.** `RESEND_FROM_EMAIL` defaults to `SSDI Campaigns <noreply@ssdicampaigns.com>`. `RESEND_REPLY_TO` defaults to `Intake@abbycrm.com` (Luis-approved). Verify **ssdicampaigns.com** in the SSDI Resend project (Domains → DNS SPF/DKIM → status Verified) before sending. Do not reuse CaseClosedFL Resend keys or domains.
5. **Vapi** (`POST /webhooks/vapi`) is a separate SSDI assistant skeleton that posts completed-call leads into the same `/intake` path. Set `VAPI_ASSISTANT_ID` / `VAPI_WEBHOOK_SECRET`; do not paste CaseClosedFL assistant IDs.
6. **Public phone (click-to-call).** After the SSDI Vapi number exists, set `VITE_PUBLIC_PHONE` and `INBOUND_PHONE_NUMBER` to that E.164 number (rebuild required for `VITE_*`). Header, footer, and CTAs read it. Never hardcode CaseClosedFL `+15615661360`. Until provisioned, those CTAs link to `/contact`.

`GET /health` reports `crm: "wired" | "unwired"` from HubSpot token presence.

Field map, TCPA retention, and env details: [`backend/README.md`](backend/README.md). Example env file: [`.env.example`](.env.example).

Do not send health narratives to advertising properties.

## Deploy (DigitalOcean)

App spec is in [`.do/app.yaml`](.do/app.yaml). Frontend is the Docker web service; `backend/` is a separate Node component on port 8787.

## Disclaimer

This site is an independent campaign. It is not a law firm, does not provide legal advice, and is not affiliated with SSA, CMS, or HHS.

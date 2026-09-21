# SSDI Campaigns

Independent Social Security Disability Insurance education and intake site. Helps people understand eligibility, applications, denials, and appeals — and connect with a campaign advisor.

**Not affiliated with, endorsed by, or authorized by the U.S. Social Security Administration.**

Live domain: [ssdicampaigns.com](https://ssdicampaigns.com)

## What’s in this repo

- Multi-page campaign site (eligibility, application, denials, appeals, hearings, Blue Book, SSDI vs SSI, work credits, 50-state pages)
- TCPA-compliant screening form (E-SIGN + prior express written consent copy)
- SEO: JSON-LD, sitemap, robots, `llms.txt` / `ai.txt`
- Legal pages: privacy, terms, disclaimer, SMS terms, cookies, accessibility, do-not-sell, privacy request
- DigitalOcean App Platform spec (`.do/app.yaml`) + production `Dockerfile`
- Intake API in `backend/` — HubSpot-primary CRM, optional Google Sheets backup, SSDI-Validator, SSDI-portal desk, SSDI-only Resend, Vapi webhook

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

## Lead flow (SSDI Campaigns only)

```text
ssdicampaigns.com form  ─┐
                         ├─► POST /intake  (TCPA fail-closed)
Vapi +15614090180        ─┘       │
     webhook                      │
     https://ssdicampaigns.com/api/vapi/inbound
                                  ▼
                         HubSpot (PRIMARY)
                           contact upsert + intake NOTE
                           deal on "SSDI Campaigns" pipeline (New)
                           Sheets backup / failover
                                  ▼
                         SSDI-Validator  POST /v1/validations
                           (SSDI_VALIDATOR_URL + Bearer SSDI_VALIDATOR_TOKEN)
                                  ▼
                         HubSpot attach
                           ssdi_validator_status / ssdi_fraud_signal
                           validation NOTE
                           deal stage → Validated | Incomplete | Contradicted
                                  ▼
                         SSDI-portal desk  POST /api/webhooks/intake
                           (SSDI_PORTAL_URL + x-webhook-secret)
                                  ▼
                         Resend
                           From  SSDI Campaigns <noreply@ssdicampaigns.com>
                           Reply-To  Intake@abbycrm.com
```

Sibling services (built in parallel; this repo stubs until they are live):

| Service | Repo | This app calls | Env |
| --- | --- | --- | --- |
| Validator | `ABBYCRM/SSDI-Validator` | `POST /v1/validations` | `SSDI_VALIDATOR_URL`, `SSDI_VALIDATOR_TOKEN` (`ssdi_live_…`) |
| Ops desk | `ABBYCRM/SSDI-portal` | `POST /api/webhooks/intake` | `SSDI_PORTAL_URL`, `SSDI_PORTAL_WEBHOOK_SECRET` |

If those env vars are empty, `/intake` still succeeds to HubSpot/Sheets and `GET /health` reports `validator` / `portal` as `unwired`.

## Intake / CRM

Leads POST to `/intake` (standalone `backend/server.mjs`, also used in-process by the site when `HUBSPOT_ACCESS_TOKEN` is set on the web service).

1. **HubSpot is primary — first-class, not a stub.** Create a **new** private app named **SSDI Campaigns**. Preferred: a separate SSDI portal. Same AbbyCRM portal `247081451` is OK with this dedicated app (`ssdi_*` properties / SSDI Campaigns pipeline only — never MVA `intake_*` accident fields). Never reuse a CaseClosedFL token or `__HUBSPOT_ACCESS_TOKEN__` placeholder. Server-side create-or-update is the form equivalent (no HubSpot marketing-form embed on the site). Full property map, NOTES, and deal pipeline: [`docs/HUBSPOT.md`](docs/HUBSPOT.md).
2. **Google Sheets is backup / failover only.** Set `GOOGLE_SHEETS_SPREADSHEET_ID` plus a service account. Sheets runs after a successful HubSpot write, or when HubSpot is unwired/unavailable.
3. **TCPA is fail-closed** (`tcpa === true` required).
4. **SSDI-Validator** after a successful persist: `POST {SSDI_VALIDATOR_URL}/v1/validations`. Result `VALIDATED` / `INCOMPLETE` / `CONTRADICTED` is PATCHed onto the contact and written as a HubSpot NOTE.
5. **SSDI-portal desk** after validator: `POST {SSDI_PORTAL_URL}/api/webhooks/intake`.
6. **Resend is SSDI-domain only.** From `SSDI Campaigns <noreply@ssdicampaigns.com>`. Reply-To `Intake@abbycrm.com`. Verify **ssdicampaigns.com** in the SSDI Resend project (Domains → DNS SPF/DKIM → status Verified) before sending.
7. **Vapi.** Public webhook: `POST https://ssdicampaigns.com/api/vapi/inbound` (aliases `/webhooks/vapi`). Assistant id `c0f5dd63-3c51-4eb6-9f62-8a6e2391c954`. Optional `VAPI_WEBHOOK_SECRET`. Same persist path as the site form.
8. **Public phone / email.** Click-to-call is **+1 (561) 409-0180** (`VITE_PUBLIC_PHONE` / `INBOUND_PHONE_NUMBER` default `+15614090180`). Contact email is **Intake@abbycrm.com**.

`GET /health` reports `crm`, `sheets`, `validator`, `portal`, `email`, `vapi` as `wired` / `unwired` (sheets reports `backup` when configured).

Field map, HubSpot private-app scopes, TCPA retention, and env details: [`backend/README.md`](backend/README.md). Example env file: [`.env.example`](.env.example).

Do not send health narratives to advertising properties.

## Deploy (DigitalOcean)

App spec is in [`.do/app.yaml`](.do/app.yaml). Frontend is the Docker web service; `backend/` is a separate Node component on port 8787.

## Disclaimer

This site is an independent campaign. It is not a law firm, does not provide legal advice, and is not affiliated with SSA, CMS, or HHS.

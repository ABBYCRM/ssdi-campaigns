# SSDI Campaigns intake API

Standalone Node service (`backend/server.mjs`, default port **8787**). Independent SSDI campaign — **not affiliated with SSA**, and **not CaseClosedFL**.

Do **not** copy CaseClosedFL HubSpot private-app tokens, Resend API keys, sending domains, reply-to addresses, or Vapi assistant IDs into this app.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | `crm: "wired" \| "unwired"` from `HUBSPOT_ACCESS_TOKEN` presence |
| `POST` | `/intake` | Validate + persist a lead |
| `POST` | `/api/vapi/inbound` | **Production Vapi URL** — end-of-call / tool results → same persist path |
| `POST` | `/webhooks/vapi` | Alias of `/api/vapi/inbound` |

Intake JSON: `{ name, phone, email, disabilityType, state, zip, message, tcpa, sensitiveHealth, source }`.

**TCPA is fail-closed:** requests without `tcpa === true` (boolean) return `422`.

## Persistence order

1. **HubSpot (primary)** when `HUBSPOT_ACCESS_TOKEN` is set. Search by email then phone; create or update the contact. Maps TCPA consent (`ssdi_tcpa_consent`, `ssdi_tcpa_consent_at`) and campaign `source` (`ssdi_campaign_source`). Standard fields: `firstname`, `lastname`, `email`, `phone`, `state`, `zip`, `hs_lead_status=NEW`, `lifecyclestage=lead`.
2. **Google Sheets (backup / failover only)** when `GOOGLE_SHEETS_*` is fully set:
   - after a **successful** HubSpot write (backup copy), **or**
   - when HubSpot is **unwired** or the HubSpot API call **fails** (failover).
3. If HubSpot is wired and **both** HubSpot and Sheets fail → `502 crm_unavailable`.
4. If neither destination is configured → `202` with `forwardedTo: null` (accepted, not stored). Optional JSONL on the frontend path is separate.

Disability category and free-text notes stay on the CRM record. Do not send health narratives to advertising properties.

## HubSpot private app

Create a **new** private app in the SSDI HubSpot portal (not CaseClosedFL):

- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- optional `crm.schemas.contacts.write` so custom TCPA/source properties can be created

Set `HUBSPOT_ACCESS_TOKEN` in App Platform / the process environment. **Never commit it.**

TCPA retention: keep `ssdi_tcpa_consent` + `ssdi_tcpa_consent_at` for the life of the contact. Consent is prior express written consent / E-SIGN for this campaign only.

## Google Sheets backup

All of these must be set or Sheets stays unwired:

- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_RANGE` (default `Leads!A1`)
- **either** `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` **or** `GOOGLE_SHEETS_CLIENT_EMAIL` + `GOOGLE_SHEETS_PRIVATE_KEY`

Share the spreadsheet with the service account as Editor. This is **not** the primary CRM.

## Resend (SSDI domain only)

Placeholders in `.do/app.yaml`. Use a Resend account + domain for **ssdicampaigns.com**. Never reuse CaseClosedFL Resend keys or `caseclosedfl.com` from/reply addresses.

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | secret, SSDI Resend project |
| `RESEND_FROM_EMAIL` | `SSDI Campaigns <noreply@ssdicampaigns.com>` |
| `RESEND_REPLY_TO` | `Intake@abbycrm.com` (Luis-approved) |
| `INTAKE_NOTIFY_EMAIL` | optional ops inbox; defaults to reply-to |

**Verify `ssdicampaigns.com` before sending:** Resend → Domains → Add `ssdicampaigns.com` → copy SPF + DKIM (and optional DMARC) to DNS → wait until status is **Verified**. Until then, From `noreply@ssdicampaigns.com` will bounce or be rejected.

Values containing CaseClosedFL hostnames are ignored at runtime.

## Public click-to-call (SSDI Vapi number)

Provisioned inbound: **+1 (561) 652-0362** (`+15616520362`). Env defaults in `.do/app.yaml`:

- `VITE_PUBLIC_PHONE=+15616520362`
- `INBOUND_PHONE_NUMBER=+15616520362`

Do **not** use CaseClosedFL `+15615661360`. The site also defaults to the SSDI number in code if env is empty.

## Vapi webhook (SSDI assistant)

**Server URL (point the assistant here):** `https://ssdicampaigns.com/api/vapi/inbound`

- Assistant id: `c0f5dd63-3c51-4eb6-9f62-8a6e2391c954` (`VAPI_ASSISTANT_ID`)
- Accepts `end-of-call-report` and tool/function-call payloads; maps onto `/intake`
- Optional `VAPI_WEBHOOK_SECRET` (`x-vapi-secret` or `Authorization: Bearer`)
- Other assistant IDs (including CaseClosedFL) are ignored
- Aliases on the standalone API: `/webhooks/vapi`, `/vapi/webhook`

Structured data should include `tcpa: true` or the request fail-closes with `422`.

## Run locally

```bash
node backend/server.mjs
# GET http://127.0.0.1:8787/health
```

Tests (no network, mocked `fetch`):

```bash
npm test
# or
node --test backend/intake.test.mjs
```

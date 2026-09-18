# SSDI Campaigns intake API

Standalone Node service (`backend/server.mjs`, default port **8787**). Independent SSDI campaign — **not affiliated with SSA**.

Do **not** copy HubSpot private-app tokens, Resend API keys, sending domains, reply-to addresses, or Vapi assistant IDs from any other ABBYCRM product into this app.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | `crm` / `sheets` / `validator` / `portal` / `email` / `vapi` wired status |
| `POST` | `/intake` | Validate + persist a lead (full flow below) |
| `POST` | `/api/vapi/inbound` | **Production Vapi URL** — end-of-call / tool results → same persist path |
| `POST` | `/webhooks/vapi` | Alias of `/api/vapi/inbound` |

Intake JSON: `{ name, phone, email, disabilityType, state, zip, message, tcpa, sensitiveHealth, source }`.

**TCPA is fail-closed:** requests without `tcpa === true` (boolean) return `422`.

## Persistence order

```text
site form + Vapi (+15616520362)
        → POST /intake (or /api/vapi/inbound)
        → HubSpot primary (contact + intake NOTE + SSDI Campaigns deal)
        → Google Sheets backup / failover
        → SSDI-Validator POST /v1/validations
        → HubSpot PATCH validator_status / fraud_signal + validation NOTE + deal stage
        → SSDI-portal POST /api/webhooks/intake
        → Resend (noreply@ssdicampaigns.com / Reply-To Intake@abbycrm.com)
```

1. **HubSpot (primary)** when `HUBSPOT_ACCESS_TOKEN` is set. Search by email then phone; create or update the contact. This is the **server-side form equivalent** — we do not embed HubSpot marketing forms. Standard fields: `firstname`, `lastname`, `email`, `phone`, `state`, `zip`, `hs_lead_status`, `lifecyclestage=lead`. Custom `ssdi_*` properties listed below. An intake NOTE titled **SSDI Campaigns Qualified Educational Screening Intake** is associated to the contact. A deal is created on the **SSDI Campaigns** pipeline.
2. **Google Sheets (backup / failover only)** when `GOOGLE_SHEETS_*` is fully set:
   - after a **successful** HubSpot write (backup copy), **or**
   - when HubSpot is **unwired** or the HubSpot API call **fails** (failover).
3. **SSDI-Validator** when `SSDI_VALIDATOR_URL` + `SSDI_VALIDATOR_TOKEN` are set: `POST /v1/validations` with `Authorization: Bearer ssdi_live_…`. Payload is campaigns camelCase (`lead_id`, `name`, `phone`, `email`, `disabilityType`, `state`, `zip`, `message`, `tcpa`, `sensitiveHealth`, `source` = `web` \| `vapi-ssdi`). Timeout default 25s (`SSDI_VALIDATOR_TIMEOUT_MS`). On timeout or HTTP error the contact is marked `INCOMPLETE` — intake still returns `202`.
4. Validator result is attached to HubSpot: `ssdi_validator_status`, `ssdi_fraud_signal`, `ssdi_validator_id`, `ssdi_lead_stage`, a validation NOTE (`hubspot_note` HTML when the validator returns it), and the deal stage moves to Validated / Incomplete / Contradicted.
5. **SSDI-portal** when `SSDI_PORTAL_URL` is set: `POST /api/webhooks/intake` with `x-webhook-secret: $SSDI_PORTAL_WEBHOOK_SECRET`.
6. If HubSpot is wired and **both** HubSpot and Sheets fail → `502 crm_unavailable`.
7. If neither HubSpot nor Sheets is configured → `202` with `forwardedTo: null` (accepted, not stored). Optional JSONL on the frontend path is separate.
8. Validator and portal are **stubs when env is empty**. `/health` reports `unwired`. Do not block intake on a sibling service that is not live yet.

Disability category and free-text notes stay on the CRM record. Do not send health narratives to advertising properties.

## HubSpot private app (SSDI Campaigns — first-class)

Create a **new** private app named **SSDI Campaigns**. Preferred: a separate SSDI portal. Same AbbyCRM portal `247081451` is OK with this dedicated app (`ssdi_*` / SSDI Campaigns pipeline only — never MVA `intake_*` accident fields):

| Scope | Why |
| --- | --- |
| `crm.objects.contacts.read` + `write` | Create-or-update contacts |
| `crm.schemas.contacts.write` | Ensure `ssdi_*` properties |
| `crm.objects.notes.write` | Intake NOTE + validation NOTE |
| `crm.objects.deals.read` + `write` | Pipeline deals |
| `crm.schemas.deals.write` | Create the **SSDI Campaigns** deal pipeline once |

Set `HUBSPOT_ACCESS_TOKEN` in App Platform. **Never commit it. Never reuse a CaseClosedFL token or a `__HUBSPOT_ACCESS_TOKEN__` placeholder.** Portal `247081451` is allowed for this SSDI app. Step-by-step: [`docs/HUBSPOT.md`](../docs/HUBSPOT.md).

### Contact properties this API ensures

| Internal name | Maps from | Notes |
| --- | --- | --- |
| `firstname` / `lastname` | `name` | Split on first space |
| `phone` / `email` | intake | Search keys |
| `state` / `zip` | intake | Standard HubSpot fields **and** `ssdi_state` / `ssdi_zip` |
| `ssdi_disability_type` | `disabilityType` | CRM-only |
| `ssdi_tcpa_consent` + `ssdi_tcpa_consent_at` | `tcpa` | Retain for the life of the contact |
| `ssdi_sensitive_health_ack` | `sensitiveHealth` | |
| `ssdi_campaign_source` + `ssdi_source` | `source` | `site`, `vapi-ssdi`, state pages, … |
| `ssdi_intake_id` | lead id | |
| `ssdi_validator_status` | validator | `NEW` → `VALIDATING` → `VALIDATED` / `INCOMPLETE` / `CONTRADICTED` / `FOLLOW_UP` |
| `ssdi_fraud_signal` | validator `staff_verdict` / `fraud_overall` | Signal, not an accusation |
| `ssdi_validator_id` / `ssdi_validator_reason` | validator | |
| `ssdi_lead_stage` | pipeline mirror | Same enum as validator status |
| `ssdi_inbound_phone` | constant | `+15616520362` |
| `ssdi_message` | `message` | Truncated, CRM-only |

### Deal pipeline

Label **SSDI Campaigns**. Stages: **New → Validating → Validated / Incomplete / Contradicted → Follow-up**.

TCPA retention: keep `ssdi_tcpa_consent` + `ssdi_tcpa_consent_at` for the life of the contact. Consent is prior express written consent / E-SIGN for this campaign only.

## Google Sheets backup

All of these must be set or Sheets stays unwired:

- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_RANGE` (default `Leads!A1`)
- **either** `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` **or** `GOOGLE_SHEETS_CLIENT_EMAIL` + `GOOGLE_SHEETS_PRIVATE_KEY`

Share the spreadsheet with the service account as Editor. This is **not** the primary CRM.

## SSDI-Validator stub

| Variable | Value |
| --- | --- |
| `SSDI_VALIDATOR_URL` | Origin of ABBYCRM/SSDI-Validator (no trailing slash) |
| `SSDI_VALIDATOR_TOKEN` | Scoped API token, prefix `ssdi_live_` |
| `SSDI_VALIDATOR_TIMEOUT_MS` | optional, default `25000` |

Leave unset until the validator app is deployed. The client in `backend/lib/validator.mjs` returns `{ skipped: true, reason: "unwired" }`.

## SSDI-portal stub

| Variable | Value |
| --- | --- |
| `SSDI_PORTAL_URL` | Origin of ABBYCRM/SSDI-portal |
| `SSDI_PORTAL_WEBHOOK_SECRET` | Sent as `x-webhook-secret` (`INTAKE_WEBHOOK_SECRET` is an alias) |

Leave unset until the portal app is deployed. The client in `backend/lib/portal.mjs` returns `{ skipped: true, reason: "unwired" }`.

## Resend (SSDI domain only)

Placeholders in `.do/app.yaml`. Use a Resend account + domain for **ssdicampaigns.com**.

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | secret, SSDI Resend project |
| `RESEND_FROM_EMAIL` | `SSDI Campaigns <noreply@ssdicampaigns.com>` |
| `RESEND_REPLY_TO` | `Intake@abbycrm.com` |
| `INTAKE_NOTIFY_EMAIL` | optional ops inbox; defaults to reply-to |

**Verify `ssdicampaigns.com` before sending:** Resend → Domains → Add `ssdicampaigns.com` → copy SPF + DKIM (and optional DMARC) to DNS → wait until status is **Verified**. Until then, From `noreply@ssdicampaigns.com` will bounce or be rejected.

Values containing other-campaign hostnames are ignored at runtime.

## Public click-to-call (SSDI Vapi number)

Provisioned inbound: **+1 (561) 652-0362** (`+15616520362`). Env defaults in `.do/app.yaml`:

- `VITE_PUBLIC_PHONE=+15616520362`
- `INBOUND_PHONE_NUMBER=+15616520362`

The site also defaults to this number in code if env is empty.

## Vapi webhook (SSDI assistant)

**Server URL (point the assistant here):** `https://ssdicampaigns.com/api/vapi/inbound`

- Assistant id: `c0f5dd63-3c51-4eb6-9f62-8a6e2391c954` (`VAPI_ASSISTANT_ID`)
- Accepts `end-of-call-report` and tool/function-call payloads; maps onto `/intake`
- Optional `VAPI_WEBHOOK_SECRET` (`x-vapi-secret` or `Authorization: Bearer`)
- Other assistant IDs are ignored
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

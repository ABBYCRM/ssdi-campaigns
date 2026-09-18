# SSDI HubSpot setup (first-class CRM)

HubSpot is the **primary CRM** for SSDI Campaigns. This is a full create-or-update integration (contacts, custom properties, intake + validation NOTES, deal pipeline), not a stub. Google Sheets stays backup / failover only.

**Never reuse a CaseClosedFL HubSpot private-app token.** Isolation is by **app + property namespace**, not portal id.

**Preferred:** a separate SSDI HubSpot portal. **Same portal is OK** when a second portal is not available: create a dedicated **SSDI Campaigns** private app on the existing AbbyCRM HubSpot account (portal `247081451`) with only `ssdi_*` properties and the **SSDI Campaigns** pipeline — never MVA `intake_*` accident fields.

Runtime still refuses CaseClosedFL inbound phone `+15615661360`, CaseClosedFL Resend identities (`noreply@caseclosedfl.com`, caseclosedfl.com domain keys), and hard-coded HubSpot token placeholders (`__HUBSPOT_ACCESS_TOKEN__`, CaseClosedFL `__…__` tokens). Portal `247081451` is **not** refused.

## Create the SSDI private app

1. HubSpot → Settings → Integrations → Private Apps → **Create a private app** named **SSDI Campaigns** (new app, even if this is the AbbyCRM portal).
2. Scopes:

| Scope | Why |
| --- | --- |
| `crm.objects.contacts.read` | Search by email / phone |
| `crm.objects.contacts.write` | Create-or-update contacts |
| `crm.schemas.contacts.write` | Ensure `ssdi_*` properties + `ssdi_campaigns_intake` group |
| `crm.objects.notes.write` | Intake NOTE + validation NOTE |
| `crm.objects.deals.read` + `crm.objects.deals.write` | SSDI Campaigns pipeline deals |
| `crm.schemas.deals.write` | Create the pipeline once |
| `forms` (optional) | Server-side Forms v3 submit when `HUBSPOT_FORM_ID` is set |

3. Copy the token into App Platform as `HUBSPOT_ACCESS_TOKEN`. Never commit it. Never paste the CaseClosedFL private-app token or a `__HUBSPOT_ACCESS_TOKEN__` placeholder.
4. Optional: `HUBSPOT_PORTAL_ID`. Preferred: a dedicated SSDI portal. Unset, or `247081451` for the AbbyCRM account with the SSDI private app, are both allowed.
5. Optional: `HUBSPOT_FORM_ID` — GUID of an SSDI HubSpot form named **SSDI Campaigns Intake**. If unset, the site form still maps through the CRM API (the server-side form equivalent). Set this only if you want HubSpot form-submission analytics too.

## What `/intake` writes

Site form and Vapi (`https://ssdicampaigns.com/api/vapi/inbound`) share this mapping.

| Intake field | HubSpot |
| --- | --- |
| `name` | `firstname` / `lastname` |
| `phone` | `phone` |
| `email` | `email` |
| `state` | standard `state` **and** `ssdi_state` |
| `zip` | standard `zip` **and** `ssdi_zip` |
| `disabilityType` | `ssdi_disability_type` |
| `tcpa` | `ssdi_tcpa_consent` + `ssdi_tcpa_consent_at` (fail-closed: must be boolean `true`) |
| `sensitiveHealth` | `ssdi_sensitive_health_ack` |
| `source` | `ssdi_campaign_source` + `ssdi_source` |
| `message` | `ssdi_message` (truncated, CRM-only) |
| lead id | `ssdi_intake_id` |
| — | `ssdi_inbound_phone` = `+15616520362` |
| validator | `ssdi_validator_status`, `ssdi_fraud_signal`, `ssdi_validator_id`, `ssdi_validator_reason`, `ssdi_lead_stage` |

Properties live in the **SSDI Campaigns Intake** group (`ssdi_campaigns_intake`). They are created automatically on first successful write when the private app has schema scope.

## Pipeline

Deal pipeline label: **SSDI Campaigns**.

`New → Validating → Validated | Incomplete | Contradicted → Follow-up`

Created automatically when `crm.schemas.deals.write` is granted. Associated to the contact. Stage moves after SSDI-Validator returns.

## NOTES

1. **Intake NOTE** (WhatsApp-style HTML): title line `SSDI Campaigns Qualified Educational Screening Intake` — TCPA, state, zip, disability type, source. Vapi leads get an inbound-voice section.
2. **Validation NOTE** after SSDI-Validator `POST /v1/validations`: uses `hubspot_note` HTML from the validator when present; otherwise a staff summary with `VALIDATED` / `INCOMPLETE` / `CONTRADICTED` and `fraud_signal`.

## Form equivalent

There is **no HubSpot form embed** on ssdicampaigns.com (TCPA must stay fail-closed in our API). The site `<IntakeForm>` and Vapi webhook are the form; `POST /intake` is the server-side HubSpot form equivalent (CRM upsert + NOTE + deal). Optional `HUBSPOT_FORM_ID` also POSTs HubSpot Forms v3 so the same lead appears in form submissions.

## Isolation checklist

- Dedicated **SSDI Campaigns** private app (different app from CaseClosedFL). Preferred: separate portal. Same AbbyCRM portal `247081451` is OK with this app.
- Token is **not** the CaseClosedFL token and **not** a `__HUBSPOT_ACCESS_TOKEN__` / CaseClosedFL placeholder.
- `HUBSPOT_PORTAL_ID` may be unset or `247081451` for SSDI; runtime does not refuse that portal.
- Auto-create **only** `ssdi_*` properties (group `ssdi_campaigns_intake`) and the **SSDI Campaigns** deal pipeline.
- Never write MVA / CaseClosedFL property names (`intake_accident_date`, `intake_case_type`, …).
- Still refuse CaseClosedFL inbound `+15615661360` and Resend identities (`noreply@caseclosedfl.com`, caseclosedfl.com keys).

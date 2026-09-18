import { envTrim } from "./brand.mjs";
import {
  attachValidatorToHubSpot,
  isHubSpotWired,
  upsertHubSpotContact,
} from "./hubspot.mjs";
import { isPortalWired, submitPortalLead } from "./portal.mjs";
import { notifyIntakeEmail } from "./resend.mjs";
import { appendGoogleSheet, isSheetsConfigured } from "./sheets.mjs";
import { toLead, validateIntake } from "./validate.mjs";
import { isValidatorWired, submitValidation } from "./validator.mjs";

function forwardedTo({ hubspot, sheets, validator, portal }) {
  const parts = [];
  if (hubspot?.ok) parts.push("hubspot");
  if (sheets?.ok) parts.push("sheets");
  if (validator?.ok) parts.push("validator");
  if (portal?.ok) parts.push("portal");
  return parts.length ? parts.join("+") : null;
}

export function healthStatus(env = process.env) {
  return {
    ok: true,
    crm: isHubSpotWired(env) ? "wired" : "unwired",
    sheets: isSheetsConfigured(env) ? "backup" : "unwired",
    validator: isValidatorWired(env) ? "wired" : "unwired",
    portal: isPortalWired(env) ? "wired" : "unwired",
    email: envTrim(env, "RESEND_API_KEY") ? "wired" : "unwired",
    vapi:
      envTrim(env, "VAPI_WEBHOOK_SECRET") || envTrim(env, "VAPI_ASSISTANT_ID")
        ? "wired"
        : "unwired",
    brand: "ssdi-campaigns",
  };
}

function summarizeValidator(validator) {
  if (!validator) return { ok: false, wired: false, skipped: true, reason: "unwired" };
  return {
    ok: validator.ok === true,
    wired: validator.skipped !== true,
    skipped: validator.skipped === true,
    status: validator.status || null,
    reason: validator.reason || validator.error || undefined,
    validationId: validator.validationId || null,
    fraudSignal: validator.fraudSignal || null,
  };
}

function summarizePortal(portal, wired) {
  if (!portal) return { ok: false, wired: false, skipped: true, reason: "unwired" };
  return {
    ok: portal.ok === true,
    wired,
    skipped: portal.skipped === true,
    reason: portal.reason || portal.error || undefined,
  };
}

/**
 * Persist a validated lead.
 *
 * Flow (SSDI Campaigns only):
 *   site form + Vapi → TCPA validate → HubSpot primary (+ Sheets backup)
 *   → SSDI-Validator POST /v1/validations → HubSpot properties + NOTE
 *   → SSDI-portal desk → Resend
 *
 * HubSpot is PRIMARY when HUBSPOT_ACCESS_TOKEN is set.
 * Google Sheets (GOOGLE_SHEETS_*) is BACKUP/FAILOVER only.
 * Validator/portal are stubs when SSDI_VALIDATOR_URL / SSDI_PORTAL_URL are unset.
 */
export async function persistIntake(payload, deps = {}) {
  const env = deps.env ?? process.env;
  const fetchFn = deps.fetch ?? globalThis.fetch;
  const validated = validateIntake(payload);
  if (!validated.ok) return validated;

  const lead = toLead(validated.data, {
    id: deps.id || payload.id,
    receivedAt: deps.receivedAt || payload.receivedAt,
  });

  const hubspotWired = isHubSpotWired(env);
  let hubspot = { ok: false, skipped: !hubspotWired, reason: hubspotWired ? undefined : "unwired" };
  if (hubspotWired) {
    hubspot = await upsertHubSpotContact(lead, { env, fetch: fetchFn, extra: { stage: "NEW" } });
  }

  const sheetsWired = isSheetsConfigured(env);
  const hubspotOk = hubspot.ok === true;
  const hubspotUnavailable = !hubspotWired || !hubspotOk;
  const shouldSheets = sheetsWired && (hubspotOk || hubspotUnavailable);

  let sheets = { ok: false, skipped: true, reason: "not_configured" };
  if (!sheetsWired) {
    sheets = { ok: false, skipped: true, reason: "not_configured" };
  } else if (!shouldSheets) {
    sheets = { ok: false, skipped: true, reason: "primary_only" };
  } else {
    sheets = await appendGoogleSheet(lead, { env, fetch: fetchFn });
  }

  const persisted = hubspotOk || sheets.ok === true;

  let validator = { ok: false, skipped: true, reason: "not_persisted", status: null };
  let portal = { ok: false, skipped: true, reason: "not_persisted" };

  if (persisted) {
    if (hubspotOk && hubspot.contactId && isValidatorWired(env)) {
      await attachValidatorToHubSpot(lead, hubspot.contactId, { status: "VALIDATING" }, {
        env,
        fetch: fetchFn,
        note: false,
      }).catch((err) => console.error("hubspot validating stage failed", err));
    }

    validator = await submitValidation(lead, { env, fetch: fetchFn });

    if (hubspotOk && hubspot.contactId && validator.skipped !== true) {
      await attachValidatorToHubSpot(lead, hubspot.contactId, validator, { env, fetch: fetchFn }).catch((err) => {
        console.error("hubspot validator attach failed", err);
      });
    }

    portal = await submitPortalLead(
      lead,
      {
        validatorStatus: validator.status,
        validatorId: validator.validationId,
        fraudSignal: validator.fraudSignal,
        hubspotContactId: hubspot.contactId,
      },
      { env, fetch: fetchFn },
    );

    await notifyIntakeEmail(lead, {
      env,
      fetch: fetchFn,
      validator,
      portal,
      hubspot,
    }).catch((err) => {
      console.error("intake email failed", err);
    });
  }

  if (hubspotWired && !hubspotOk && !sheets.ok) {
    return {
      ok: false,
      status: 502,
      error: "crm_unavailable",
      id: lead.id,
      forwardedTo: null,
      hubspot,
      sheets,
      validator: summarizeValidator(validator),
      portal: summarizePortal(portal, isPortalWired(env)),
    };
  }

  const note = persisted
    ? hubspotOk
      ? sheets.ok
        ? "HubSpot primary write succeeded; Sheets backup appended."
        : sheetsWired
          ? "HubSpot primary write succeeded; Sheets backup failed."
          : "HubSpot primary write succeeded."
      : sheets.ok
        ? hubspotWired
          ? "HubSpot unavailable; Sheets failover appended."
          : "HubSpot unwired; Sheets backup appended."
        : "Accepted; no CRM destination configured."
    : "Accepted and not forwarded. Set HUBSPOT_ACCESS_TOKEN (primary) or GOOGLE_SHEETS_* (backup).";

  const validatorBit =
    validator.skipped === true
      ? validator.reason === "unwired"
        ? " Validator unwired (set SSDI_VALIDATOR_URL + SSDI_VALIDATOR_TOKEN)."
        : ""
      : ` Validator ${validator.status || (validator.ok ? "ok" : "failed")}.`;
  const portalBit =
    portal.skipped === true && portal.reason === "unwired"
      ? " Portal unwired (set SSDI_PORTAL_URL)."
      : portal.ok
        ? " Portal desk notified."
        : "";

  return {
    ok: true,
    status: 202,
    id: lead.id,
    receivedAt: lead.receivedAt,
    forwardedTo: forwardedTo({ hubspot, sheets, validator, portal }),
    hubspot: {
      ok: hubspotOk,
      wired: hubspotWired,
      action: hubspot.action,
      contactId: hubspot.contactId,
      dealId: hubspot.deal?.dealId,
      noteId: hubspot.note?.noteId,
      reason: hubspot.reason,
    },
    sheets: {
      ok: sheets.ok === true,
      wired: sheetsWired,
      skipped: sheets.skipped === true,
      reason: sheets.reason,
    },
    validator: summarizeValidator(validator),
    portal: summarizePortal(portal, isPortalWired(env)),
    note: `${note}${validatorBit}${portalBit}`,
  };
}

import { envTrim } from "./brand.mjs";
import {
  attachValidatorToHubSpot,
  isHubSpotWired,
  upsertHubSpotContact,
} from "./hubspot.mjs";
import { isPortalWired, submitPortalLead } from "./portal.mjs";
import { emailLeadMoreInfo, notifyIntakeEmail } from "./resend.mjs";
import { appendGoogleSheet, isSheetsConfigured } from "./sheets.mjs";
import { toLead, validateIntake } from "./validate.mjs";
import { evaluateIntakeGate, isValidatorWired, submitValidation } from "./validator.mjs";

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
    sheets: isSheetsConfigured(env) ? "wired" : "unwired",
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
 * HubSpot-first due diligence. Screening gate may set rejected=true for Vapi
 * speech; CRM create is not refused.
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
  let leadEmail = { ok: false, skipped: true, reason: "not_persisted" };
  let gate = { rejected: false };

  if (persisted) {
    if (hubspotOk && hubspot.contactId && isValidatorWired(env)) {
      await attachValidatorToHubSpot(lead, hubspot.contactId, { status: "VALIDATING" }, {
        env,
        fetch: fetchFn,
        note: false,
      }).catch((err) => console.error("hubspot validating stage failed", err));
    }

    validator = await submitValidation(lead, { env, fetch: fetchFn });
    gate = evaluateIntakeGate(lead, validator);

    if (hubspotOk && hubspot.contactId) {
      const attachPayload =
        gate.rejected && (validator.skipped === true || !validator.status)
          ? {
              ok: true,
              status: "CONTRADICTED",
              reason: gate.reason,
              fraudSignal: validator.fraudSignal,
              validationId: validator.validationId,
            }
          : validator.skipped === true
            ? null
            : validator;
      if (attachPayload) {
        await attachValidatorToHubSpot(lead, hubspot.contactId, attachPayload, { env, fetch: fetchFn }).catch((err) => {
          console.error("hubspot validator attach failed", err);
        });
      }
    }

    portal = await submitPortalLead(
      lead,
      {
        validatorStatus: gate.rejected ? "CONTRADICTED" : validator.status,
        validatorId: validator.validationId,
        fraudSignal: validator.fraudSignal,
        hubspotContactId: hubspot.contactId,
        rejected: gate.rejected === true,
        rejectReason: gate.reason || null,
        reviewRequired: gate.reviewRequired === true,
      },
      { env, fetch: fetchFn },
    );

    await notifyIntakeEmail(lead, {
      env,
      fetch: fetchFn,
      validator,
      portal,
      hubspot,
      gate,
    }).catch((err) => console.error("intake email failed", err));

    if (lead.email && !gate.rejected) {
      leadEmail = await emailLeadMoreInfo(lead, { env, fetch: fetchFn }).catch((err) => {
        console.error("lead more-info email failed", err);
        return { ok: false, error: "lead_email_failed" };
      });
    } else if (gate.rejected) {
      leadEmail = { ok: false, skipped: true, reason: "screening_rejected" };
    } else {
      leadEmail = { ok: false, skipped: true, reason: "no_lead_email" };
    }
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
      accepted: false,
      rejected: false,
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
  const gateBit = gate.rejected
    ? ` Screening rejected (${gate.reason}) — HubSpot kept for due diligence; Vapi should not promise follow-up.`
    : gate.reviewRequired
      ? " Screening flagged for manual review."
      : "";
  const leadBit = leadEmail.ok ? " Lead more-info email sent." : "";

  return {
    ok: true,
    status: 202,
    id: lead.id,
    receivedAt: lead.receivedAt,
    accepted: gate.rejected !== true,
    rejected: gate.rejected === true,
    rejectReason: gate.reason || undefined,
    reviewRequired: gate.reviewRequired === true,
    speak: gate.speak || undefined,
    forwardedTo: forwardedTo({ hubspot, sheets, validator, portal }),
    hubspot: {
      ok: hubspotOk,
      wired: hubspotWired,
      action: hubspot.action,
      contactId: hubspot.contactId,
      dealId: hubspot.deal?.dealId,
      noteId: hubspot.note?.noteId,
      reason: hubspot.reason,
      portalId: hubspot.portalId,
    },
    sheets: {
      ok: sheets.ok === true,
      wired: sheetsWired,
      skipped: sheets.skipped === true,
      reason: sheets.reason,
    },
    validator: summarizeValidator(validator),
    portal: summarizePortal(portal, isPortalWired(env)),
    leadEmail: {
      ok: leadEmail.ok === true,
      skipped: leadEmail.skipped === true,
      reason: leadEmail.reason || leadEmail.error,
    },
    note: `${note}${validatorBit}${portalBit}${gateBit}${leadBit}`,
  };
}

import { envTrim } from "./brand.mjs";
import { isHubSpotWired, upsertHubSpotContact } from "./hubspot.mjs";
import { notifyIntakeEmail } from "./resend.mjs";
import { appendGoogleSheet, isSheetsConfigured } from "./sheets.mjs";
import { toLead, validateIntake } from "./validate.mjs";

function forwardedTo({ hubspot, sheets }) {
  const parts = [];
  if (hubspot?.ok) parts.push("hubspot");
  if (sheets?.ok) parts.push("sheets");
  return parts.length ? parts.join("+") : null;
}

export function healthStatus(env = process.env) {
  return {
    ok: true,
    crm: isHubSpotWired(env) ? "wired" : "unwired",
    sheets: isSheetsConfigured(env) ? "backup" : "unwired",
    email: envTrim(env, "RESEND_API_KEY") ? "wired" : "unwired",
    vapi:
      envTrim(env, "VAPI_WEBHOOK_SECRET") || envTrim(env, "VAPI_ASSISTANT_ID")
        ? "wired"
        : "unwired",
    brand: "ssdi-campaigns",
  };
}

/**
 * Persist a validated lead.
 *
 * HubSpot is PRIMARY when HUBSPOT_ACCESS_TOKEN is set.
 * Google Sheets (GOOGLE_SHEETS_*) is BACKUP/FAILOVER only:
 *   - after a successful HubSpot write, or
 *   - when HubSpot is unwired or the HubSpot API call failed.
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
    hubspot = await upsertHubSpotContact(lead, { env, fetch: fetchFn });
  }

  const sheetsWired = isSheetsConfigured(env);
  const hubspotOk = hubspot.ok === true;
  const hubspotUnavailable = !hubspotWired || !hubspotOk;
  // Backup after HubSpot success, or failover when HubSpot is unwired/failed.
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
  if (persisted) {
    await notifyIntakeEmail(lead, { env, fetch: fetchFn }).catch((err) => {
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

  return {
    ok: true,
    status: 202,
    id: lead.id,
    receivedAt: lead.receivedAt,
    forwardedTo: forwardedTo({ hubspot, sheets }),
    hubspot: {
      ok: hubspotOk,
      wired: hubspotWired,
      action: hubspot.action,
      contactId: hubspot.contactId,
    },
    sheets: {
      ok: sheets.ok === true,
      wired: sheetsWired,
      skipped: sheets.skipped === true,
      reason: sheets.reason,
    },
    note,
  };
}

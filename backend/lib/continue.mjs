import { createHubSpotNote, searchContactByIntakeId } from "./hubspot.mjs";

function asChoice(value) {
  if (value == null || value === "") return undefined;
  const s = String(value).trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(s)) return "yes";
  if (["no", "n", "false", "0"].includes(s)) return "no";
  if (["unsure", "unknown", "maybe", "not_sure", "not-sure"].includes(s)) return "unsure";
  return undefined;
}

/**
 * Soft-append HubSpot note for /continue follow-up details.
 */
export async function persistContinueDetails(payload, deps = {}) {
  const env = deps.env ?? process.env;
  const fetchFn = deps.fetch ?? globalThis.fetch;
  const id = String(payload?.id || "").trim();
  if (id.length < 8) return { ok: false, status: 422, error: "validation" };

  const durationLikely12Months = asChoice(payload.durationLikely12Months);
  const workingAboveSga = asChoice(payload.workingAboveSga);
  const workCreditsLikely = asChoice(payload.workCreditsLikely);
  const message = String(payload.message || "").trim().slice(0, 2000) || undefined;

  if (!durationLikely12Months && !workingAboveSga && !workCreditsLikely && !message) {
    return { ok: false, status: 422, error: "empty" };
  }

  const found = await searchContactByIntakeId(id, { env, fetch: fetchFn });
  if (!found.ok || !found.contactId) {
    return {
      ok: true,
      status: 202,
      id,
      hubspot: { ok: false, reason: found.reason || found.error || "not_found" },
      note: "Thanks — we received your details.",
    };
  }

  const lines = [
    "<b>Lead follow-up details (/continue)</b>",
    `Intake ID: ${id}`,
    durationLikely12Months ? `Likely lasts 12+ months: ${durationLikely12Months}` : null,
    workingAboveSga ? `Working above SGA: ${workingAboveSga}` : null,
    workCreditsLikely ? `Work credits likely: ${workCreditsLikely}` : null,
    message ? `Notes: ${message}` : null,
    "Source: continue-page",
  ].filter(Boolean);

  const noteResult = await createHubSpotNote(found.contactId, lines.join("<br/>"), { env, fetch: fetchFn });
  return {
    ok: true,
    status: 202,
    id,
    hubspot: { ok: noteResult.ok === true, contactId: found.contactId, noteId: noteResult.noteId },
    note: "Thanks — we received your details.",
  };
}

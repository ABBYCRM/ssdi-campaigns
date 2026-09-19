function asString(value) {
  if (value == null) return "";
  return String(value).trim();
}

function asBool(value) {
  return value === true;
}

function asOptionalBool(value) {
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return undefined;
}

/** Normalize yes / no / unsure from form or Vapi tool args. */
export function asYesNoUnsure(value) {
  if (value == null || value === "") return undefined;
  const s = String(value).trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(s)) return "yes";
  if (["no", "n", "false", "0"].includes(s)) return "no";
  if (["unsure", "unknown", "maybe", "not_sure", "not-sure"].includes(s)) return "unsure";
  return undefined;
}

/**
 * Fail closed unless TCPA is the boolean true. Optional CRM fields are
 * normalized but not required (voice leads may omit state/email).
 * Optional qualification fields (duration / SGA / credits / e-sign) are
 * persisted when present for educational screening gatekeeping.
 */
export function validateIntake(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, status: 422, error: "validation" };
  }

  const name = asString(payload.name);
  const phone = asString(payload.phone);
  const digits = phone.replace(/\D/g, "");
  const tcpa = asBool(payload.tcpa);

  if (name.length < 2 || digits.length < 10 || tcpa !== true) {
    return { ok: false, status: 422, error: "validation" };
  }

  const email = asString(payload.email);
  const data = {
    name: name.slice(0, 120),
    phone,
    email: email || undefined,
    disabilityType: asString(payload.disabilityType) || undefined,
    state: asString(payload.state) || undefined,
    zip: asString(payload.zip).slice(0, 10) || undefined,
    message: asString(payload.message).slice(0, 2000) || undefined,
    tcpa: true,
    sensitiveHealth: payload.sensitiveHealth === true,
    source: asString(payload.source) || "ssdi-campaigns",
  };

  const durationLikely12Months = asOptionalBool(payload.durationLikely12Months);
  if (durationLikely12Months !== undefined) data.durationLikely12Months = durationLikely12Months;

  const workingAboveSga = asYesNoUnsure(payload.workingAboveSga);
  if (workingAboveSga !== undefined) data.workingAboveSga = workingAboveSga;

  const workCreditsLikely = asYesNoUnsure(payload.workCreditsLikely);
  if (workCreditsLikely !== undefined) data.workCreditsLikely = workCreditsLikely;

  const esignConsent = asOptionalBool(payload.esignConsent);
  if (esignConsent !== undefined) data.esignConsent = esignConsent;

  return { ok: true, data };
}

export function toLead(data, { id, receivedAt } = {}) {
  const lead = {
    id: id || data.id || crypto.randomUUID(),
    receivedAt: receivedAt || data.receivedAt || new Date().toISOString(),
    name: data.name,
    phone: data.phone,
    email: data.email,
    disabilityType: data.disabilityType,
    state: data.state,
    zip: data.zip,
    message: data.message,
    tcpa: true,
    sensitiveHealth: data.sensitiveHealth === true,
    source: data.source || "ssdi-campaigns",
  };
  if (data.durationLikely12Months !== undefined) lead.durationLikely12Months = data.durationLikely12Months;
  if (data.workingAboveSga !== undefined) lead.workingAboveSga = data.workingAboveSga;
  if (data.workCreditsLikely !== undefined) lead.workCreditsLikely = data.workCreditsLikely;
  if (data.esignConsent !== undefined) lead.esignConsent = data.esignConsent;
  return lead;
}

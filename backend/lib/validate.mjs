function asString(value) {
  if (value == null) return "";
  return String(value).trim();
}

function asBool(value) {
  return value === true;
}

/**
 * Fail closed unless TCPA is the boolean true. Optional CRM fields are
 * normalized but not required (voice leads may omit state/email).
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

  return { ok: true, data };
}

export function toLead(data, { id, receivedAt } = {}) {
  return {
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
}

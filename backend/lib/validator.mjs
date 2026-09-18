import { envTrim, ssdiOnlyValue } from "./brand.mjs";

/** Result states from ABBYCRM/SSDI-Validator POST /v1/validations. */
export const VALIDATOR_STATUSES = ["VALIDATED", "INCOMPLETE", "CONTRADICTED"];

const DEFAULT_TIMEOUT_MS = 25_000;

export function validatorUrl(env = process.env) {
  const raw = ssdiOnlyValue(envTrim(env, "SSDI_VALIDATOR_URL"));
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
}

export function validatorToken(env = process.env) {
  return ssdiOnlyValue(envTrim(env, "SSDI_VALIDATOR_TOKEN"));
}

export function isValidatorWired(env = process.env) {
  return Boolean(validatorUrl(env) && validatorToken(env));
}

export function validatorSource(source) {
  const s = String(source || "").toLowerCase();
  if (s.includes("vapi") || s.includes("voice")) return "vapi-ssdi";
  return "web";
}

/**
 * Campaigns intake JSON that SSDI-Validator's Lead preprocess accepts
 * (camelCase or nested). lead_id is required; state is preferred.
 */
export function toValidatorPayload(lead) {
  return {
    lead_id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    disabilityType: lead.disabilityType,
    state: lead.state,
    zip: lead.zip,
    message: lead.message,
    tcpa: true,
    sensitiveHealth: lead.sensitiveHealth === true,
    source: validatorSource(lead.source),
  };
}

function asStatus(value) {
  const s = String(value || "").trim().toUpperCase();
  return VALIDATOR_STATUSES.includes(s) ? s : null;
}

function pickFraudSignal(json) {
  if (!json || typeof json !== "object") return undefined;
  const dims = json.dimensions && typeof json.dimensions === "object" ? json.dimensions : {};
  const overall = dims.fraud_overall ?? dims.fraud;
  if (overall && typeof overall === "object") {
    const verdict = overall.verdict ?? overall.aggregate?.verdict ?? overall.aggregate;
    if (verdict && typeof verdict !== "object") return String(verdict).slice(0, 120);
  }
  if (typeof overall === "string" && overall) return overall.slice(0, 120);
  const staff = json.staff_verdict;
  if (staff && typeof staff === "object") {
    const level = staff.level || staff.headline;
    if (level) return String(level).slice(0, 120);
  }
  return undefined;
}

export function parseValidatorResult(json, { status: httpStatus, ok } = {}) {
  if (!ok) {
    const err = json?.error || `validator_${httpStatus || "error"}`;
    return {
      ok: false,
      status: asStatus(json?.status) || "INCOMPLETE",
      reason: String(err).slice(0, 200),
      httpStatus,
      raw: json,
    };
  }
  const status =
    asStatus(json?.status) ||
    asStatus(json?.result?.status) ||
    asStatus(json?.qualification?.status) ||
    "INCOMPLETE";
  return {
    ok: true,
    status,
    reason: json?.reason ?? json?.result?.reason ?? null,
    validationId: json?.validation_id || json?.id || json?.validationId || null,
    leadId: json?.lead_id || json?.leadId || null,
    fraudSignal: pickFraudSignal(json),
    humanNote: json?.human_note || json?.agent_note?.text || null,
    hubspotNote: json?.hubspot_note || null,
    missing: Array.isArray(json?.missing) ? json.missing : [],
    nextAction: json?.next_action ?? json?.nextAction ?? null,
    raw: json,
  };
}

function timeoutMs(env) {
  const n = Number(envTrim(env, "SSDI_VALIDATOR_TIMEOUT_MS"));
  return Number.isFinite(n) && n >= 1000 ? n : DEFAULT_TIMEOUT_MS;
}

/**
 * POST /v1/validations on SSDI-Validator.
 * Stub: returns skipped when SSDI_VALIDATOR_URL or SSDI_VALIDATOR_TOKEN is unset.
 * Failures never throw — intake already succeeded.
 */
export async function submitValidation(lead, { env = process.env, fetch: fetchFn = globalThis.fetch } = {}) {
  const base = validatorUrl(env);
  const token = validatorToken(env);
  if (!base || !token) {
    return { ok: false, skipped: true, reason: "unwired", status: null };
  }

  const url = `${base}/v1/validations`;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs(env));
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(toValidatorPayload(lead)),
      signal: ac.signal,
    });
    const text = await res.text();
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }
    const parsed = parseValidatorResult(json, { status: res.status, ok: res.ok });
    if (!res.ok) {
      console.error("ssdi-validator status", res.status, parsed.reason);
    }
    return parsed;
  } catch (err) {
    const timedOut = err?.name === "AbortError";
    console.error("ssdi-validator failed", timedOut ? "timeout" : err);
    return {
      ok: false,
      status: "INCOMPLETE",
      reason: timedOut ? "VALIDATOR_TIMEOUT" : "SOURCE_UNAVAILABLE",
      error: timedOut ? "timeout" : "network",
    };
  } finally {
    clearTimeout(t);
  }
}

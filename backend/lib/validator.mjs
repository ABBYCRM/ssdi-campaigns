import { envTrim, ssdiOnlyValue } from "./brand.mjs";

/** Result states from ABBYCRM/SSDI-Validator POST /v1/validations. */
export const VALIDATOR_STATUSES = ["VALIDATED", "INCOMPLETE", "CONTRADICTED"];

const DEFAULT_TIMEOUT_MS = 25_000;

/** 2026 non-blind SGA ($1,690/mo). Used when intake asserts working above SGA. */
export const SGA_NON_BLIND_MONTHLY_2026 = 1690;
/** Claimed earnings just above SGA so evaluateSga returns ABOVE (educational screen). */
export const CLAIMED_ABOVE_SGA_EARNINGS_USD = 2000;

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

function appendMessage(base, extra) {
  const a = String(base || "").trim();
  const b = String(extra || "").trim();
  if (!a) return b || undefined;
  if (!b) return a;
  return `${a}\n\n${b}`.slice(0, 8000);
}

/**
 * Campaigns intake → SSDI-Validator Lead preprocess.
 * Maps optional qualification fields so duration/SGA/claim-consistency engines fire.
 */
export function toValidatorPayload(lead) {
  const payload = {
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

  if (lead.durationLikely12Months === false) {
    payload.durationMonths = 1;
    payload.expectedDurationMonths = 1;
  } else if (lead.durationLikely12Months === true) {
    payload.durationMonths = 12;
    payload.expectedDurationMonths = 12;
  }

  if (lead.workingAboveSga === "yes") {
    payload.workStatus = "WORKING_ABOVE_SGA";
    payload.monthlyEarningsUsd = CLAIMED_ABOVE_SGA_EARNINGS_USD;
    payload.message = appendMessage(
      payload.message,
      "Intake asserts working above SGA (claimed monthly earnings for educational screen). Claim consistency: caller reports substantial work activity while seeking disability screening.",
    );
  } else if (lead.workingAboveSga === "no") {
    payload.workStatus = "NOT_WORKING";
    payload.monthlyEarningsUsd = 0;
  } else if (lead.workingAboveSga === "unsure") {
    payload.workStatus = "WORKING_UNKNOWN";
  }

  if (lead.workCreditsLikely === "no") {
    payload.message = appendMessage(
      payload.message,
      "Intake asserts work credits unlikely (educational screen — not an SSA earnings record).",
    );
  } else if (lead.workCreditsLikely === "yes") {
    payload.message = appendMessage(payload.message, "Intake asserts work credits likely (self-report only).");
  }

  if (lead.esignConsent === false) {
    payload.message = appendMessage(payload.message, "E-SIGN consent declined at intake.");
  } else if (lead.esignConsent === true) {
    payload.message = appendMessage(payload.message, "E-SIGN consent affirmed at intake.");
  }

  return payload;
}

/**
 * Vapi/agent speech gate. Does NOT refuse HubSpot create — due diligence stamp only.
 * Reject: clear duration fail, clear SGA over, CONTRADICTED (except soft MANUAL_REVIEW-only), HIGH_RISK.
 * Keep: INCOMPLETE (missing duration), MANUAL_REVIEW without HIGH_RISK.
 */
export function evaluateIntakeGate(lead, validator) {
  if (lead?.durationLikely12Months === false) {
    return {
      rejected: true,
      reason: "DURATION_NOT_MET",
      speak:
        "Based on what you shared, this educational screening is not a fit and we cannot help at this time.",
    };
  }
  if (lead?.workingAboveSga === "yes") {
    return {
      rejected: true,
      reason: "SGA_EXCEEDED",
      speak:
        "Based on current work activity you described, this educational screening is not a fit and we cannot help at this time.",
    };
  }
  if (lead?.esignConsent === false) {
    return {
      rejected: true,
      reason: "ESIGN_DECLINED",
      speak: "Without E-SIGN consent we cannot continue this screening. We cannot help at this time.",
    };
  }

  if (!validator || validator.skipped === true) {
    return { rejected: false };
  }

  const status = String(validator.status || "").toUpperCase();
  const reason = String(validator.reason || "").toUpperCase();
  const fraud = String(validator.fraudSignal || "").toUpperCase();

  if (fraud.includes("HIGH_RISK")) {
    return {
      rejected: true,
      reason: "HIGH_RISK",
      speak: "We cannot help with this screening at this time.",
    };
  }

  if (reason === "DURATION_NOT_MET" || reason === "SGA_EXCEEDED") {
    return {
      rejected: true,
      reason,
      speak:
        "Based on what you shared, this educational screening is not a fit and we cannot help at this time.",
    };
  }

  if (reason === "MANUAL_REVIEW_REQUIRED" || (fraud.includes("MANUAL_REVIEW") && !fraud.includes("HIGH_RISK"))) {
    return {
      rejected: false,
      reviewRequired: true,
      reason: reason || "MANUAL_REVIEW_REQUIRED",
    };
  }

  if (status === "CONTRADICTED") {
    return {
      rejected: true,
      reason: reason || "CONTRADICTED",
      speak: "We cannot help with this screening at this time.",
    };
  }

  return { rejected: false };
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

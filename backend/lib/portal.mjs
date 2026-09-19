import { envTrim, ssdiOnlyValue } from "./brand.mjs";
import { validatorSource } from "./validator.mjs";

export function portalUrl(env = process.env) {
  const raw = ssdiOnlyValue(envTrim(env, "SSDI_PORTAL_URL"));
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
}

export function portalWebhookSecret(env = process.env) {
  return (
    ssdiOnlyValue(envTrim(env, "SSDI_PORTAL_WEBHOOK_SECRET")) ||
    ssdiOnlyValue(envTrim(env, "INTAKE_WEBHOOK_SECRET"))
  );
}

export function isPortalWired(env = process.env) {
  return Boolean(portalUrl(env));
}

export function toPortalPayload(lead, extra = {}) {
  return {
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
    id: lead.id,
    receivedAt: lead.receivedAt,
    validatorStatus: extra.validatorStatus ?? null,
    validatorId: extra.validatorId ?? null,
    fraudSignal: extra.fraudSignal ?? null,
    hubspotContactId: extra.hubspotContactId ?? null,
    rejected: extra.rejected === true,
    rejectReason: extra.rejectReason ?? null,
    reviewRequired: extra.reviewRequired === true,
  };
}

/**
 * POST /api/webhooks/intake on ABBYCRM/SSDI-portal (ops desk).
 * Header x-webhook-secret when SSDI_PORTAL_WEBHOOK_SECRET (or INTAKE_WEBHOOK_SECRET) is set.
 * Stub: skipped when SSDI_PORTAL_URL is unset. Failures never throw.
 */
export async function submitPortalLead(lead, extra = {}, { env = process.env, fetch: fetchFn = globalThis.fetch } = {}) {
  const base = portalUrl(env);
  if (!base) {
    return { ok: false, skipped: true, reason: "unwired" };
  }

  const secret = portalWebhookSecret(env);
  const headers = {
    "content-type": "application/json",
    accept: "application/json",
  };
  if (secret) headers["x-webhook-secret"] = secret;

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);
  try {
    const res = await fetchFn(`${base}/api/webhooks/intake`, {
      method: "POST",
      headers,
      body: JSON.stringify(toPortalPayload(lead, extra)),
      signal: ac.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("ssdi-portal intake status", res.status);
      return { ok: false, error: json.error || `portal_${res.status}`, status: res.status };
    }
    return { ok: true, id: json.id || lead.id };
  } catch (err) {
    console.error("ssdi-portal intake failed", err);
    return { ok: false, error: "portal_network" };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Shared Vapi webhook → /intake persist. Used by backend/server.mjs and the
 * TanStack Start route at POST /api/vapi/inbound
 * (https://ssdicampaigns.com/api/vapi/inbound).
 */
import { persistIntake } from "./persist.mjs";
import { extractVapiLead, verifyVapiSecret } from "./vapi.mjs";

export async function handleVapiWebhook({ body, headers, env = process.env, fetch: fetchFn = globalThis.fetch } = {}) {
  const secret = verifyVapiSecret(headers || {}, env);
  if (!secret.ok) {
    return { status: 401, body: { ok: false, error: "unauthorized" } };
  }
  const extracted = extractVapiLead(body, env);
  if (extracted.skip) {
    return { status: 202, body: { ok: true, ignored: true, reason: extracted.error } };
  }
  const result = await persistIntake(extracted.payload, { env, fetch: fetchFn });
  return {
    status: result.status || (result.ok ? 202 : 422),
    body: {
      ...result,
      via: "vapi",
      eventType: extracted.eventType,
    },
  };
}

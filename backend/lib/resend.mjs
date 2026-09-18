import {
  DEFAULT_RESEND_FROM,
  DEFAULT_RESEND_REPLY_TO,
  SSDI_SENDING_DOMAIN,
  containsForbiddenBrand,
  envTrim,
  ssdiOnlyValue,
} from "./brand.mjs";

export function isResendWired(env = process.env) {
  return Boolean(ssdiOnlyValue(envTrim(env, "RESEND_API_KEY")));
}

export function resendFromEmail(env = process.env) {
  const configured = ssdiOnlyValue(envTrim(env, "RESEND_FROM_EMAIL"));
  if (configured) return configured;
  return DEFAULT_RESEND_FROM;
}

export function resendReplyTo(env = process.env) {
  const configured = ssdiOnlyValue(envTrim(env, "RESEND_REPLY_TO"));
  if (configured) return configured;
  return DEFAULT_RESEND_REPLY_TO;
}

function notifyTo(env) {
  return (
    ssdiOnlyValue(envTrim(env, "INTAKE_NOTIFY_EMAIL")) ||
    ssdiOnlyValue(envTrim(env, "RESEND_REPLY_TO")) ||
    DEFAULT_RESEND_REPLY_TO
  );
}

/**
 * Optional ops email for a new lead. SSDI sending domain only — CaseClosedFL
 * Resend keys/domains are ignored. Failures are logged, never thrown.
 */
export async function notifyIntakeEmail(lead, opts = {}) {
  const env = opts.env ?? process.env;
  const fetchFn = opts.fetch ?? globalThis.fetch;
  const key = ssdiOnlyValue(envTrim(env, "RESEND_API_KEY"));
  if (!key) return { ok: false, skipped: true, reason: "unwired" };

  const from = resendFromEmail(env);
  const replyTo = resendReplyTo(env);
  if (containsForbiddenBrand(from) || containsForbiddenBrand(replyTo)) {
    console.error("resend blocked: CaseClosedFL identity is not allowed on SSDI Campaigns");
    return { ok: false, skipped: true, reason: "forbidden_brand" };
  }

  try {
    const res = await fetchFn("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [notifyTo(env)],
        reply_to: replyTo,
        subject: `New SSDI intake — ${lead.name}`,
        text: [
          `Name: ${lead.name}`,
          `Phone: ${lead.phone}`,
          `Email: ${lead.email ?? ""}`,
          `Disability: ${lead.disabilityType ?? ""}`,
          `State: ${lead.state ?? ""}`,
          `ZIP: ${lead.zip ?? ""}`,
          `Source: ${lead.source ?? ""}`,
          `TCPA: true`,
          `When: ${lead.receivedAt}`,
          `ID: ${lead.id}`,
          `HubSpot contact: ${opts.hubspot?.contactId ?? ""}`,
          `Validator: ${opts.validator?.status ?? opts.validator?.reason ?? "unwired"}`,
          `Fraud signal: ${opts.validator?.fraudSignal ?? ""}`,
          `Validator ID: ${opts.validator?.validationId ?? ""}`,
          `Portal: ${opts.portal?.ok ? "ok" : opts.portal?.reason ?? "unwired"}`,
          "",
          lead.message ?? "",
          "",
          `Sending domain: ${SSDI_SENDING_DOMAIN} (SSDI Campaigns only)`,
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error("intake email status", res.status);
      return { ok: false, error: `resend_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("intake email failed", err);
    return { ok: false, error: "resend_network" };
  }
}

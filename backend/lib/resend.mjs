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

function publicSiteUrl(env = process.env) {
  const raw =
    ssdiOnlyValue(envTrim(env, "PUBLIC_SITE_URL")) ||
    ssdiOnlyValue(envTrim(env, "SITE_URL")) ||
    `https://${SSDI_SENDING_DOMAIN}`;
  return String(raw).replace(/\/+$/, "");
}

/** Lead more-info / continue path used in confirmation emails. */
export function moreInfoUrl(env = process.env, leadId) {
  const base = `${publicSiteUrl(env)}/more-info`;
  if (!leadId) return base;
  return `${base}?ref=${encodeURIComponent(String(leadId))}`;
}

async function sendResend({ env, fetchFn, to, subject, text, html }) {
  const key = ssdiOnlyValue(envTrim(env, "RESEND_API_KEY"));
  if (!key) return { ok: false, skipped: true, reason: "unwired" };

  const from = resendFromEmail(env);
  const replyTo = resendReplyTo(env);
  if (containsForbiddenBrand(from) || containsForbiddenBrand(replyTo) || containsForbiddenBrand(to)) {
    console.error("resend blocked: CaseClosedFL identity is not allowed on SSDI Campaigns");
    return { ok: false, skipped: true, reason: "forbidden_brand" };
  }

  try {
    const body = {
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
    };
    if (html) body.html = html;
    const res = await fetchFn("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("resend status", res.status, subject.slice(0, 60));
      return { ok: false, error: `resend_${res.status}` };
    }
    const json = await res.json().catch(() => ({}));
    return { ok: true, id: json.id };
  } catch (err) {
    console.error("resend failed", err);
    return { ok: false, error: "resend_network" };
  }
}

/**
 * Optional ops email for a new lead. SSDI sending domain only — CaseClosedFL
 * Resend keys/domains are ignored. Failures are logged, never thrown.
 */
export async function notifyIntakeEmail(lead, opts = {}) {
  const env = opts.env ?? process.env;
  const fetchFn = opts.fetch ?? globalThis.fetch;
  if (!ssdiOnlyValue(envTrim(env, "RESEND_API_KEY"))) {
    return { ok: false, skipped: true, reason: "unwired" };
  }

  return sendResend({
    env,
    fetchFn,
    to: notifyTo(env),
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
  });
}

/**
 * Lead confirmation / more-info email when lead.email is present.
 * From noreply@ssdicampaigns.com (or RESEND_FROM_EMAIL), Reply-To Intake@abbycrm.com.
 * Alias: sendLeadConfirmationEmail
 */
export async function emailLeadMoreInfo(lead, opts = {}) {
  const env = opts.env ?? process.env;
  const fetchFn = opts.fetch ?? globalThis.fetch;
  const to = ssdiOnlyValue(String(lead.email || "").trim());
  if (!to || !to.includes("@")) {
    return { ok: false, skipped: true, reason: "no_lead_email" };
  }
  if (!ssdiOnlyValue(envTrim(env, "RESEND_API_KEY"))) {
    return { ok: false, skipped: true, reason: "unwired" };
  }

  const link = moreInfoUrl(env, lead.id);
  const replyTo = resendReplyTo(env);
  const phone =
    envTrim(env, "INBOUND_PHONE_NUMBER") ||
    envTrim(env, "VITE_PUBLIC_PHONE") ||
    "+1 (561) 652-0362";
  const first = String(lead.name || "there").trim().split(/\s+/)[0] || "there";

  const text = [
    `Hi ${first},`,
    "",
    "Thank you for contacting SSDI Campaigns. We received your educational screening request.",
    "",
    "A specialist may call you soon. In the meantime, please reply to this email or open the link below to share a few more details (how long your condition has lasted, whether you are working above SGA, work credits, prior denials, or anything else that helps):",
    link,
    "",
    "This is an independent educational screening — not an SSA decision, not a government agency, and not legal advice. Applying for SSDI through SSA is free.",
    "",
    `Questions? Reply to this email (${replyTo}) or call ${phone}.`,
    "",
    "Warm regards,",
    "SSDI Campaigns",
    replyTo,
  ].join("\n");

  const html = `
    <p>Hi ${escapeHtml(first)},</p>
    <p>Thank you for contacting <strong>SSDI Campaigns</strong>. We received your educational screening request.</p>
    <p>A specialist may call you soon. In the meantime, please <strong>reply to this email</strong> or open the link below to share a few more details — duration, work/SGA notes, work credits, prior denials, or anything else that helps our team.</p>
    <p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600">Share more details</a></p>
    <p style="font-size:13px;color:#555">Or open: <a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>
    <p style="font-size:13px;color:#555">Independent educational screening only — not an SSA decision, not a government agency, and not legal advice. Applying at SSA is free.</p>
    <p>Questions? Reply to this email or call ${escapeHtml(phone)}.</p>
    <p>Warm regards,<br/>SSDI Campaigns<br/>${escapeHtml(replyTo)}</p>
  `.trim();

  return sendResend({
    env,
    fetchFn,
    to,
    subject: "Thanks — please share a few more details | SSDI Campaigns",
    text,
    html,
  });
}

/** @see emailLeadMoreInfo */
export const sendLeadConfirmationEmail = emailLeadMoreInfo;

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

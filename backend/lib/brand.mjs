/**
 * SSDI Campaigns isolation. Runtime defaults and sending identity must stay on
 * ssdicampaigns.com — never CaseClosedFL keys, domains, or assistant IDs.
 */
export const BRAND = "ssdi-campaigns";
export const SSDI_SENDING_DOMAIN = "ssdicampaigns.com";

export const DEFAULT_RESEND_FROM = `SSDI Campaigns <noreply@${SSDI_SENDING_DOMAIN}>`;
/** Luis-approved Reply-To (not CaseClosedFL). From-address stays on ssdicampaigns.com. */
export const DEFAULT_RESEND_REPLY_TO = "Intake@abbycrm.com";

/** Markers that must never appear in SSDI runtime defaults or Resend identity. */
export const FORBIDDEN_BRAND_MARKERS = [
  "caseclosedfl.com",
  "caseclosedfl",
  "case-closed-fl",
  "abby-hubspot",
];

export function envTrim(env, key) {
  const v = env?.[key];
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t || undefined;
}

export function containsForbiddenBrand(value) {
  const s = String(value ?? "").toLowerCase();
  if (!s) return false;
  return FORBIDDEN_BRAND_MARKERS.some((m) => s.includes(m));
}

/**
 * Drop values that leak CaseClosedFL identity. Never substitute a CaseClosedFL
 * fallback — return undefined so the caller stays unwired.
 */
export function ssdiOnlyValue(value) {
  if (value == null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  if (containsForbiddenBrand(s)) return undefined;
  return s;
}

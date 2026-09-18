/**
 * Public click-to-call number for SSDI Campaigns.
 *
 * Source (first match): VITE_PUBLIC_PHONE, then INBOUND_PHONE_NUMBER.
 * Set these to the SSDI Vapi inbound number after that assistant exists.
 * Never default to CaseClosedFL +1 561-566-1360.
 */

export const CASECLOSEDFL_INBOUND_DIGITS = "5615661360";

export type PublicPhone = {
  provisioned: boolean;
  display: string;
  tel: string;
  blocked?: "caseclosedfl";
};

export function phoneDigits(value: string): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function isForbiddenInboundPhone(value: string): boolean {
  const last10 = phoneDigits(value).slice(-10);
  return last10.length === 10 && last10 === CASECLOSEDFL_INBOUND_DIGITS;
}

export function toTelHref(value: string): string {
  const d = phoneDigits(value);
  if (!d) return "";
  if (String(value).trim().startsWith("+")) return `+${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  if (d.length === 10) return `+1${d}`;
  return `+${d}`;
}

export function formatUsDisplay(value: string): string {
  const d = phoneDigits(value);
  const local = d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
  if (local.length === 10) {
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return String(value).trim();
}

export function resolvePublicPhone(env: {
  VITE_PUBLIC_PHONE?: string;
  INBOUND_PHONE_NUMBER?: string;
}): PublicPhone {
  const raw = String(env.VITE_PUBLIC_PHONE || env.INBOUND_PHONE_NUMBER || "").trim();
  if (!raw) return { provisioned: false, display: "", tel: "" };
  if (isForbiddenInboundPhone(raw)) {
    return { provisioned: false, display: "", tel: "", blocked: "caseclosedfl" };
  }
  if (phoneDigits(raw).length < 10) {
    return { provisioned: false, display: "", tel: "" };
  }
  return {
    provisioned: true,
    display: formatUsDisplay(raw),
    tel: toTelHref(raw),
  };
}

function readInboundFromProcess(): string {
  try {
    if (typeof process === "undefined" || !process.env) return "";
    return String(process.env.VITE_PUBLIC_PHONE || process.env.INBOUND_PHONE_NUMBER || "").trim();
  } catch {
    return "";
  }
}

/** Browser + SSR: Vite inlines VITE_PUBLIC_PHONE at build; INBOUND_PHONE_NUMBER is a server fallback. */
export function getPublicPhone(): PublicPhone {
  const vite =
    typeof import.meta !== "undefined"
      ? String((import.meta as ImportMeta).env?.VITE_PUBLIC_PHONE ?? "").trim()
      : "";
  return resolvePublicPhone({
    VITE_PUBLIC_PHONE: vite,
    INBOUND_PHONE_NUMBER: readInboundFromProcess(),
  });
}

/** Legal-copy phrase: the live number, or a form fallback before Vapi is provisioned. */
export function contactPhonePhrase(): string {
  const phone = getPublicPhone();
  return phone.provisioned ? phone.display : "the campaign contact form";
}

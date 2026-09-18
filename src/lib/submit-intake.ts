import { createServerFn } from "@tanstack/react-start";
import { intakeSchema, type IntakeInput } from "./form-schema";
import { SITE } from "./site";

function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

const recentByPhone = new Map<string, number[]>();

/** Published Google Form that receives every intake (intake@abbycrm.com). */
const DEFAULT_GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLScRtOpO4MscxzDRBkZ09zOYrsbu0dP7W7GpbaIzFF8j5h5A_g/formResponse";

const GOOGLE_FORM_ENTRIES = {
  name: "760825171",
  phone: "1387434421",
  email: "767241431",
  disabilityType: "1128921698",
  state: "523795539",
  zip: "1533742579",
  source: "898430378",
  message: "748937466",
  id: "156467219",
  receivedAt: "1850357148",
} as const;

function phoneKey(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

function isRateLimited(phone: string) {
  const key = phoneKey(phone);
  if (key.length < 10) return false;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const hits = (recentByPhone.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= 8) return true;
  hits.push(now);
  recentByPhone.set(key, hits);
  return false;
}

type StoredLead = {
  id: string;
  receivedAt: string;
  name: string;
  phone: string;
  email?: string;
  disabilityType: string;
  state?: string;
  zip?: string;
  message?: string;
  source?: string;
};

function toLead(id: string, data: IntakeInput): StoredLead {
  return {
    id,
    receivedAt: new Date().toISOString(),
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    disabilityType: data.disabilityType,
    state: data.state || undefined,
    zip: data.zip || undefined,
    message: data.message || undefined,
    source: data.source || undefined,
  };
}

function leadCell(value: string | undefined) {
  return value ?? "";
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function decodeWebhookSecret(secret: string): Uint8Array {
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  try {
    const bin = atob(raw);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return new TextEncoder().encode(secret);
  }
}

async function standardWebhookHeaders(secret: string, msgId: string, body: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const keyBytes = decodeWebhookSecret(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`));
  return {
    "webhook-id": msgId,
    "webhook-timestamp": timestamp,
    "webhook-signature": `v1,${bytesToBase64(new Uint8Array(sig))}`,
  };
}

async function persistJsonl(lead: StoredLead) {
  const fs = await import("node:fs/promises");
  const pathMod = await import("node:path");
  const candidates = [
    env("INTAKE_STORE_PATH"),
    pathMod.join(process.cwd(), ".data", "intakes.jsonl"),
    "/tmp/ssdi-intakes.jsonl",
  ].filter((p): p is string => Boolean(p));
  let lastErr: unknown;
  for (const path of candidates) {
    try {
      await fs.mkdir(pathMod.dirname(path), { recursive: true });
      await fs.appendFile(path, `${JSON.stringify(lead)}\n`, { encoding: "utf8" });
      return;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("intake persist failed");
}

async function forwardGoogleForm(lead: StoredLead) {
  const url = env("GOOGLE_FORM_ACTION_URL") ?? DEFAULT_GOOGLE_FORM_ACTION;
  if (!url) return;
  const body = new URLSearchParams({
    [`entry.${GOOGLE_FORM_ENTRIES.name}`]: lead.name,
    [`entry.${GOOGLE_FORM_ENTRIES.phone}`]: lead.phone,
    [`entry.${GOOGLE_FORM_ENTRIES.email}`]: leadCell(lead.email),
    [`entry.${GOOGLE_FORM_ENTRIES.disabilityType}`]: lead.disabilityType,
    [`entry.${GOOGLE_FORM_ENTRIES.state}`]: leadCell(lead.state),
    [`entry.${GOOGLE_FORM_ENTRIES.zip}`]: leadCell(lead.zip),
    [`entry.${GOOGLE_FORM_ENTRIES.source}`]: leadCell(lead.source),
    [`entry.${GOOGLE_FORM_ENTRIES.message}`]: leadCell(lead.message),
    [`entry.${GOOGLE_FORM_ENTRIES.id}`]: lead.id,
    [`entry.${GOOGLE_FORM_ENTRIES.receivedAt}`]: lead.receivedAt,
  });
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "text/html,application/xhtml+xml",
      },
      body,
      redirect: "follow",
      signal: ac.signal,
    });
    if (!res.ok) console.error("intake google form status", res.status);
  } finally {
    clearTimeout(t);
  }
}

async function forwardWebhook(lead: StoredLead) {
  const url = env("INTAKE_WEBHOOK_URL");
  if (!url) return;
  const body = JSON.stringify(lead);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
  };
  const secret = env("INTAKE_WEBHOOK_SECRET");
  if (secret) {
    Object.assign(headers, await standardWebhookHeaders(secret, `msg_${lead.id}`, body));
  }
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: ac.signal,
    });
    if (!res.ok) console.error("intake webhook status", res.status);
  } finally {
    clearTimeout(t);
  }
}

function forbiddenBrand(value: string | undefined) {
  const s = (value ?? "").toLowerCase();
  return s.includes("caseclosedfl");
}

async function persistCrm(lead: StoredLead, data: IntakeInput) {
  const payload = {
    name: data.name,
    phone: data.phone,
    email: data.email,
    disabilityType: data.disabilityType,
    state: data.state,
    zip: data.zip,
    message: data.message,
    tcpa: data.tcpa,
    sensitiveHealth: data.sensitiveHealth,
    source: data.source || lead.source,
    id: lead.id,
    receivedAt: lead.receivedAt,
  };
  const api = env("INTAKE_API_URL");
  if (api) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 8000);
    try {
      const res = await fetch(`${api.replace(/\/$/, "")}/intake`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });
      return (await res.json().catch(() => null)) as { forwardedTo?: string | null; hubspot?: { ok?: boolean } } | null;
    } finally {
      clearTimeout(t);
    }
  }
  const { persistIntake } = (await import("../../backend/lib/persist.mjs")) as {
    persistIntake: (
      payload: unknown,
      deps?: { env?: NodeJS.ProcessEnv; fetch?: typeof fetch },
    ) => Promise<{ forwardedTo?: string | null; hubspot?: { ok?: boolean } }>;
  };
  return persistIntake(payload, { env: process.env, fetch: globalThis.fetch });
}

async function emailOps(lead: StoredLead) {
  const key = env("RESEND_API_KEY");
  if (!key || forbiddenBrand(key)) return;
  const from =
    env("RESEND_FROM_EMAIL") ?? env("INTAKE_FROM_EMAIL") ?? "SSDI Campaigns <noreply@ssdicampaigns.com>";
  const replyTo = env("RESEND_REPLY_TO");
  if (forbiddenBrand(from) || forbiddenBrand(replyTo)) {
    console.error("intake email blocked: CaseClosedFL identity is not allowed on SSDI Campaigns");
    return;
  }
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 5000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [env("INTAKE_NOTIFY_EMAIL") ?? replyTo ?? SITE.email],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: `New SSDI intake — ${lead.name}`,
        text: [
          `Name: ${lead.name}`,
          `Phone: ${lead.phone}`,
          `Email: ${lead.email ?? ""}`,
          `Disability: ${lead.disabilityType}`,
          `State: ${lead.state ?? ""}`,
          `ZIP: ${lead.zip ?? ""}`,
          `Source: ${lead.source ?? ""}`,
          `When: ${lead.receivedAt}`,
          `ID: ${lead.id}`,
          "",
          lead.message ?? "",
        ].join("\n"),
      }),
      signal: ac.signal,
    });
    if (!res.ok) console.error("intake email status", res.status);
  } finally {
    clearTimeout(t);
  }
}

export const submitIntake = createServerFn({ method: "POST" })
  .validator(intakeSchema)
  .handler(async ({ data }) => {
    if (data.hp) {
      return { ok: true as const, id: "ignored" };
    }
    const id = crypto.randomUUID();
    if (isRateLimited(data.phone)) {
      return { ok: true as const, id };
    }
    const lead = toLead(id, data);
    try {
      await persistJsonl(lead);
    } catch (err) {
      console.error("intake persist failed", err);
    }
    let crm: { forwardedTo?: string | null; hubspot?: { ok?: boolean } } | null = null;
    try {
      crm = await persistCrm(lead, data);
    } catch (err) {
      console.error("intake crm persist failed", err);
    }
    // HubSpot is primary (persistCrm). The published Google Form is a legacy
    // backup with the same rule as GOOGLE_SHEETS_*: copy after HubSpot success,
    // or failover when HubSpot is unwired/unavailable.
    await Promise.allSettled([forwardGoogleForm(lead), forwardWebhook(lead), emailOps(lead)]);
    return { ok: true as const, id, receivedAt: lead.receivedAt, forwardedTo: crm?.forwardedTo ?? null };
  });

import { envTrim } from "./brand.mjs";

const HUBSPOT_API = "https://api.hubapi.com";

export const HUBSPOT_CUSTOM_PROPERTIES = [
  {
    name: "ssdi_tcpa_consent",
    label: "SSDI TCPA Consent",
    type: "bool",
    fieldType: "booleancheckbox",
    groupName: "contactinformation",
    description: "Prior express written consent to call/SMS (SSDI Campaigns).",
  },
  {
    name: "ssdi_tcpa_consent_at",
    label: "SSDI TCPA Consent At",
    type: "string",
    fieldType: "text",
    groupName: "contactinformation",
    description: "ISO timestamp of TCPA consent capture.",
  },
  {
    name: "ssdi_campaign_source",
    label: "SSDI Campaign Source",
    type: "string",
    fieldType: "text",
    groupName: "contactinformation",
    description: "Intake source (site, vapi-ssdi, state page, etc.).",
  },
  {
    name: "ssdi_disability_type",
    label: "SSDI Disability Type",
    type: "string",
    fieldType: "text",
    groupName: "contactinformation",
    description: "Campaign screening category. CRM-only — not for ads.",
  },
  {
    name: "ssdi_intake_id",
    label: "SSDI Intake ID",
    type: "string",
    fieldType: "text",
    groupName: "contactinformation",
  },
  {
    name: "ssdi_sensitive_health_ack",
    label: "SSDI Sensitive Health Ack",
    type: "bool",
    fieldType: "booleancheckbox",
    groupName: "contactinformation",
  },
  {
    name: "ssdi_message",
    label: "SSDI Intake Note",
    type: "string",
    fieldType: "textarea",
    groupName: "contactinformation",
    description: "Optional message from the lead. Truncated. CRM-only.",
  },
];

export function hubspotToken(env = process.env) {
  return envTrim(env, "HUBSPOT_ACCESS_TOKEN");
}

export function isHubSpotWired(env = process.env) {
  return Boolean(hubspotToken(env));
}

function splitName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstname: "", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

function standardProperties(lead) {
  const { firstname, lastname } = splitName(lead.name);
  const props = {
    firstname,
    lastname,
    phone: lead.phone,
    hs_lead_status: "NEW",
    lifecyclestage: "lead",
  };
  if (lead.email) props.email = lead.email;
  if (lead.state) props.state = lead.state;
  if (lead.zip) props.zip = lead.zip;
  return props;
}

function customProperties(lead) {
  const props = {
    ssdi_tcpa_consent: "true",
    ssdi_tcpa_consent_at: lead.receivedAt,
    ssdi_campaign_source: lead.source || "ssdi-campaigns",
    ssdi_intake_id: lead.id,
    ssdi_sensitive_health_ack: lead.sensitiveHealth ? "true" : "false",
  };
  if (lead.disabilityType) props.ssdi_disability_type = lead.disabilityType;
  if (lead.message) props.ssdi_message = lead.message.slice(0, 500);
  return props;
}

export function contactProperties(lead, { includeCustom = true } = {}) {
  const props = { ...standardProperties(lead) };
  if (includeCustom) Object.assign(props, customProperties(lead));
  return props;
}

async function hsJson(fetchFn, token, path, { method = "GET", body } = {}) {
  const res = await fetchFn(`${HUBSPOT_API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

let propertiesEnsured = false;

export function resetHubSpotPropertyCache() {
  propertiesEnsured = false;
}

async function ensureCustomProperties(fetchFn, token) {
  if (propertiesEnsured) return;
  await Promise.all(
    HUBSPOT_CUSTOM_PROPERTIES.map((prop) =>
      hsJson(fetchFn, token, "/crm/v3/properties/contacts", {
        method: "POST",
        body: prop,
      }).catch(() => null),
    ),
  );
  propertiesEnsured = true;
}

async function searchContact(fetchFn, token, lead) {
  const filterGroups = [];
  if (lead.email) {
    filterGroups.push({
      filters: [{ propertyName: "email", operator: "EQ", value: lead.email }],
    });
  }
  const digits = String(lead.phone || "").replace(/\D/g, "");
  if (digits.length >= 10) {
    filterGroups.push({
      filters: [{ propertyName: "phone", operator: "EQ", value: lead.phone }],
    });
  }
  if (filterGroups.length === 0) return null;

  const { ok, json } = await hsJson(fetchFn, token, "/crm/v3/objects/contacts/search", {
    method: "POST",
    body: {
      filterGroups,
      properties: ["email", "phone", "ssdi_intake_id"],
      limit: 1,
    },
  });
  if (!ok) return null;
  return json.results?.[0] ?? null;
}

function isMissingPropertyError(json) {
  const blob = JSON.stringify(json ?? {}).toLowerCase();
  return blob.includes("property") && (blob.includes("does not exist") || blob.includes("doesnt_exist") || blob.includes("invalid"));
}

async function writeContact(fetchFn, token, lead, existing) {
  const attempts = [true, false];
  let last = { ok: false, status: 0, json: {} };
  for (const includeCustom of attempts) {
    const properties = contactProperties(lead, { includeCustom });
    last = existing
      ? await hsJson(fetchFn, token, `/crm/v3/objects/contacts/${existing.id}`, {
          method: "PATCH",
          body: { properties },
        })
      : await hsJson(fetchFn, token, "/crm/v3/objects/contacts", {
          method: "POST",
          body: { properties },
        });
    if (last.ok) {
      return {
        ok: true,
        action: existing ? "updated" : "created",
        contactId: last.json.id,
      };
    }
    if (!includeCustom || !isMissingPropertyError(last.json)) break;
  }
  return {
    ok: false,
    action: existing ? "update_failed" : "create_failed",
    error: last.json?.message || `hubspot_${last.status}`,
    status: last.status,
  };
}

/**
 * Create or update a HubSpot contact. Maps TCPA consent + campaign source onto
 * custom properties (best-effort) and standard firstname/lastname/phone/email.
 */
export async function upsertHubSpotContact(lead, { env = process.env, fetch: fetchFn = globalThis.fetch } = {}) {
  const token = hubspotToken(env);
  if (!token) {
    return { ok: false, skipped: true, reason: "unwired" };
  }

  await ensureCustomProperties(fetchFn, token);

  let existing = null;
  try {
    existing = await searchContact(fetchFn, token, lead);
  } catch (err) {
    console.error("hubspot search failed", err);
  }

  try {
    const result = await writeContact(fetchFn, token, lead, existing);
    if (!result.ok) console.error("hubspot write failed", result);
    return result;
  } catch (err) {
    console.error("hubspot upsert failed", err);
    return { ok: false, error: "hubspot_network" };
  }
}

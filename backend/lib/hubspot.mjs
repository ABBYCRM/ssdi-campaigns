import { envTrim, ssdiOnlyValue } from "./brand.mjs";

const HUBSPOT_API = "https://api.hubapi.com";
const HSFORMS_API = "https://api.hsforms.com";

/**
 * AbbyCRM HubSpot portal (CaseClosedFL MVA also lives here). SSDI Campaigns
 * may write here when using a dedicated **SSDI Campaigns** private app —
 * isolation is by app token + `ssdi_*` properties / SSDI Campaigns pipeline,
 * not by portal id. Preferred: a separate SSDI portal when one is available.
 */
export const ABBYCRM_HUBSPOT_PORTAL_ID = "247081451";
/** Historical alias for the AbbyCRM portal id. Not a runtime blocklist. */
export const CASECLOSEDFL_HUBSPOT_PORTAL_ID = ABBYCRM_HUBSPOT_PORTAL_ID;

/** Hard-coded token placeholders (including CaseClosedFL) — treat as unwired. */
const HUBSPOT_TOKEN_PLACEHOLDERS = new Set([
  "__HUBSPOT_ACCESS_TOKEN__",
  "__CASECLOSEDFL_HUBSPOT_ACCESS_TOKEN__",
  "__CASECLOSEDFL_HUBSPOT_TOKEN__",
]);

/** Dedicated Key-card group (mirrors the CaseClosedFL intake-group pattern, SSDI-only). */
export const SSDI_INTAKE_PROPERTY_GROUP = "ssdi_campaigns_intake";

/** NOTE → contact (HubSpot-defined association). */
const NOTE_TO_CONTACT = 202;
/** Deal → contact. */
const DEAL_TO_CONTACT = 3;

export const SSDI_LEAD_STAGES = [
  "NEW",
  "VALIDATING",
  "VALIDATED",
  "INCOMPLETE",
  "CONTRADICTED",
  "FOLLOW_UP",
];

export const SSDI_DEAL_PIPELINE_LABEL = "SSDI Campaigns";

export const SSDI_DEAL_STAGES = [
  { key: "new", label: "New", metadata: { probability: "0.10" } },
  { key: "validating", label: "Validating", metadata: { probability: "0.20" } },
  { key: "validated", label: "Validated", metadata: { probability: "0.70" } },
  { key: "incomplete", label: "Incomplete", metadata: { probability: "0.40" } },
  { key: "contradicted", label: "Contradicted", metadata: { probability: "0.05" } },
  { key: "follow_up", label: "Follow-up", metadata: { probability: "0.50" } },
];

function enumOptions(values) {
  return values.map((value, i) => ({
    label: value.replaceAll("_", " "),
    value,
    displayOrder: i,
    hidden: false,
  }));
}

function intakeProp(def) {
  return {
    groupName: SSDI_INTAKE_PROPERTY_GROUP,
    hidden: false,
    formField: false,
    ...def,
  };
}

export const HUBSPOT_CUSTOM_PROPERTIES = [
  intakeProp({
    name: "ssdi_tcpa_consent",
    label: "SSDI TCPA Consent",
    type: "bool",
    fieldType: "booleancheckbox",
    description: "Prior express written consent to call/SMS (SSDI Campaigns).",
  }),
  intakeProp({
    name: "ssdi_tcpa_consent_at",
    label: "SSDI TCPA Consent At",
    type: "string",
    fieldType: "text",
    description: "ISO timestamp of TCPA consent capture.",
  }),
  intakeProp({
    name: "ssdi_campaign_source",
    label: "SSDI Campaign Source",
    type: "string",
    fieldType: "text",
    description: "Intake source (site, vapi-ssdi, state page, etc.).",
  }),
  intakeProp({
    name: "ssdi_source",
    label: "SSDI Source",
    type: "string",
    fieldType: "text",
    description: "Same as ssdi_campaign_source. Portal/ops alias.",
  }),
  intakeProp({
    name: "ssdi_disability_type",
    label: "SSDI Disability Type",
    type: "string",
    fieldType: "text",
    description: "Campaign screening category. CRM-only — not for ads.",
  }),
  intakeProp({
    name: "ssdi_state",
    label: "SSDI Intake State",
    type: "string",
    fieldType: "text",
    description: "USPS state from the screening form or Vapi. Also written to standard state.",
  }),
  intakeProp({
    name: "ssdi_zip",
    label: "SSDI Intake ZIP",
    type: "string",
    fieldType: "text",
    description: "ZIP from the screening form or Vapi. Also written to standard zip.",
  }),
  intakeProp({
    name: "ssdi_intake_id",
    label: "SSDI Intake ID",
    type: "string",
    fieldType: "text",
  }),
  intakeProp({
    name: "ssdi_sensitive_health_ack",
    label: "SSDI Sensitive Health Ack",
    type: "bool",
    fieldType: "booleancheckbox",
  }),
  intakeProp({
    name: "ssdi_message",
    label: "SSDI Intake Note",
    type: "string",
    fieldType: "textarea",
    description: "Optional message from the lead. Truncated. CRM-only.",
  }),
  intakeProp({
    name: "ssdi_validator_status",
    label: "SSDI Validator Status",
    type: "enumeration",
    fieldType: "select",
    description: "SSDI-Validator result: VALIDATED / INCOMPLETE / CONTRADICTED (plus NEW / VALIDATING / FOLLOW_UP).",
    options: enumOptions(SSDI_LEAD_STAGES),
  }),
  intakeProp({
    name: "ssdi_fraud_signal",
    label: "SSDI Fraud Signal",
    type: "string",
    fieldType: "text",
    description: "Aggregate fraud-engine signal from SSDI-Validator. Not an accusation.",
  }),
  intakeProp({
    name: "ssdi_validator_id",
    label: "SSDI Validator ID",
    type: "string",
    fieldType: "text",
  }),
  intakeProp({
    name: "ssdi_validator_reason",
    label: "SSDI Validator Reason",
    type: "string",
    fieldType: "text",
  }),
  intakeProp({
    name: "ssdi_lead_stage",
    label: "SSDI Lead Stage",
    type: "enumeration",
    fieldType: "select",
    description: "Pipeline mirror: NEW → VALIDATING → VALIDATED/INCOMPLETE/CONTRADICTED → FOLLOW_UP.",
    options: enumOptions(SSDI_LEAD_STAGES),
  }),
  intakeProp({
    name: "ssdi_inbound_phone",
    label: "SSDI Inbound Phone",
    type: "string",
    fieldType: "text",
    description: "Campaign inbound +15616520362.",
  }),
];

export const HUBSPOT_DEAL_PROPERTIES = [
  {
    name: "ssdi_intake_id",
    label: "SSDI Intake ID",
    type: "string",
    fieldType: "text",
    groupName: "dealinformation",
  },
  {
    name: "ssdi_validator_status",
    label: "SSDI Validator Status",
    type: "string",
    fieldType: "text",
    groupName: "dealinformation",
  },
];

export function isPlaceholderHubSpotToken(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  if (HUBSPOT_TOKEN_PLACEHOLDERS.has(raw)) return true;
  return raw.startsWith("__") && raw.endsWith("__");
}

export function hubspotToken(env = process.env) {
  const raw = ssdiOnlyValue(envTrim(env, "HUBSPOT_ACCESS_TOKEN"));
  if (!raw || isPlaceholderHubSpotToken(raw)) return undefined;
  return raw;
}

export function configuredHubSpotPortalId(env = process.env) {
  return envTrim(env, "HUBSPOT_PORTAL_ID");
}

/** MVA accident fields. SSDI Campaigns never writes `intake_*` properties. */
export function isMvaIntakePropertyName(name) {
  return String(name || "").startsWith("intake_");
}

export function isHubSpotWired(env = process.env) {
  return Boolean(hubspotToken(env));
}

export function hubspotFormId(env = process.env) {
  return ssdiOnlyValue(envTrim(env, "HUBSPOT_FORM_ID"));
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

function customProperties(lead, extra = {}) {
  const stage = extra.stage || "NEW";
  const props = {
    ssdi_tcpa_consent: "true",
    ssdi_tcpa_consent_at: lead.receivedAt,
    ssdi_campaign_source: lead.source || "ssdi-campaigns",
    ssdi_source: lead.source || "ssdi-campaigns",
    ssdi_intake_id: lead.id,
    ssdi_sensitive_health_ack: lead.sensitiveHealth ? "true" : "false",
    ssdi_validator_status: extra.validatorStatus || stage,
    ssdi_lead_stage: stage,
    ssdi_inbound_phone: "+15616520362",
  };
  if (lead.disabilityType) props.ssdi_disability_type = lead.disabilityType;
  if (lead.state) props.ssdi_state = lead.state;
  if (lead.zip) props.ssdi_zip = lead.zip;
  if (lead.message) props.ssdi_message = lead.message.slice(0, 500);
  if (extra.fraudSignal) props.ssdi_fraud_signal = String(extra.fraudSignal).slice(0, 120);
  if (extra.validatorId) props.ssdi_validator_id = extra.validatorId;
  if (extra.validatorReason) props.ssdi_validator_reason = String(extra.validatorReason).slice(0, 200);
  return props;
}

export function contactProperties(lead, { includeCustom = true, extra = {} } = {}) {
  const props = { ...standardProperties(lead) };
  if (includeCustom) Object.assign(props, customProperties(lead, extra));
  for (const key of Object.keys(props)) {
    if (isMvaIntakePropertyName(key)) {
      throw new Error(`hubspot blocked: MVA property ${key} is not allowed on SSDI Campaigns`);
    }
  }
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
let pipelineCache = null;
let identityCache = null;

export function resetHubSpotPropertyCache() {
  propertiesEnsured = false;
  pipelineCache = null;
  identityCache = null;
}

async function ensureObjectProperties(fetchFn, token, object, defs) {
  await Promise.all(
    defs.map((prop) =>
      hsJson(fetchFn, token, `/crm/v3/properties/${object}`, {
        method: "POST",
        body: prop,
      }).catch(() => null),
    ),
  );
}

async function ensureIntakePropertyGroup(fetchFn, token) {
  const get = await hsJson(fetchFn, token, `/crm/v3/properties/contacts/groups/${SSDI_INTAKE_PROPERTY_GROUP}`);
  if (get.ok || get.status === 409) return true;
  const created = await hsJson(fetchFn, token, "/crm/v3/properties/contacts/groups", {
    method: "POST",
    body: {
      name: SSDI_INTAKE_PROPERTY_GROUP,
      label: "SSDI Campaigns Intake",
      displayOrder: 2,
    },
  });
  return created.ok || created.status === 409 || created.status === 400;
}

async function ensureCustomProperties(fetchFn, token) {
  if (propertiesEnsured) return;
  await ensureIntakePropertyGroup(fetchFn, token);
  await ensureObjectProperties(fetchFn, token, "contacts", HUBSPOT_CUSTOM_PROPERTIES);
  await ensureObjectProperties(fetchFn, token, "deals", HUBSPOT_DEAL_PROPERTIES);
  propertiesEnsured = true;
}

/**
 * Identify the HubSpot portal behind the token.
 * AbbyCRM portal 247081451 is allowed for a dedicated SSDI Campaigns private app.
 */
export async function resolveHubSpotIdentity(fetchFn, token, env = process.env) {
  if (identityCache) return identityCache;
  const configured = configuredHubSpotPortalId(env);
  try {
    const me = await hsJson(fetchFn, token, "/integrations/v1/me");
    const portalId = me.json?.portalId != null ? String(me.json.portalId) : configured || null;
    identityCache = { ok: me.ok || Boolean(portalId), forbidden: false, portalId };
    return identityCache;
  } catch (err) {
    console.error("hubspot identity failed", err);
    identityCache = { ok: true, forbidden: false, portalId: configured || null, reason: "identity_unknown" };
    return identityCache;
  }
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

async function writeContact(fetchFn, token, lead, existing, extra = {}) {
  const attempts = [true, false];
  let last = { ok: false, status: 0, json: {} };
  for (const includeCustom of attempts) {
    const properties = contactProperties(lead, { includeCustom, extra });
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatWhatsAppSection(emoji, title, lines) {
  const header = `${emoji} <strong>${escapeHtml(title)}</strong>`;
  const body = lines
    .filter((line) => line != null && String(line).length)
    .map((line) => escapeHtml(String(line)).replace(/\n/g, "<br>"))
    .join("<br>");
  return body ? `<p>${header}<br>${body}</p>` : `<p>${header}</p>`;
}

/**
 * Canonical HubSpot-safe intake NOTE (WhatsApp-style HTML). Same sauce as the
 * CaseClosedFL note bridge, SSDI educational-screening copy only.
 */
export function intakeNoteHtml(lead) {
  const vapi = String(lead.source || "").toLowerCase().includes("vapi");
  const sections = [
    formatWhatsAppSection("📍", "SSDI Campaigns screening", [
      "✅ SSDI Campaigns Qualified Educational Screening Intake",
      `Intake ID: ${lead.id}`,
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `Email: ${lead.email || ""}`,
      `State: ${lead.state || ""}`,
      `ZIP: ${lead.zip || ""}`,
      `Disability type: ${lead.disabilityType || ""}`,
      `Source: ${lead.source || "ssdi-campaigns"}`,
      "Inbound: +15616520362",
    ]),
    formatWhatsAppSection("✅", "Consent", [
      "TCPA prior express written consent: YES",
      `Sensitive health acknowledgment: ${lead.sensitiveHealth ? "YES" : "NO"}`,
      `Consent recorded at: ${lead.receivedAt}`,
      `Phone authorized: ${lead.phone}`,
    ]),
    formatWhatsAppSection("📝", "Narrative", [lead.message || "(none)"]),
  ];
  if (vapi) {
    sections.push(
      formatWhatsAppSection("📞", "Inbound voice", [
        "Channel: inbound phone",
        "Provider: Vapi",
        `Source: ${lead.source}`,
      ]),
    );
  }
  sections.push(
    formatWhatsAppSection("⚖️", "Disclaimer", [
      "Educational screening only. Not SSA-affiliated. Not legal advice. Not an SSA decision.",
    ]),
  );
  return sections.join("");
}

export function validationNoteHtml(lead, result) {
  if (result?.hubspotNote) return String(result.hubspotNote);
  const status = result?.status || "INCOMPLETE";
  const human = result?.humanNote ? String(result.humanNote).slice(0, 4000) : "";
  return [
    formatWhatsAppSection("🔎", "SSDI Campaigns Validation", [
      `Status: ${status}`,
      `Reason: ${result?.reason || ""}`,
      `Fraud signal: ${result?.fraudSignal || "none"}`,
      `Validator ID: ${result?.validationId || ""}`,
      `Intake ID: ${lead.id}`,
    ]),
    human
      ? formatWhatsAppSection("📋", "Staff note", [human])
      : formatWhatsAppSection("⚖️", "Disclaimer", [
          "Educational screening only. Not SSA-affiliated. Not legal advice. Not an SSA decision.",
        ]),
  ].join("");
}

export async function createHubSpotNote(contactId, html, { env = process.env, fetch: fetchFn = globalThis.fetch } = {}) {
  const token = hubspotToken(env);
  if (!token || !contactId) return { ok: false, skipped: true, reason: "unwired" };
  try {
    const res = await hsJson(fetchFn, token, "/crm/v3/objects/notes", {
      method: "POST",
      body: {
        properties: {
          hs_timestamp: Date.now().toString(),
          hs_note_body: html,
        },
        associations: [
          {
            to: { id: String(contactId) },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: NOTE_TO_CONTACT }],
          },
        ],
      },
    });
    if (!res.ok) {
      console.error("hubspot note failed", res.status, res.json?.message);
      return { ok: false, error: res.json?.message || `note_${res.status}` };
    }
    return { ok: true, noteId: res.json.id };
  } catch (err) {
    console.error("hubspot note failed", err);
    return { ok: false, error: "note_network" };
  }
}

function stageKeyFromStatus(status) {
  const s = String(status || "").toUpperCase();
  if (s === "VALIDATED") return "validated";
  if (s === "CONTRADICTED") return "contradicted";
  if (s === "INCOMPLETE") return "incomplete";
  if (s === "FOLLOW_UP" || s === "FOLLOW-UP") return "follow_up";
  if (s === "VALIDATING") return "validating";
  return "new";
}

async function ensureDealPipeline(fetchFn, token) {
  if (pipelineCache) return pipelineCache;
  const listed = await hsJson(fetchFn, token, "/crm/v3/pipelines/deals");
  const existing = listed.ok
    ? (listed.json.results || []).find((p) => p.label === SSDI_DEAL_PIPELINE_LABEL)
    : null;
  if (existing) {
    pipelineCache = {
      id: existing.id,
      stages: Object.fromEntries(
        (existing.stages || []).map((st) => [String(st.label).toLowerCase().replace(/\s+/g, "_"), st.id]),
      ),
    };
    return pipelineCache;
  }
  const created = await hsJson(fetchFn, token, "/crm/v3/pipelines/deals", {
    method: "POST",
    body: {
      label: SSDI_DEAL_PIPELINE_LABEL,
      displayOrder: 0,
      stages: SSDI_DEAL_STAGES.map((st, i) => ({
        label: st.label,
        displayOrder: i,
        metadata: st.metadata,
      })),
    },
  });
  if (!created.ok) {
    console.error("hubspot pipeline create failed", created.status, created.json?.message);
    return null;
  }
  pipelineCache = {
    id: created.json.id,
    stages: Object.fromEntries(
      (created.json.stages || []).map((st) => [String(st.label).toLowerCase().replace(/\s+/g, "_"), st.id]),
    ),
  };
  return pipelineCache;
}

async function searchDealByIntakeId(fetchFn, token, intakeId) {
  const { ok, json } = await hsJson(fetchFn, token, "/crm/v3/objects/deals/search", {
    method: "POST",
    body: {
      filterGroups: [
        { filters: [{ propertyName: "ssdi_intake_id", operator: "EQ", value: intakeId }] },
      ],
      properties: ["dealname", "ssdi_intake_id", "dealstage"],
      limit: 1,
    },
  });
  if (!ok) return null;
  return json.results?.[0] ?? null;
}

export async function upsertHubSpotDeal(lead, contactId, stageKey, extra = {}, { env = process.env, fetch: fetchFn = globalThis.fetch } = {}) {
  const token = hubspotToken(env);
  if (!token || !contactId) return { ok: false, skipped: true, reason: "unwired" };
  try {
    const pipeline = await ensureDealPipeline(fetchFn, token);
    if (!pipeline) return { ok: false, skipped: true, reason: "pipeline_unavailable" };
    const dealstage = pipeline.stages[stageKey] || pipeline.stages.new;
    const existing = await searchDealByIntakeId(fetchFn, token, lead.id);
    const properties = {
      dealname: `SSDI — ${lead.name}`,
      pipeline: pipeline.id,
      dealstage,
      ssdi_intake_id: lead.id,
      ssdi_validator_status: extra.validatorStatus || stageKey.toUpperCase(),
    };
    if (existing) {
      const patched = await hsJson(fetchFn, token, `/crm/v3/objects/deals/${existing.id}`, {
        method: "PATCH",
        body: { properties },
      });
      if (!patched.ok) return { ok: false, error: patched.json?.message || `deal_${patched.status}` };
      return { ok: true, action: "updated", dealId: existing.id, stage: stageKey };
    }
    const created = await hsJson(fetchFn, token, "/crm/v3/objects/deals", {
      method: "POST",
      body: {
        properties,
        associations: [
          {
            to: { id: String(contactId) },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: DEAL_TO_CONTACT }],
          },
        ],
      },
    });
    if (!created.ok) {
      console.error("hubspot deal create failed", created.status, created.json?.message);
      return { ok: false, error: created.json?.message || `deal_${created.status}` };
    }
    return { ok: true, action: "created", dealId: created.json.id, stage: stageKey };
  } catch (err) {
    console.error("hubspot deal failed", err);
    return { ok: false, error: "deal_network" };
  }
}

/**
 * PATCH validator fields + write a validation NOTE. Best-effort.
 */
export async function attachValidatorToHubSpot(lead, contactId, result, { env = process.env, fetch: fetchFn = globalThis.fetch, note: writeNote = true } = {}) {
  const token = hubspotToken(env);
  if (!token || !contactId) return { ok: false, skipped: true, reason: "unwired" };
  const status = result?.status || "INCOMPLETE";
  const stage = String(status).toUpperCase();
  const properties = {
    ssdi_validator_status: stage,
    ssdi_lead_stage: stage,
    hs_lead_status: status === "CONTRADICTED" ? "UNQUALIFIED" : status === "VALIDATED" ? "OPEN" : "OPEN",
  };
  if (result?.fraudSignal) properties.ssdi_fraud_signal = String(result.fraudSignal).slice(0, 120);
  if (result?.validationId) properties.ssdi_validator_id = result.validationId;
  if (result?.reason) properties.ssdi_validator_reason = String(result.reason).slice(0, 200);

  let patchOk = false;
  try {
    const patched = await hsJson(fetchFn, token, `/crm/v3/objects/contacts/${contactId}`, {
      method: "PATCH",
      body: { properties },
    });
    patchOk = patched.ok;
    if (!patched.ok) console.error("hubspot validator patch failed", patched.status, patched.json?.message);
  } catch (err) {
    console.error("hubspot validator patch failed", err);
  }

  const note = writeNote
    ? await createHubSpotNote(contactId, validationNoteHtml(lead, result), { env, fetch: fetchFn })
    : { ok: false, skipped: true, reason: "skipped" };
  const deal = await upsertHubSpotDeal(lead, contactId, stageKeyFromStatus(status), { validatorStatus: stage }, { env, fetch: fetchFn });
  return { ok: patchOk || note.ok === true, patchOk, note, deal };
}

function formFieldsFromLead(lead) {
  const { firstname, lastname } = splitName(lead.name);
  const fields = [
    { name: "firstname", value: firstname },
    { name: "lastname", value: lastname },
    { name: "phone", value: lead.phone },
  ];
  if (lead.email) fields.push({ name: "email", value: lead.email });
  if (lead.state) fields.push({ name: "state", value: lead.state });
  if (lead.zip) fields.push({ name: "zip", value: lead.zip });
  if (lead.disabilityType) fields.push({ name: "ssdi_disability_type", value: lead.disabilityType });
  fields.push({ name: "ssdi_tcpa_consent", value: "true" });
  fields.push({ name: "ssdi_campaign_source", value: lead.source || "ssdi-campaigns" });
  fields.push({ name: "ssdi_intake_id", value: lead.id });
  return fields.filter((f) => f.value != null && String(f.value).length);
}

/**
 * Optional HubSpot Forms v3 submit (server-side equivalent of a form embed).
 * Requires HUBSPOT_FORM_ID. Portal ID from HUBSPOT_PORTAL_ID or /integrations/v1/me.
 * CRM upsert still runs either way — this is extra form-analytics, not a stub for CRM.
 */
export async function submitHubSpotForm(lead, { env = process.env, fetch: fetchFn = globalThis.fetch, portalId } = {}) {
  const token = hubspotToken(env);
  const formId = hubspotFormId(env);
  const pid = portalId || configuredHubSpotPortalId(env);
  if (!token || !formId || !pid) {
    return { ok: false, skipped: true, reason: !formId ? "no_form_id" : "unwired" };
  }
  const url = `${HSFORMS_API}/submissions/v3/integration/secure/submit/${encodeURIComponent(pid)}/${encodeURIComponent(formId)}`;
  const payload = {
    fields: formFieldsFromLead(lead),
    context: {
      pageUri: "https://ssdicampaigns.com/contact",
      pageName: "SSDI Campaigns intake",
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: "TCPA prior express written consent captured on ssdicampaigns.com.",
      },
    },
  };
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("hubspot form submit failed", res.status, text.slice(0, 300));
      return { ok: false, error: `form_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("hubspot form submit failed", err);
    return { ok: false, error: "form_network" };
  }
}

/**
 * Create or update a HubSpot contact from the site form or Vapi.
 * First-class CRM write: custom ssdi_* properties, intake NOTE, SSDI Campaigns
 * deal pipeline. Optional Forms v3 submit when HUBSPOT_FORM_ID is set.
 * Writes `ssdi_*` properties and the SSDI Campaigns pipeline only — never MVA
 * `intake_*` accident fields. Same AbbyCRM portal is allowed with a dedicated
 * SSDI private app; CaseClosedFL token placeholders stay unwired.
 */
export async function upsertHubSpotContact(lead, { env = process.env, fetch: fetchFn = globalThis.fetch, extra = {} } = {}) {
  const token = hubspotToken(env);
  if (!token) {
    return { ok: false, skipped: true, reason: "unwired" };
  }

  const identity = await resolveHubSpotIdentity(fetchFn, token, env);
  if (identity.forbidden) {
    console.error("hubspot blocked: CaseClosedFL token is not allowed on SSDI Campaigns");
    return { ok: false, skipped: true, reason: "forbidden_token", portalId: identity.portalId };
  }

  await ensureCustomProperties(fetchFn, token);

  let existing = null;
  try {
    existing = await searchContact(fetchFn, token, lead);
  } catch (err) {
    console.error("hubspot search failed", err);
  }

  try {
    const result = await writeContact(fetchFn, token, lead, existing, { stage: extra.stage || "NEW", ...extra });
    if (!result.ok) {
      console.error("hubspot write failed", result);
      return result;
    }
    const note = await createHubSpotNote(result.contactId, extra.noteHtml || intakeNoteHtml(lead), { env, fetch: fetchFn });
    const deal = await upsertHubSpotDeal(lead, result.contactId, stageKeyFromStatus(extra.stage || "NEW"), extra, {
      env,
      fetch: fetchFn,
    });
    const form = await submitHubSpotForm(lead, { env, fetch: fetchFn, portalId: identity.portalId });
    return { ...result, note, deal, form, portalId: identity.portalId };
  } catch (err) {
    console.error("hubspot upsert failed", err);
    return { ok: false, error: "hubspot_network" };
  }
}

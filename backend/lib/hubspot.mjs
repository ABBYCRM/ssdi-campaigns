import { envTrim } from "./brand.mjs";

const HUBSPOT_API = "https://api.hubapi.com";

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
  {
    name: "ssdi_validator_status",
    label: "SSDI Validator Status",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    description: "SSDI-Validator result: VALIDATED / INCOMPLETE / CONTRADICTED (plus NEW / VALIDATING / FOLLOW_UP).",
    options: enumOptions(SSDI_LEAD_STAGES),
  },
  {
    name: "ssdi_fraud_signal",
    label: "SSDI Fraud Signal",
    type: "string",
    fieldType: "text",
    groupName: "contactinformation",
    description: "Aggregate fraud-engine signal from SSDI-Validator. Not an accusation.",
  },
  {
    name: "ssdi_validator_id",
    label: "SSDI Validator ID",
    type: "string",
    fieldType: "text",
    groupName: "contactinformation",
  },
  {
    name: "ssdi_validator_reason",
    label: "SSDI Validator Reason",
    type: "string",
    fieldType: "text",
    groupName: "contactinformation",
  },
  {
    name: "ssdi_lead_stage",
    label: "SSDI Lead Stage",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    description: "Pipeline mirror: NEW → VALIDATING → VALIDATED/INCOMPLETE/CONTRADICTED → FOLLOW_UP.",
    options: enumOptions(SSDI_LEAD_STAGES),
  },
  {
    name: "ssdi_inbound_phone",
    label: "SSDI Inbound Phone",
    type: "string",
    fieldType: "text",
    groupName: "contactinformation",
    description: "Campaign inbound +15616520362.",
  },
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

function customProperties(lead, extra = {}) {
  const stage = extra.stage || "NEW";
  const props = {
    ssdi_tcpa_consent: "true",
    ssdi_tcpa_consent_at: lead.receivedAt,
    ssdi_campaign_source: lead.source || "ssdi-campaigns",
    ssdi_intake_id: lead.id,
    ssdi_sensitive_health_ack: lead.sensitiveHealth ? "true" : "false",
    ssdi_validator_status: extra.validatorStatus || stage,
    ssdi_lead_stage: stage,
    ssdi_inbound_phone: "+15616520362",
  };
  if (lead.disabilityType) props.ssdi_disability_type = lead.disabilityType;
  if (lead.message) props.ssdi_message = lead.message.slice(0, 500);
  if (extra.fraudSignal) props.ssdi_fraud_signal = String(extra.fraudSignal).slice(0, 120);
  if (extra.validatorId) props.ssdi_validator_id = extra.validatorId;
  if (extra.validatorReason) props.ssdi_validator_reason = String(extra.validatorReason).slice(0, 200);
  return props;
}

export function contactProperties(lead, { includeCustom = true, extra = {} } = {}) {
  const props = { ...standardProperties(lead) };
  if (includeCustom) Object.assign(props, customProperties(lead, extra));
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

export function resetHubSpotPropertyCache() {
  propertiesEnsured = false;
  pipelineCache = null;
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

async function ensureCustomProperties(fetchFn, token) {
  if (propertiesEnsured) return;
  await ensureObjectProperties(fetchFn, token, "contacts", HUBSPOT_CUSTOM_PROPERTIES);
  await ensureObjectProperties(fetchFn, token, "deals", HUBSPOT_DEAL_PROPERTIES);
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

export function intakeNoteHtml(lead) {
  const rows = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email || ""],
    ["Disability type", lead.disabilityType || ""],
    ["State", lead.state || ""],
    ["ZIP", lead.zip || ""],
    ["Source", lead.source || ""],
    ["TCPA", "true"],
    ["Sensitive health ack", lead.sensitiveHealth ? "true" : "false"],
    ["Intake ID", lead.id],
    ["Received", lead.receivedAt],
    ["Inbound", "+15616520362"],
  ];
  const lines = rows
    .map(([k, v]) => `<div><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</div>`)
    .join("");
  const msg = lead.message
    ? `<p><strong>Message:</strong><br/>${escapeHtml(lead.message).slice(0, 2000)}</p>`
    : "";
  return `<h3>SSDI Campaigns Qualified Educational Screening Intake</h3>${lines}${msg}<p><em>Educational screening only. Not SSA-affiliated. Not legal advice. Not an SSA decision.</em></p>`;
}

export function validationNoteHtml(lead, result) {
  if (result?.hubspotNote) return String(result.hubspotNote);
  const status = result?.status || "INCOMPLETE";
  const reason = result?.reason ? escapeHtml(result.reason) : "";
  const fraud = result?.fraudSignal ? escapeHtml(result.fraudSignal) : "none";
  const vid = result?.validationId ? escapeHtml(result.validationId) : "";
  const human = result?.humanNote ? `<pre>${escapeHtml(result.humanNote).slice(0, 4000)}</pre>` : "";
  return `<h3>SSDI Campaigns Validation</h3>
<div><strong>Status:</strong> ${escapeHtml(status)}</div>
<div><strong>Reason:</strong> ${reason}</div>
<div><strong>Fraud signal:</strong> ${fraud}</div>
<div><strong>Validator ID:</strong> ${vid}</div>
<div><strong>Intake ID:</strong> ${escapeHtml(lead.id)}</div>
${human}
<p><em>Educational screening only. Not SSA-affiliated. Not legal advice. Not an SSA decision.</em></p>`;
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

/**
 * Create or update a HubSpot contact. Maps TCPA consent + campaign source onto
 * custom properties (best-effort) and standard firstname/lastname/phone/email.
 * Server-side equivalent of a HubSpot form — we do not embed marketing forms.
 */
export async function upsertHubSpotContact(lead, { env = process.env, fetch: fetchFn = globalThis.fetch, extra = {} } = {}) {
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
    return { ...result, note, deal };
  } catch (err) {
    console.error("hubspot upsert failed", err);
    return { ok: false, error: "hubspot_network" };
  }
}

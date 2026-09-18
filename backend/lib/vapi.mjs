import { envTrim, ssdiOnlyValue } from "./brand.mjs";

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function coerceTcpa(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function toolResults(message) {
  const bags = [];
  const toolCalls = message.toolCalls || message.toolCallList || message["tool-calls"] || [];
  if (Array.isArray(toolCalls)) {
    for (const call of toolCalls) {
      const fn = call.function || call;
      const name = String(fn.name || call.name || "");
      if (!/lead|intake|contact/i.test(name)) continue;
      let args = fn.arguments ?? call.arguments ?? {};
      if (typeof args === "string") {
        try {
          args = JSON.parse(args);
        } catch {
          args = {};
        }
      }
      bags.push(asObject(args));
    }
  }
  if (message.functionCall) {
    let args = message.functionCall.arguments ?? {};
    if (typeof args === "string") {
      try {
        args = JSON.parse(args);
      } catch {
        args = {};
      }
    }
    bags.push(asObject(args));
  }
  return Object.assign({}, ...bags);
}

/**
 * Map a Vapi assistant webhook (SSDI assistant only) onto the same /intake
 * payload. No CaseClosedFL assistant IDs are hardcoded or defaulted.
 */
export function extractVapiLead(body, env = process.env) {
  const root = asObject(body);
  const message = asObject(root.message?.type ? root.message : root);
  const type = String(message.type || root.type || "");

  const interesting =
    type === "end-of-call-report" ||
    type === "tool-calls" ||
    type === "function-call" ||
    type === "";
  if (type && !interesting) {
    return { ok: false, skip: true, error: "ignored_event" };
  }

  const assistantId =
    ssdiOnlyValue(message.call?.assistantId) ||
    ssdiOnlyValue(message.assistant?.id) ||
    ssdiOnlyValue(root.assistantId) ||
    ssdiOnlyValue(message.assistantId);

  const expected = ssdiOnlyValue(envTrim(env, "VAPI_ASSISTANT_ID"));
  if (expected && assistantId && assistantId !== expected) {
    return { ok: false, skip: true, error: "assistant_mismatch" };
  }

  const structured = {
    ...asObject(message.analysis?.structuredData),
    ...asObject(message.artifact?.structuredData),
    ...toolResults(message),
  };

  const phone =
    structured.phone ||
    structured.customerPhone ||
    message.call?.customer?.number ||
    message.customer?.number ||
    root.customer?.number;

  const name = structured.name || structured.fullName || structured.customerName || "";
  const email = structured.email || "";
  const disabilityType = structured.disabilityType || structured.disability || "";
  const state = structured.state || "";
  const zip = structured.zip || structured.postalCode || "";
  const source = structured.source || "vapi-ssdi";
  const messageText =
    structured.message || message.analysis?.summary || message.artifact?.transcript || "";

  return {
    ok: true,
    payload: {
      name,
      phone,
      email,
      disabilityType,
      state,
      zip,
      message: typeof messageText === "string" ? messageText.slice(0, 2000) : "",
      tcpa: coerceTcpa(structured.tcpa),
      sensitiveHealth: structured.sensitiveHealth === true || structured.sensitiveHealth === "true",
      source,
    },
    assistantId: assistantId || null,
    eventType: type || "unknown",
  };
}

export function vapiSecretFromRequest(headers) {
  const h = headers || {};
  const named = h["x-vapi-secret"] || h["X-Vapi-Secret"];
  if (named) return String(named);
  const auth = h.authorization || h.Authorization;
  if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return undefined;
}

export function verifyVapiSecret(headers, env = process.env) {
  const expected = ssdiOnlyValue(envTrim(env, "VAPI_WEBHOOK_SECRET"));
  if (!expected) return { ok: true, wired: false };
  const provided = vapiSecretFromRequest(headers);
  if (provided !== expected) return { ok: false, wired: true };
  return { ok: true, wired: true };
}

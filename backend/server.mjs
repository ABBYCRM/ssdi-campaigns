/**
 * SSDI Campaigns intake API.
 *
 * POST /intake — HubSpot-primary lead persist (Sheets backup/failover).
 * POST /webhooks/vapi — SSDI Vapi assistant → same /intake path.
 * GET  /health — crm wired/unwired from HUBSPOT_ACCESS_TOKEN.
 *
 * Independent of CaseClosedFL. Do not set CaseClosedFL Resend keys, domains,
 * or Vapi assistant IDs on this service.
 */
import http from "node:http";
import { pathToFileURL } from "node:url";
import { healthStatus, persistIntake } from "./lib/persist.mjs";
import { extractVapiLead, verifyVapiSecret } from "./lib/vapi.mjs";

const PORT = Number(process.env.PORT || 8787);

export function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, authorization, x-vapi-secret",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(data);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  return JSON.parse(raw);
}

function pathname(req) {
  try {
    return new URL(req.url || "/", "http://ssdi.local").pathname.replace(/\/+$/, "") || "/";
  } catch {
    return "/";
  }
}

export function createHandler(deps = {}) {
  const env = deps.env ?? process.env;
  const fetchFn = deps.fetch ?? globalThis.fetch;

  return async function handler(req, res) {
    if (req.method === "OPTIONS") {
      json(res, 204, {});
      return;
    }

    const path = pathname(req);

    if (req.method === "GET" && path === "/health") {
      json(res, 200, healthStatus(env));
      return;
    }

    if (req.method === "POST" && path === "/intake") {
      let payload = {};
      try {
        payload = await readJsonBody(req);
      } catch {
        json(res, 400, { ok: false, error: "invalid_json" });
        return;
      }
      const result = await persistIntake(payload, { env, fetch: fetchFn });
      json(res, result.status || (result.ok ? 202 : 422), result);
      return;
    }

    if (req.method === "POST" && (path === "/webhooks/vapi" || path === "/vapi/webhook")) {
      const secret = verifyVapiSecret(req.headers, env);
      if (!secret.ok) {
        json(res, 401, { ok: false, error: "unauthorized" });
        return;
      }
      let body = {};
      try {
        body = await readJsonBody(req);
      } catch {
        json(res, 400, { ok: false, error: "invalid_json" });
        return;
      }
      const extracted = extractVapiLead(body, env);
      if (extracted.skip) {
        json(res, 202, { ok: true, ignored: true, reason: extracted.error });
        return;
      }
      const result = await persistIntake(extracted.payload, { env, fetch: fetchFn });
      json(res, result.status || (result.ok ? 202 : 422), {
        ...result,
        via: "vapi",
        eventType: extracted.eventType,
      });
      return;
    }

    json(res, 404, { ok: false, error: "not_found" });
  };
}

export function createIntakeServer(deps = {}) {
  return http.createServer(createHandler(deps));
}

const isMain =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const server = createIntakeServer();
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`ssdi intake listening on ${PORT}`);
  });
}

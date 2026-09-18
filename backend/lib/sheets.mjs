import { createSign } from "node:crypto";
import { envTrim } from "./brand.mjs";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function parseServiceAccount(env) {
  const rawJson = envTrim(env, "GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON");
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: String(parsed.private_key).replace(/\\n/g, "\n"),
        };
      }
    } catch {
      return null;
    }
  }

  const clientEmail = envTrim(env, "GOOGLE_SHEETS_CLIENT_EMAIL");
  let privateKey = envTrim(env, "GOOGLE_SHEETS_PRIVATE_KEY");
  if (!clientEmail || !privateKey) return null;
  privateKey = privateKey.replace(/\\n/g, "\n");
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1).replace(/\\n/g, "\n");
  }
  return { client_email: clientEmail, private_key: privateKey };
}

export function isSheetsConfigured(env = process.env) {
  const id = envTrim(env, "GOOGLE_SHEETS_SPREADSHEET_ID");
  return Boolean(id && parseServiceAccount(env));
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

async function googleAccessToken(creds, fetchFn) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: creds.client_email,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const jwt = `${unsigned}.${base64url(signer.sign(creds.private_key))}`;

  const res = await fetchFn(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(json.error || `google_token_${res.status}`);
  }
  return json.access_token;
}

function sheetRow(lead) {
  return [
    lead.receivedAt,
    lead.id,
    lead.name,
    lead.phone,
    lead.email ?? "",
    lead.disabilityType ?? "",
    lead.state ?? "",
    lead.zip ?? "",
    lead.source ?? "",
    lead.tcpa ? "true" : "false",
    lead.sensitiveHealth ? "true" : "false",
    lead.message ?? "",
  ];
}

/**
 * Append one lead row. Secondary only — callers decide when to invoke this
 * (after HubSpot success, or when HubSpot is unwired/failed).
 */
export async function appendGoogleSheet(lead, { env = process.env, fetch: fetchFn = globalThis.fetch } = {}) {
  if (!isSheetsConfigured(env)) {
    return { ok: false, skipped: true, reason: "unwired" };
  }

  const spreadsheetId = envTrim(env, "GOOGLE_SHEETS_SPREADSHEET_ID");
  const range = envTrim(env, "GOOGLE_SHEETS_RANGE") || "Leads!A1";
  const creds = parseServiceAccount(env);

  try {
    const accessToken = await googleAccessToken(creds, fetchFn);
    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
      `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const res = await fetchFn(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ values: [sheetRow(lead)] }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("sheets append failed", res.status, json);
      return { ok: false, error: json.error?.message || `sheets_${res.status}` };
    }
    return { ok: true, updatedRange: json.updates?.updatedRange };
  } catch (err) {
    console.error("sheets append failed", err);
    return { ok: false, error: "sheets_network" };
  }
}

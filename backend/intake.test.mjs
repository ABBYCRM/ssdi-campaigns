import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { once } from "node:events";
import { afterEach, describe, it } from "node:test";
import { containsForbiddenBrand, DEFAULT_RESEND_FROM, DEFAULT_RESEND_REPLY_TO, SSDI_VAPI_ASSISTANT_ID, ssdiOnlyValue } from "./lib/brand.mjs";
import { resetHubSpotPropertyCache } from "./lib/hubspot.mjs";
import { healthStatus, persistIntake } from "./lib/persist.mjs";
import { resendFromEmail, resendReplyTo } from "./lib/resend.mjs";
import { extractVapiLead, verifyVapiSecret } from "./lib/vapi.mjs";
import { createIntakeServer } from "./server.mjs";

afterEach(() => {
  resetHubSpotPropertyCache();
});

function leadPayload(over = {}) {
  return {
    name: "Ada Lovelace",
    phone: "4155550100",
    email: "ada@example.com",
    disabilityType: "Neurological (MS, epilepsy, Parkinson's, migraine)",
    state: "CA",
    zip: "94110",
    message: "Need help with a denial",
    tcpa: true,
    sensitiveHealth: true,
    source: "site",
    ...over,
  };
}

function mockFetch(handler) {
  const calls = [];
  const fetchFn = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return handler(String(url), init, calls);
  };
  fetchFn.calls = calls;
  return fetchFn;
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function hubspotFetch({ existingId = null, failWrite = false } = {}) {
  return mockFetch(async (url, init) => {
    if (url.endsWith("/crm/v3/properties/contacts") && init.method === "POST") {
      return jsonResponse(201, { name: "ok" });
    }
    if (url.includes("/crm/v3/objects/contacts/search")) {
      return jsonResponse(200, {
        results: existingId ? [{ id: existingId, properties: { email: "ada@example.com" } }] : [],
      });
    }
    if (url.includes("/crm/v3/objects/contacts") && failWrite) {
      return jsonResponse(500, { message: "hubspot down" });
    }
    if (url.includes("/crm/v3/objects/contacts") && init.method === "PATCH") {
      return jsonResponse(200, { id: existingId || "upd" });
    }
    if (url.includes("/crm/v3/objects/contacts") && init.method === "POST") {
      return jsonResponse(201, { id: "hs_new_1" });
    }
    return jsonResponse(404, { message: "unmocked " + url });
  });
}

const { privateKey: testPrivateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

function sheetsEnv(over = {}) {
  return {
    GOOGLE_SHEETS_SPREADSHEET_ID: "sheet123",
    GOOGLE_SHEETS_RANGE: "Leads!A1",
    GOOGLE_SHEETS_CLIENT_EMAIL: "sheets@ssdi-campaigns.iam.gserviceaccount.com",
    GOOGLE_SHEETS_PRIVATE_KEY: testPrivateKey,
    ...over,
  };
}

function crmFetch({ hubspot, sheetsOk = true } = {}) {
  const hs = hubspotFetch(hubspot);
  return mockFetch(async (url, init, calls) => {
    if (url.startsWith("https://api.hubapi.com")) {
      return hs(url, init);
    }
    if (url === "https://oauth2.googleapis.com/token") {
      return jsonResponse(200, { access_token: "ya29.test" });
    }
    if (url.includes("sheets.googleapis.com")) {
      if (!sheetsOk) return jsonResponse(500, { error: { message: "sheets down" } });
      return jsonResponse(200, { updates: { updatedRange: "Leads!A2:L2" } });
    }
    if (url === "https://api.resend.com/emails") {
      return jsonResponse(200, { id: "email_1" });
    }
    return jsonResponse(404, { message: "unmocked " + url });
  });
}

describe("brand isolation", () => {
  it("defaults Resend From to ssdicampaigns.com and Reply-To to Intake@abbycrm.com", () => {
    assert.match(DEFAULT_RESEND_FROM, /ssdicampaigns\.com/);
    assert.equal(DEFAULT_RESEND_REPLY_TO, "Intake@abbycrm.com");
    assert.equal(containsForbiddenBrand(DEFAULT_RESEND_FROM), false);
    assert.equal(containsForbiddenBrand(DEFAULT_RESEND_REPLY_TO), false);
    assert.equal(containsForbiddenBrand("noreply@caseclosedfl.com"), true);
    assert.equal(ssdiOnlyValue("SSDI Campaigns <hello@caseclosedfl.com>"), undefined);
    assert.equal(resendFromEmail({ RESEND_FROM_EMAIL: "CaseClosedFL <a@caseclosedfl.com>" }), DEFAULT_RESEND_FROM);
    assert.equal(resendReplyTo({ RESEND_REPLY_TO: "intake@caseclosedfl.com" }), DEFAULT_RESEND_REPLY_TO);
  });
});

describe("TCPA fail-closed", () => {
  it("rejects missing or non-boolean-true TCPA", async () => {
    for (const tcpa of [undefined, false, "true", "yes", 1]) {
      const result = await persistIntake(leadPayload({ tcpa }));
      assert.equal(result.ok, false);
      assert.equal(result.status, 422);
      assert.equal(result.error, "validation");
    }
  });

  it("rejects missing name or phone", async () => {
    const noName = await persistIntake(leadPayload({ name: "" }));
    const noPhone = await persistIntake(leadPayload({ phone: "123" }));
    assert.equal(noName.status, 422);
    assert.equal(noPhone.status, 422);
  });
});

describe("HubSpot primary persist", () => {
  it("creates a contact and maps TCPA + source", async () => {
    const fetchFn = hubspotFetch();
    const env = { HUBSPOT_ACCESS_TOKEN: "pat-ssdi-test" };
    const result = await persistIntake(leadPayload(), { env, fetch: fetchFn });
    assert.equal(result.ok, true);
    assert.equal(result.forwardedTo, "hubspot");
    assert.equal(result.hubspot.ok, true);
    assert.equal(result.hubspot.action, "created");
    assert.equal(result.hubspot.contactId, "hs_new_1");

    const write = fetchFn.calls.find(
      (c) => c.url.endsWith("/crm/v3/objects/contacts") && c.init.method === "POST",
    );
    assert.ok(write);
    const body = JSON.parse(write.init.body);
    assert.equal(body.properties.firstname, "Ada");
    assert.equal(body.properties.lastname, "Lovelace");
    assert.equal(body.properties.email, "ada@example.com");
    assert.equal(body.properties.phone, "4155550100");
    assert.equal(body.properties.ssdi_tcpa_consent, "true");
    assert.equal(body.properties.ssdi_campaign_source, "site");
    assert.equal(body.properties.hs_lead_status, "NEW");
  });

  it("updates an existing contact found by email", async () => {
    const fetchFn = hubspotFetch({ existingId: "hs_existing" });
    const result = await persistIntake(leadPayload(), {
      env: { HUBSPOT_ACCESS_TOKEN: "pat-ssdi-test" },
      fetch: fetchFn,
    });
    assert.equal(result.hubspot.action, "updated");
    assert.equal(result.hubspot.contactId, "hs_existing");
    assert.ok(
      fetchFn.calls.some(
        (c) => c.url.endsWith("/crm/v3/objects/contacts/hs_existing") && c.init.method === "PATCH",
      ),
    );
  });

  it("returns 502 when HubSpot is wired and both destinations fail", async () => {
    const fetchFn = crmFetch({ hubspot: { failWrite: true }, sheetsOk: false });
    const result = await persistIntake(leadPayload(), {
      env: { HUBSPOT_ACCESS_TOKEN: "pat-ssdi-test", ...sheetsEnv() },
      fetch: fetchFn,
    });
    assert.equal(result.ok, false);
    assert.equal(result.status, 502);
    assert.equal(result.error, "crm_unavailable");
  });
});

describe("Sheets backup / failover", () => {
  it("appends Sheets after HubSpot success", async () => {
    const fetchFn = crmFetch();
    const result = await persistIntake(leadPayload(), {
      env: { HUBSPOT_ACCESS_TOKEN: "pat-ssdi-test", ...sheetsEnv() },
      fetch: fetchFn,
    });
    assert.equal(result.ok, true);
    assert.equal(result.forwardedTo, "hubspot+sheets");
    assert.equal(result.hubspot.ok, true);
    assert.equal(result.sheets.ok, true);
    assert.ok(fetchFn.calls.some((c) => c.url.includes("sheets.googleapis.com") && c.url.includes(":append")));
  });

  it("uses Sheets when HubSpot is unwired", async () => {
    const fetchFn = crmFetch();
    const result = await persistIntake(leadPayload(), {
      env: sheetsEnv(),
      fetch: fetchFn,
    });
    assert.equal(result.ok, true);
    assert.equal(result.forwardedTo, "sheets");
    assert.equal(result.hubspot.wired, false);
    assert.equal(result.sheets.ok, true);
    assert.equal(
      fetchFn.calls.some((c) => c.url.startsWith("https://api.hubapi.com")),
      false,
    );
  });

  it("failovers to Sheets when HubSpot API fails", async () => {
    const fetchFn = crmFetch({ hubspot: { failWrite: true }, sheetsOk: true });
    const result = await persistIntake(leadPayload(), {
      env: { HUBSPOT_ACCESS_TOKEN: "pat-ssdi-test", ...sheetsEnv() },
      fetch: fetchFn,
    });
    assert.equal(result.ok, true);
    assert.equal(result.forwardedTo, "sheets");
    assert.equal(result.hubspot.ok, false);
    assert.equal(result.sheets.ok, true);
  });

  it("does not call Sheets when GOOGLE_SHEETS_* is incomplete", async () => {
    const fetchFn = hubspotFetch();
    const result = await persistIntake(leadPayload(), {
      env: { HUBSPOT_ACCESS_TOKEN: "pat-ssdi-test", GOOGLE_SHEETS_SPREADSHEET_ID: "only-id" },
      fetch: fetchFn,
    });
    assert.equal(result.forwardedTo, "hubspot");
    assert.equal(result.sheets.skipped, true);
    assert.equal(
      fetchFn.calls.some((c) => c.url.includes("sheets.googleapis.com")),
      false,
    );
  });
});

describe("health", () => {
  it("reports crm wired only when HubSpot token is present", () => {
    assert.equal(healthStatus({}).crm, "unwired");
    assert.equal(healthStatus({ HUBSPOT_ACCESS_TOKEN: "   " }).crm, "unwired");
    assert.deepEqual(healthStatus({ HUBSPOT_ACCESS_TOKEN: "pat-ssdi" }).crm, "wired");
    const both = healthStatus({
      HUBSPOT_ACCESS_TOKEN: "pat-ssdi",
      ...sheetsEnv(),
      RESEND_API_KEY: "re_ssdi",
      VAPI_ASSISTANT_ID: "asst_ssdi",
    });
    assert.equal(both.crm, "wired");
    assert.equal(both.sheets, "backup");
    assert.equal(both.email, "wired");
    assert.equal(both.vapi, "wired");
    assert.equal(both.brand, "ssdi-campaigns");
  });
});

describe("Vapi webhook mapping", () => {
  it("maps end-of-call-report structured data onto intake fields", () => {
    const extracted = extractVapiLead({
      message: {
        type: "end-of-call-report",
        call: { assistantId: SSDI_VAPI_ASSISTANT_ID, customer: { number: "+14155550100" } },
        analysis: {
          summary: "Caller asked about a denial",
          structuredData: {
            name: "Ada Lovelace",
            email: "ada@example.com",
            disabilityType: "Cancer",
            state: "CA",
            zip: "94110",
            tcpa: true,
            source: "vapi-ssdi",
          },
        },
      },
    });
    assert.equal(extracted.ok, true);
    assert.equal(extracted.payload.tcpa, true);
    assert.equal(extracted.payload.phone, "+14155550100");
    assert.equal(extracted.payload.name, "Ada Lovelace");
    assert.equal(extracted.payload.source, "vapi-ssdi");
  });

  it("ignores a different assistant when VAPI_ASSISTANT_ID is set", () => {
    const extracted = extractVapiLead(
      {
        message: {
          type: "end-of-call-report",
          call: { assistantId: "asst_other_brand", customer: { number: "+14155550100" } },
          analysis: { structuredData: { name: "X", tcpa: true } },
        },
      },
      { VAPI_ASSISTANT_ID: "asst_ssdi_only" },
    );
    assert.equal(extracted.skip, true);
    assert.equal(extracted.error, "assistant_mismatch");
  });

  it("defaults to the SSDI assistant id, never CaseClosedFL", () => {
    assert.equal(SSDI_VAPI_ASSISTANT_ID, "c0f5dd63-3c51-4eb6-9f62-8a6e2391c954");
    assert.equal(containsForbiddenBrand(SSDI_VAPI_ASSISTANT_ID), false);
    const extracted = extractVapiLead({
      message: {
        type: "end-of-call-report",
        call: { assistantId: SSDI_VAPI_ASSISTANT_ID, customer: { number: "+14155550199" } },
        analysis: { structuredData: { name: "Pat", tcpa: true } },
      },
    });
    assert.equal(extracted.ok, true);
    assert.equal(extracted.skip, undefined);
    assert.equal(extracted.assistantId, SSDI_VAPI_ASSISTANT_ID);
  });

  it("fail-closes Vapi leads without tcpa true", async () => {
    const extracted = extractVapiLead({
      message: {
        type: "end-of-call-report",
        call: { customer: { number: "+14155550100" } },
        analysis: { structuredData: { name: "Ada Lovelace" } },
      },
    });
    const result = await persistIntake(extracted.payload);
    assert.equal(result.status, 422);
  });

  it("rejects a bad webhook secret", () => {
    const check = verifyVapiSecret({ "x-vapi-secret": "nope" }, { VAPI_WEBHOOK_SECRET: "ssdi-secret" });
    assert.equal(check.ok, false);
  });
});

describe("HTTP server", () => {
  async function withServer(deps, fn) {
    const server = createIntakeServer(deps);
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const { port } = server.address();
    try {
      await fn(port);
    } finally {
      server.close();
      await once(server, "close");
    }
  }

  it("GET /health reports unwired without a token", async () => {
    await withServer({ env: {} }, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.crm, "unwired");
    });
  });

  it("GET /health reports wired when HubSpot token is set", async () => {
    await withServer({ env: { HUBSPOT_ACCESS_TOKEN: "pat-ssdi" } }, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      const body = await res.json();
      assert.equal(body.crm, "wired");
    });
  });

  it("POST /intake fail-closes without TCPA", async () => {
    await withServer({ env: {} }, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/intake`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(leadPayload({ tcpa: false })),
      });
      assert.equal(res.status, 422);
    });
  });

  it("POST /webhooks/vapi posts completed-call leads into persist", async () => {
    const fetchFn = hubspotFetch();
    await withServer({ env: { HUBSPOT_ACCESS_TOKEN: "pat-ssdi" }, fetch: fetchFn }, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/webhooks/vapi`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: {
            type: "end-of-call-report",
            call: { assistantId: SSDI_VAPI_ASSISTANT_ID, customer: { number: "4155550100" } },
            analysis: {
              structuredData: {
                name: "Ada Lovelace",
                email: "ada@example.com",
                tcpa: true,
                source: "vapi-ssdi",
              },
            },
          },
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 202);
      assert.equal(body.via, "vapi");
      assert.equal(body.forwardedTo, "hubspot");
    });
  });

  it("POST /api/vapi/inbound accepts end-of-call reports", async () => {
    const fetchFn = hubspotFetch();
    await withServer({ env: { HUBSPOT_ACCESS_TOKEN: "pat-ssdi" }, fetch: fetchFn }, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/api/vapi/inbound`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: {
            type: "end-of-call-report",
            call: { assistantId: SSDI_VAPI_ASSISTANT_ID, customer: { number: "4155550100" } },
            analysis: {
              structuredData: {
                name: "Ada Lovelace",
                email: "ada@example.com",
                tcpa: true,
                source: "vapi-ssdi",
              },
            },
          },
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 202);
      assert.equal(body.via, "vapi");
      assert.equal(body.forwardedTo, "hubspot");
    });
  });
});

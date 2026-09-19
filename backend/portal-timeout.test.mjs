import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { submitPortalLead } from "./lib/portal.mjs";

describe("portal timeout", () => {
  it("defaults abort timeout to 25000ms", async () => {
    const delays = [];
    const realSetTimeout = globalThis.setTimeout;
    const realClear = globalThis.clearTimeout;
    globalThis.setTimeout = (fn, ms, ...args) => {
      delays.push(ms);
      return realSetTimeout(fn, 0, ...args); // fire ASAP so test ends
    };
    try {
      const fetchFn = async (_url, init) => {
        assert.ok(init.signal);
        return new Response(JSON.stringify({ ok: true, id: "p1" }), {
          status: 202,
          headers: { "content-type": "application/json" },
        });
      };
      const result = await submitPortalLead(
        { id: "l1", name: "T", phone: "555", email: "t@example.com", receivedAt: new Date().toISOString(), source: "web" },
        {},
        { env: { SSDI_PORTAL_URL: "https://portal.ssdicampaigns.example" }, fetch: fetchFn },
      );
      assert.equal(result.ok, true);
      assert.ok(delays.includes(25000), `got ${JSON.stringify(delays)}`);
    } finally {
      globalThis.setTimeout = realSetTimeout;
      globalThis.clearTimeout = realClear;
    }
  });

  it("honors SSDI_PORTAL_TIMEOUT_MS", async () => {
    const delays = [];
    const realSetTimeout = globalThis.setTimeout;
    const realClear = globalThis.clearTimeout;
    globalThis.setTimeout = (fn, ms, ...args) => {
      delays.push(ms);
      return realSetTimeout(fn, 0, ...args);
    };
    try {
      const fetchFn = async () =>
        new Response(JSON.stringify({ ok: true, id: "p2" }), {
          status: 202,
          headers: { "content-type": "application/json" },
        });
      await submitPortalLead(
        { id: "l2", name: "T", phone: "555", email: "t@example.com", receivedAt: new Date().toISOString(), source: "web" },
        {},
        {
          env: { SSDI_PORTAL_URL: "https://portal.ssdicampaigns.example", SSDI_PORTAL_TIMEOUT_MS: "30000" },
          fetch: fetchFn,
        },
      );
      assert.ok(delays.includes(30000), `got ${JSON.stringify(delays)}`);
    } finally {
      globalThis.setTimeout = realSetTimeout;
      globalThis.clearTimeout = realClear;
    }
  });
});

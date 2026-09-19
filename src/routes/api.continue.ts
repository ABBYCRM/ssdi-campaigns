import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

/** Lead follow-up from confirmation email: https://ssdicampaigns.com/api/continue */
export const Route = createFileRoute("/api/continue")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () =>
        Response.json(
          { ok: true, service: "ssdi-continue", path: "/api/continue", methods: ["POST"] },
          { headers: CORS },
        ),
      POST: async ({ request }) => {
        const { persistContinueDetails } = await import("../../backend/lib/continue.mjs");
        let body: unknown = {};
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400, headers: CORS });
        }
        const result = await persistContinueDetails(body, {
          env: process.env,
          fetch: globalThis.fetch,
        });
        return Response.json(result, {
          status: result.status || (result.ok ? 202 : 422),
          headers: CORS,
        });
      },
    },
  },
});

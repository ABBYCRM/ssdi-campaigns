import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization, x-vapi-secret",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

/**
 * SSDI Campaigns intake API (HubSpot primary + validator + portal).
 *   https://ssdicampaigns.com/api/intake
 */
export const Route = createFileRoute("/api/intake")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () =>
        Response.json(
          {
            ok: true,
            service: "ssdi-intake",
            path: "/api/intake",
            methods: ["POST"],
          },
          { headers: CORS },
        ),
      POST: async ({ request }) => {
        const { persistIntake } = await import("../../backend/lib/persist.mjs");
        let body: unknown = {};
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400, headers: CORS });
        }
        const result = await persistIntake(body, {
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

import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization, x-vapi-secret",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

/**
 * SSDI Vapi inbound webhook.
 * Configure the assistant server URL to:
 *   https://ssdicampaigns.com/api/vapi/inbound
 * Assistant id: c0f5dd63-3c51-4eb6-9f62-8a6e2391c954
 */
export const Route = createFileRoute("/api/vapi/inbound")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () =>
        Response.json(
          {
            ok: true,
            service: "ssdi-vapi-inbound",
            path: "/api/vapi/inbound",
          },
          { headers: CORS },
        ),
      POST: async ({ request }) => {
        const { handleVapiWebhook } = await import("../../backend/lib/vapi-handler.mjs");
        let body: unknown = {};
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400, headers: CORS });
        }
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const result = await handleVapiWebhook({
          body,
          headers,
          env: process.env,
          fetch: globalThis.fetch,
        });
        return Response.json(result.body, { status: result.status, headers: CORS });
      },
    },
  },
});

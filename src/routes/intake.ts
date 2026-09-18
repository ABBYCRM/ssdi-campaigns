import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization, x-vapi-secret",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

/**
 * Alias for POST /intake (matches backend/server.mjs path).
 * Prefer /api/intake in new clients.
 */
export const Route = createFileRoute("/intake")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () =>
        Response.json(
          {
            ok: true,
            service: "ssdi-intake",
            path: "/intake",
            methods: ["POST"],
            prefer: "/api/intake",
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

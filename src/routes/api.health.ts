import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization, x-vapi-secret",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

/**
 * SSDI Campaigns health probe.
 *   https://ssdicampaigns.com/api/health
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        const { healthStatus } = await import("../../backend/lib/persist.mjs");
        return Response.json(healthStatus(process.env), { headers: CORS });
      },
    },
  },
});

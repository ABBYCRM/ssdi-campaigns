/**
 * HubSpot-ready intake stub. Does not persist. Deploy separately from the frontend.
 * POST /intake  { name, phone, email, disabilityType, state, zip, message, tcpa, sensitiveHealth, source }
 */
import http from "node:http";

const PORT = Number(process.env.PORT || 8787);

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST,OPTIONS",
  });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return;
  }
  if (req.method === "GET" && req.url === "/health") {
    json(res, 200, { ok: true, crm: "unwired" });
    return;
  }
  if (req.method === "POST" && req.url === "/intake") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    let payload = {};
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    } catch {
      json(res, 400, { ok: false, error: "invalid_json" });
      return;
    }
    if (!payload.name || !payload.phone || payload.tcpa !== true) {
      json(res, 422, { ok: false, error: "validation" });
      return;
    }
    json(res, 202, {
      ok: true,
      id: crypto.randomUUID(),
      forwardedTo: null,
      note: "Accepted and discarded. Attach HubSpot here later.",
    });
    return;
  }
  json(res, 404, { ok: false, error: "not_found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`intake stub listening on ${PORT}`);
});

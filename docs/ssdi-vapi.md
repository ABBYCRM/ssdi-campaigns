# SSDI Vapi inbound intake

Live assistant: **SSDI Campaigns Inbound Intake**  
Assistant id: `c0f5dd63-3c51-4eb6-9f62-8a6e2391c954`  
Phone: `+15616520362`  
Server URL: `https://ssdicampaigns.com/api/vapi/inbound`

## Qualification script (one question at a time)

1. Confirm educational SSDI screening (not SSA).
2. Age / 18+ — under 18: end, do not submit.
3. Duration — lasted or expected ≥12 months (or death)? Clearly no → screen out.
4. Work / SGA (2026) — ~$1,690/mo non-blind, ~$2,830 blind.
5. Work credits (light) — ~20 of last 40 quarters if 31+; 2026 credit ≈ $1,890.
6. Collect name, phone, email, `disabilityType` (broad only), state, ZIP, optional message.
7. Set `sensitiveHealth=true` if any health/disability discussed.
8. TCPA — explicit yes to calls/texts (including automated). No → do not submit.
9. E-SIGN — explicit yes. No → do not submit.
10. Confirm summary → call `submit_ssdi_lead` once.

Never ask for SSN, bank info, or detailed medical records. Never promise approval. Emergencies: 911. Crisis: 988.

## Tool: `submit_ssdi_lead`

Registered on the assistant model. Posts to the same server URL as tool-calls / end-of-call.

Required: `name`, `phone`, `disabilityType`, `state`, `tcpa`, `source` (`vapi-ssdi`).

Optional: `email`, `zip`, `message`, `sensitiveHealth`, `durationLikely12Months`, `workingAboveSga`, `workCreditsLikely`, `esignConsent`.

Backend: `src/routes/api.vapi.inbound.ts` → `backend/lib/vapi-handler.mjs` → `persistIntake` (HubSpot + validator + portal).

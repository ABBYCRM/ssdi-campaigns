import { createServerFn } from "@tanstack/react-start";
import { intakeSchema } from "./form-schema";

/**
 * Intake is intentionally a no-op persist.
 * HubSpot / CRM webhook will be attached here later.
 */
export const submitIntake = createServerFn({ method: "POST" })
  .validator(intakeSchema)
  .handler(async ({ data }) => {
    if (data.hp) {
      return { ok: true as const, id: "ignored" };
    }
    return {
      ok: true as const,
      id: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
    };
  });

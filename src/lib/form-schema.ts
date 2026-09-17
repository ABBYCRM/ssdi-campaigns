import { z } from "zod";
import { DISABILITY_TYPES } from "./site";

export const intakeSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a 10-digit U.S. phone number.")
    .max(20)
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid phone number."),
  email: z.union([z.string().trim().email("Enter a valid email."), z.literal("")]).optional(),
  disabilityType: z.string().min(1, "Select a disability type."),
  state: z.string().min(2, "Select your state."),
  zip: z.string().trim().max(10).optional(),
  message: z.string().trim().max(2000).optional(),
  tcpa: z.boolean().refine((v) => v === true, "Consent is required to be contacted by phone or text."),
  sensitiveHealth: z
    .boolean()
    .refine((v) => v === true, "Please confirm you understand this form collects health-related information."),
  source: z.string().optional(),
  hp: z.string().max(0).optional().or(z.literal("")),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

export const DISABILITY_OPTIONS = DISABILITY_TYPES;

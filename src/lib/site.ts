import { contactPhonePhrase, getPublicPhone } from "./public-phone";

const publicPhone = getPublicPhone();

export const SITE = {
  name: "SSDI Campaigns",
  legalName: "SSDI Campaigns",
  tagline: "Independent help navigating Social Security Disability Insurance.",
  description:
    "Independent SSDI campaign helping people understand eligibility, applications, denials, and appeals. Not affiliated with the U.S. Social Security Administration.",
  url: "https://ssdicampaigns.com",
  domain: "ssdicampaigns.com",
  /** Formatted SSDI Vapi number, or empty until VITE_PUBLIC_PHONE / INBOUND_PHONE_NUMBER is set. */
  phoneDisplay: publicPhone.display,
  phoneTel: publicPhone.tel,
  phoneProvisioned: publicPhone.provisioned,
  /** For legal copy: live number, or "the campaign contact form" before provisioning. */
  phonePhrase: contactPhonePhrase(),
  email: "info@ssdi-campaign-help.org",
  privacyEmail: "privacy@ssdi-campaign-help.org",
  hours: "Monday–Friday, 8:00 a.m. to 8:00 p.m. ET",
  locale: "en_US",
  country: "US",
} as const;

export const NAV = [
  { label: "Home", to: "/" as const },
  { label: "Eligibility", to: "/eligibility" as const },
  { label: "Our Services", to: "/services" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export const RESOURCE_LINKS = [
  { label: "What Is SSDI?", to: "/what-is-ssdi" as const },
  { label: "SSDI vs SSI", to: "/ssdi-vs-ssi" as const },
  { label: "Work Credits", to: "/work-credits" as const },
  { label: "How to Apply", to: "/application" as const },
  { label: "Denials", to: "/denials" as const },
  { label: "Appeals", to: "/appeals" as const },
  { label: "Hearings", to: "/hearings" as const },
  { label: "Blue Book", to: "/blue-book" as const },
  { label: "FAQ", to: "/faq" as const },
  { label: "All 50 States", to: "/states" as const },
];

export const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy" as const },
  { label: "Terms of Use", to: "/terms" as const },
  { label: "Disclaimer", to: "/disclaimer" as const },
  { label: "SMS Terms", to: "/sms-terms" as const },
  { label: "Cookie Policy", to: "/cookies" as const },
  { label: "Accessibility", to: "/accessibility" as const },
  { label: "Do Not Sell or Share", to: "/do-not-sell" as const },
  { label: "Privacy Request", to: "/privacy-request" as const },
];

export const DISABILITY_TYPES = [
  "Musculoskeletal (back, joints, spine)",
  "Mental health (depression, anxiety, PTSD, bipolar)",
  "Neurological (MS, epilepsy, Parkinson's, migraine)",
  "Cardiovascular (heart failure, CAD)",
  "Respiratory (COPD, asthma, sleep apnea)",
  "Cancer",
  "Immune / autoimmune (lupus, RA, HIV)",
  "Diabetes / endocrine",
  "Kidney / genitourinary",
  "Digestive (IBD, liver)",
  "Vision, hearing, or speech",
  "Chronic pain / fibromyalgia",
  "Long COVID / other",
  "Prefer not to say",
] as const;

export const KEYWORDS = [
  "SSDI",
  "Social Security Disability Insurance",
  "SSDI eligibility",
  "SSDI benefits",
  "disability benefits",
  "SSDI application",
  "SSDI appeal",
  "SSDI denial",
  "SSDI hearing",
  "work credits",
  "substantial gainful activity",
  "Blue Book listings",
  "SSA disability",
  "disabled worker benefits",
  "SSDI vs SSI",
  "free SSDI consultation",
  "disability determination",
  "ALJ hearing",
  "reconsideration appeal",
].join(", ");

export const SSA_DISCLAIMER =
  "Independent campaign. Not affiliated with, endorsed by, or authorized by the U.S. Social Security Administration, the Centers for Medicare & Medicaid Services, or the Department of Health and Human Services.";

export const TCPA_CONSENT = `By checking this box, I provide my electronic signature under the E-SIGN Act and give prior express written consent for SSDI Campaigns to contact me at the telephone number I provided, including by live agent, autodialed or prerecorded/artificial voice calls, and SMS/text messages, about SSDI eligibility, applications, and related campaign services. Message and data rates may apply. Message frequency varies. Consent is not a condition of receiving any service. I may opt out of texts by replying STOP and get help by replying HELP. See our Privacy Policy and SMS Terms.`;

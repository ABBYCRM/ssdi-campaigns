import { US_STATES } from "./states.ts";

/**
 * Indexable public pages for sitemap.xml.
 *
 * Static paths follow router file routes and the Primary pages list in
 * public/llms.txt, plus the other public marketing and legal routes that
 * call pageHead. State URLs come from US_STATES (/ssdi/$state).
 *
 * Not listed: /api/*, /intake, /continue, /more-info, admin, portal,
 * validator, /__grok, and asset files.
 */
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/eligibility",
  "/what-is-ssdi",
  "/ssdi-vs-ssi",
  "/work-credits",
  "/application",
  "/denials",
  "/appeals",
  "/hearings",
  "/blue-book",
  "/faq",
  "/services",
  "/states",
  "/privacy",
  "/disclaimer",
  "/about",
  "/contact",
  "/resources",
  "/terms",
  "/sms-terms",
  "/cookies",
  "/accessibility",
  "/do-not-sell",
  "/privacy-request",
] as const;

/** pageHead routes that are public but not marketing/index targets. */
export const SITEMAP_EXCLUDED_PATHS = ["/continue"] as const;

export function sitemapPaths(): string[] {
  return [...SITEMAP_STATIC_PATHS, ...US_STATES.map((state) => `/ssdi/${state.slug}`)];
}

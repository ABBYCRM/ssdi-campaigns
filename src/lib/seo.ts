import { SITE, KEYWORDS } from "./site.ts";

export function pageTitle(title?: string) {
  return title ? `${title} | ${SITE.name}` : `${SITE.name} — SSDI Benefits: Are You Eligible?`;
}

/** Absolute share image already shipped at public/og.jpg (1200×630). */
export const SHARE_IMAGE_URL = `${SITE.url}/og.jpg`;

export function pageHead(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
}) {
  const canonical = `${SITE.url}${opts.path === "/" ? "" : opts.path}`;
  const title = pageTitle(opts.title);
  return {
    meta: [
      { title },
      { name: "description", content: opts.description },
      { name: "keywords", content: opts.keywords ?? KEYWORDS },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "author", content: SITE.name },
      { name: "geo.region", content: "US" },
      { name: "geo.placename", content: "United States" },
      { name: "language", content: "en-US" },
      { name: "rating", content: "general" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { name: "format-detection", content: "telephone=no" },
      { name: "theme-color", content: "#0B2A4A" },
      { name: "apple-mobile-web-app-title", content: SITE.name },
      { property: "og:title", content: title },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: canonical },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SHARE_IMAGE_URL },
      { property: "og:site_name", content: SITE.name },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: opts.description },
      { name: "twitter:image", content: SHARE_IMAGE_URL },
    ],
    links: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hrefLang: "en-US", href: canonical },
      { rel: "alternate", hrefLang: "x-default", href: canonical },
    ],
  };
}

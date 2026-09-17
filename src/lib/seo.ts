import { SITE, KEYWORDS } from "./site";

export function pageTitle(title?: string) {
  return title ? `${title} | ${SITE.name}` : `${SITE.name} — SSDI Benefits: Are You Eligible?`;
}

export function pageHead(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
}) {
  const canonical = `${SITE.url}${opts.path === "/" ? "" : opts.path}`;
  return {
    meta: [
      { title: pageTitle(opts.title) },
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
      { name: "theme-color", content: "#F6EDD8" },
      { name: "apple-mobile-web-app-title", content: SITE.name },
    ],
    links: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hrefLang: "en-US", href: canonical },
      { rel: "alternate", hrefLang: "x-default", href: canonical },
    ],
  };
}

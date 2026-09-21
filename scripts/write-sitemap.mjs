/**
 * Write public/sitemap.xml from the indexable route list.
 * Run: node --experimental-strip-types scripts/write-sitemap.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sitemapPaths } from "../src/lib/sitemap-paths.ts";

const SITE_ORIGIN = "https://ssdicampaigns.com";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** ISO date for this sitemap revision (W3C date, YYYY-MM-DD). */
export const SITEMAP_LASTMOD = "2026-09-21";

export function sitemapLoc(path) {
  return `${SITE_ORIGIN}${path === "/" ? "" : path}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderSitemap(paths, lastmod = SITEMAP_LASTMOD) {
  const body = paths
    .map(
      (path) =>
        `  <url>\n    <loc>${escapeXml(sitemapLoc(path))}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const xml = renderSitemap(sitemapPaths());
const out = join(root, "public/sitemap.xml");
writeFileSync(out, xml);
console.log(`wrote ${out} (${sitemapPaths().length} urls)`);

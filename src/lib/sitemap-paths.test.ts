import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { US_STATES } from "./states.ts";
import { SITEMAP_EXCLUDED_PATHS, SITEMAP_STATIC_PATHS, sitemapPaths } from "./sitemap-paths.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function routePathFromFile(file: string): string | null {
  if (file === "index.tsx") return "/";
  if (file.includes("$") || file.startsWith("api.")) return null;
  const base = file.replace(/\.(tsx|ts)$/, "");
  return `/${base}`;
}

describe("sitemap paths", () => {
  it("lists every public pageHead route except the continue enrichment form", () => {
    const files = readdirSync(join(root, "src/routes"));
    const pageHeadPaths: string[] = [];
    for (const file of files) {
      const source = readFileSync(join(root, "src/routes", file), "utf8");
      if (!source.includes("pageHead")) continue;
      const path = routePathFromFile(file);
      if (path) pageHeadPaths.push(path);
    }

    assert.ok(pageHeadPaths.includes("/"));
    assert.ok(pageHeadPaths.includes("/continue"));
    for (const path of pageHeadPaths) {
      if ((SITEMAP_EXCLUDED_PATHS as readonly string[]).includes(path)) {
        assert.equal(sitemapPaths().includes(path), false, path);
      } else {
        assert.equal(sitemapPaths().includes(path), true, path);
      }
    }
  });

  it("includes llms.txt primary pages and every state route", () => {
    const llms = readFileSync(join(root, "public/llms.txt"), "utf8");
    const primary = [...llms.matchAll(/https:\/\/ssdicampaigns\.com(\/[a-z0-9/-]*)/g)].map(
      (match) => (match[1] === "" ? "/" : match[1]),
    );
    assert.ok(primary.includes("/"));
    assert.ok(primary.includes("/states"));
    for (const path of primary) {
      assert.equal((SITEMAP_STATIC_PATHS as readonly string[]).includes(path), true, path);
    }
    for (const state of US_STATES) {
      assert.equal(sitemapPaths().includes(`/ssdi/${state.slug}`), true, state.slug);
    }
    assert.equal(US_STATES.length, 51);
  });

  it("omits API, intake, admin, portal, validator, and grok assets", () => {
    const paths = sitemapPaths();
    for (const path of paths) {
      assert.equal(path.startsWith("/api"), false, path);
      assert.equal(path.includes("__grok"), false, path);
      assert.equal(path.startsWith("/admin"), false, path);
      assert.equal(path.startsWith("/portal"), false, path);
      assert.equal(path.startsWith("/validator"), false, path);
    }
    for (const blocked of ["/intake", "/continue", "/more-info", "/api/intake", "/api/health"]) {
      assert.equal(paths.includes(blocked), false);
    }
  });

  it("matches the committed public/sitemap.xml", () => {
    const xml = readFileSync(join(root, "public/sitemap.xml"), "utf8");
    assert.equal(xml.startsWith("<?xml"), true);
    assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    const expected = sitemapPaths().map((path) =>
      path === "/" ? "https://ssdicampaigns.com" : `https://ssdicampaigns.com${path}`,
    );
    assert.deepEqual(locs, expected);
    const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
    assert.equal(lastmods.length, expected.length);
    for (const lastmod of lastmods) {
      assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pageHead, pageTitle, SHARE_IMAGE_URL } from "./seo.ts";

const HOME_DESCRIPTION =
  "Independent SSDI campaign helping you navigate Social Security Disability Insurance eligibility, applications, denials, and appeals. Free consultation. Not affiliated with SSA.";

describe("pageHead share tags", () => {
  it("reuses the existing home title and description for Open Graph and Twitter", () => {
    const title = pageTitle("SSDI Benefits: Are You Eligible?");
    assert.equal(title, "SSDI Benefits: Are You Eligible? | SSDI Campaigns");
    assert.equal(SHARE_IMAGE_URL, "https://ssdicampaigns.com/og.jpg");

    const head = pageHead({
      title: "SSDI Benefits: Are You Eligible?",
      description: HOME_DESCRIPTION,
      path: "/",
    });

    const byKey = new Map<string, string>();
    for (const entry of head.meta) {
      if ("property" in entry && entry.property) byKey.set(entry.property, entry.content);
      if ("name" in entry && entry.name) byKey.set(entry.name, entry.content);
      if ("title" in entry && entry.title) byKey.set("title", entry.title);
    }

    assert.equal(byKey.get("title"), title);
    assert.equal(byKey.get("description"), HOME_DESCRIPTION);
    assert.equal(byKey.get("og:title"), title);
    assert.equal(byKey.get("og:description"), HOME_DESCRIPTION);
    assert.equal(byKey.get("og:url"), "https://ssdicampaigns.com");
    assert.equal(byKey.get("og:type"), "website");
    assert.equal(byKey.get("og:image"), SHARE_IMAGE_URL);
    assert.equal(byKey.get("og:site_name"), "SSDI Campaigns");
    assert.equal(byKey.get("twitter:card"), "summary_large_image");
    assert.equal(byKey.get("twitter:title"), title);
    assert.equal(byKey.get("twitter:description"), HOME_DESCRIPTION);
    assert.equal(byKey.get("twitter:image"), SHARE_IMAGE_URL);
    assert.equal(
      head.links.find((link) => link.rel === "canonical")?.href,
      "https://ssdicampaigns.com",
    );
  });

  it("sets og:url to the page canonical", () => {
    const head = pageHead({
      title: "SSDI Benefits in Florida",
      description: "SSDI eligibility for Florida residents.",
      path: "/ssdi/florida",
    });
    const ogUrl = head.meta.find((entry) => "property" in entry && entry.property === "og:url");
    assert.ok(ogUrl && "content" in ogUrl);
    assert.equal(ogUrl.content, "https://ssdicampaigns.com/ssdi/florida");
  });
});

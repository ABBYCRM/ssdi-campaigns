import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/do-not-sell")({
  head: () =>
    pageHead({
      title: "Do Not Sell or Share My Personal Information",
      description: "Opt out of sale and sharing of personal information under CCPA/CPRA and other state privacy laws.",
      path: "/do-not-sell",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Your privacy choices"
        title="Do not sell or share"
        lede="We do not sell personal information for money. Some laws still treat lead referrals or advertising as a “sale” or “share.” Use this page to opt out."
        cta={false}
      />
      <article className="container-page max-w-3xl space-y-4 py-14 text-sm leading-relaxed text-muted">
        <p>
          Submit a request on the{" "}
          <Link to="/privacy-request" className="font-semibold text-navy underline">
            privacy request form
          </Link>{" "}
          and choose “Opt out of sale/share,” or email {SITE.privacyEmail} with the subject “Do Not Sell or Share.” We also
          treat a GPC signal as an opt-out for that browser.
        </p>
        <p>
          Opting out does not delete your screening file or revoke TCPA consent for calls you already authorized. You can
          revoke those separately (STOP for texts, or tell us orally/in writing for calls).
        </p>
        <Button asChild variant="teal">
          <Link to="/privacy-request">File a privacy request</Link>
        </Button>
      </article>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCta } from "@/components/layout/inline-cta";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { SSA_DISCLAIMER } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About SSDI Campaigns",
      description:
        "SSDI Campaigns is an independent private campaign that helps people understand Social Security Disability Insurance. Not a law firm. Not SSA.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main id="main">
      <PageHero
        kicker="About us"
        title="An independent SSDI campaign"
        lede="We exist to translate dense federal disability rules into plain language and to help people who are stuck — denied, overwhelmed, or unsure whether they even have enough work credits."
      />
      <div className="container-page grid gap-10 py-14 lg:grid-cols-2">
        <article className="space-y-4 text-muted leading-relaxed">
          <p>
            SSDI Campaigns is a privately operated public-education and case-assistance campaign serving all 50 states and
            the District of Columbia. We are not a government agency, not a law firm, and not a substitute for SSA or for
            licensed legal advice.
          </p>
          <p>
            Why a “campaign”? Because SSDI is one of the most misunderstood federal programs. People confuse it with SSI,
            with workers’ compensation, and with short-term disability. Initial denial rates are high. Appeal deadlines are
            short. Medical proof is technical. We try to close that gap.
          </p>
          <InlineCta title="Talk with this campaign" />
          <p>
            When a claim needs an appointed representative, we may introduce you to SSA-registered attorneys or eligible
            non-attorney representatives. You decide whether to appoint anyone. SSA still adjudicates the claim.
          </p>
          <p className="rounded-lg border border-border bg-sky p-4 text-sm text-navy">{SSA_DISCLAIMER}</p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <Button asChild variant="coral" className="min-h-11">
              <Link to="/contact">Talk with us</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link to="/eligibility">Check eligibility</Link>
            </Button>
          </div>
        </article>
        <img
          src="/images/consult.jpg"
          alt="Campaign specialist reviewing an SSDI file with claimants"
          className="h-56 w-full rounded-xl object-cover shadow-soft sm:h-72 lg:h-80"
          width={1792}
          height={1008}
        />
      </div>
    </main>
  );
}

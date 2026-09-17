import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: "Terms of Use",
      description: "Terms of use for SSDI Campaigns — independent campaign, not SSA, not a law firm, no guaranteed benefits.",
      path: "/terms",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero kicker="Legal" title="Terms of use" lede="Effective September 16, 2026. By using this site you agree to these terms." />
      <article className="container-page max-w-3xl space-y-5 py-14 text-sm leading-relaxed text-muted">
        <p>
          The site is operated by {SITE.legalName} for educational and campaign-intake purposes. It does not create a
          lawyer-client, fiduciary, or SSA-representative relationship unless you later sign SSA Form 1696 with a specific
          person.
        </p>
        <p>
          Information is general. SSDI outcomes depend on your record and SSA’s decision. We do not guarantee approval,
          payment amounts, or timelines. SSA figures cited (work credits, SGA, averages) change annually.
        </p>
        <p>
          You agree not to submit false information, not to use the site to harass, and not to scrape in a way that degrades
          service. Form submissions are optional. Using this campaign is independent of any other filing you may make.
        </p>
        <p>
          THE SITE IS PROVIDED “AS IS.” TO THE MAXIMUM EXTENT PERMITTED BY LAW WE DISCLAIM IMPLIED WARRANTIES. OUR
          AGGREGATE LIABILITY FOR CLAIMS ARISING OUT OF THE SITE SHALL NOT EXCEED $100. SOME STATES DO NOT ALLOW CERTAIN
          LIMITATIONS — IN THOSE STATES OUR LIABILITY IS LIMITED TO THE FULLEST EXTENT PERMITTED.
        </p>
        <p>
          These terms are governed by the laws of the United States and the state of your residence for consumer-protection
          claims, without prejudice to SSA’s exclusive jurisdiction over Title II determinations (42 U.S.C. § 405(g)–(h)).
        </p>
        <p>
          See also our <Link to="/disclaimer" className="font-semibold text-navy underline">Disclaimer</Link>,{" "}
          <Link to="/privacy" className="font-semibold text-navy underline">Privacy Policy</Link>, and{" "}
          <Link to="/sms-terms" className="font-semibold text-navy underline">SMS Terms</Link>.
        </p>
      </article>
    </main>
  );
}

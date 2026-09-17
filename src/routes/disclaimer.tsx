import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { SSA_DISCLAIMER } from "@/lib/site";

export const Route = createFileRoute("/disclaimer")({
  head: () =>
    pageHead({
      title: "Legal Disclaimer",
      description: SSA_DISCLAIMER,
      path: "/disclaimer",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero kicker="Legal" title="Disclaimer" lede="Please read this before using the site or submitting a form." />
      <article className="container-page max-w-3xl space-y-4 py-14 text-sm leading-relaxed text-muted">
        <p className="rounded-lg border border-border bg-sky p-4 font-medium text-navy">{SSA_DISCLAIMER}</p>
        <p>
          Social Security Act § 1140 prohibits using words, letters, symbols, or emblems in a way that conveys a false
          impression of SSA, CMS, or HHS approval. A disclaimer does not cure a misleading presentation — so we do not use
          the SSA eagle, the color combination of official SSA notices as a brand system, or government seals.
        </p>
        <p>
          SSA must also disclose when someone offers, for a fee, a service SSA provides free. Taking a disability
          application is free. This campaign’s screening is free. Representative fees, if any, are separate, contingent,
          and SSA-approved.
        </p>
        <p>
          Nothing on this site is legal, medical, or tax advice. Past results of other claimants are not yours. State DDS
          names are used descriptively.
        </p>
      </article>
    </main>
  );
}

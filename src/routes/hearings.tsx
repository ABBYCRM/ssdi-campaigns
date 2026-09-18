import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCta } from "@/components/layout/inline-cta";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/hearings")({
  head: () =>
    pageHead({
      title: "SSDI ALJ Hearings",
      description:
        "What happens at a Social Security disability hearing before an Administrative Law Judge, who may represent you, and how fees are approved.",
      path: "/hearings",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Office of Hearings Operations"
        title="The SSDI disability hearing"
        lede="The ALJ hearing is often the first time a decision-maker hears you describe a workday. Approval rates are historically higher here than at reconsideration — still never guaranteed."
      />
      <article className="container-page max-w-3xl space-y-5 py-14 text-muted leading-relaxed">
        <p>
          Hearings may be by video, phone, or in person. The judge may call a vocational expert and sometimes a medical
          expert. You (or your representative) can question those experts. New evidence generally must be submitted at
          least five business days before the hearing unless an exception applies.
        </p>
        <InlineCta title="Heading toward a hearing?" />
        <h2 className="text-2xl font-extrabold text-navy">Who may represent you</h2>
        <p>
          Under 20 CFR § 404.1705 you may appoint an attorney in good standing or a qualified non-attorney representative.
          Representatives must register with SSA and follow 20 CFR § 404.1740 (no misleading claimants, no unauthorized
          fees, competent representation). This campaign is not automatically your representative.
        </p>
        <h2 className="text-2xl font-extrabold text-navy">Fees</h2>
        <p>
          Direct payment of representative fees from past-due benefits requires SSA approval and is subject to the statutory
          cap. You should never pay an upfront “percentage of future monthly checks” that SSA has not authorized.
        </p>
        <Link to="/contact" className="inline-block font-semibold text-teal-dark hover:underline">
          Ask about a hearing-stage referral
        </Link>
      </article>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { FIGURES_2026 } from "@/lib/ssdi";

export const Route = createFileRoute("/what-is-ssdi")({
  head: () =>
    pageHead({
      title: "What Is SSDI? Social Security Disability Insurance Explained",
      description:
        "SSDI is federal disability insurance you earn through FICA taxes. 2026 average disabled-worker benefit about $1,633. Five-month wait. Medicare after 24 months.",
      path: "/what-is-ssdi",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="SSDI basics"
        title="What is Social Security Disability Insurance?"
        lede="SSDI is not welfare. It is insurance you (and your employers) paid for through Social Security taxes on covered earnings."
      />
      <article className="container-page max-w-3xl space-y-6 py-14 text-muted leading-relaxed">
        <p>
          Title II of the Social Security Act creates Old-Age, Survivors, and Disability Insurance (OASDI). The disability
          portion — SSDI — pays monthly cash benefits to insured workers who meet SSA’s definition of disability, and in
          some cases to eligible spouses and children.
        </p>
        <p>
          In January 2026 SSA paid about $12.1 billion to roughly 8.1 million SSDI beneficiaries, including about{" "}
          {FIGURES_2026.disabledWorkersMillions} million disabled workers whose average benefit was ${FIGURES_2026.avgWorkerBenefit.toLocaleString()}{" "}
          a month (Congressional Research Service / SSA Monthly Statistical Snapshot).
        </p>
        <h2 className="text-2xl font-extrabold text-navy">How the check is calculated</h2>
        <p>
          Your benefit starts from your Average Indexed Monthly Earnings and Primary Insurance Amount — the same family of
          formulas used for retirement. It is not a flat national amount and it is not means-tested the way SSI is.
        </p>
        <h2 className="text-2xl font-extrabold text-navy">Waiting period and Medicare</h2>
        <p>
          Benefits generally begin after five full calendar months from the established onset date (ALS is excepted). SSA
          pays one month behind. Medicare usually starts after 24 months of SSDI entitlement.
        </p>
        <h2 className="text-2xl font-extrabold text-navy">Continuing disability reviews</h2>
        <p>
          If improvement is expected, SSA may review in 6–18 months; if possible, about every 3 years; if not expected,
          about every 7 years. Work activity, medical recovery, or failing to cooperate can stop benefits.
        </p>
        <p>
          This page is educational. For a screening, request a free consultation — this campaign does not issue benefits.
        </p>
        <Link to="/eligibility" className="inline-block font-semibold text-teal-dark hover:underline">
          See 2026 eligibility rules
        </Link>
      </article>
    </main>
  );
}

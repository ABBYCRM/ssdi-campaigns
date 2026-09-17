import { createFileRoute, Link } from "@tanstack/react-router";
import { IntakeForm } from "@/components/forms/intake-form";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { FIVE_STEPS, FIGURES_2026, WORK_CREDIT_TABLE } from "@/lib/ssdi";

export const Route = createFileRoute("/eligibility")({
  head: () =>
    pageHead({
      title: "SSDI Eligibility Requirements 2026",
      description:
        "SSDI eligibility: 2026 work credits ($1,890 each), 20/40 rule, SGA of $1,690/$2,830, 12-month duration, and SSA’s five-step sequential evaluation.",
      path: "/eligibility",
      keywords:
        "SSDI eligibility, work credits 2026, 20/40 rule, substantial gainful activity, five-step sequential evaluation, SSA disability definition",
    }),
  component: EligibilityPage,
});

function EligibilityPage() {
  return (
    <main id="main">
      <PageHero
        kicker="Federal rules"
        title="Are you eligible for SSDI?"
        lede="SSA uses a strict statutory definition of disability plus a work-credit test. This page summarizes the 2026 figures so you can see whether a claim is even possible — it is not a determination."
      />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_20rem]">
        <article className="max-w-3xl space-y-10">
          <section>
            <h2 className="text-2xl font-extrabold text-navy">Two independent tests</h2>
            <p className="mt-3 text-muted leading-relaxed">
              To qualify for Social Security Disability Insurance you must (1) be insured for disability — enough work
              credits, earned recently enough — and (2) meet the Social Security Act’s definition of disability. You must
              also be under full retirement age and file an application. See{" "}
              <a className="font-semibold text-navy underline" href={SITE.ssaQualify} target="_blank" rel="noopener noreferrer">
                SSA’s official qualification page
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-navy">2026 work credits</h2>
            <p className="mt-3 text-muted leading-relaxed">
              You earn one Social Security credit for each ${FIGURES_2026.workCredit.toLocaleString()} in covered wages or
              self-employment income, up to four credits per year (${FIGURES_2026.maxCreditsEarnings.toLocaleString()}). Most
              workers age 31 or older must satisfy the 20/40 rule: 20 credits in the 10 years ending with the year disability
              began, plus a lifetime duration-of-work test that rises with age (40 credits / 10 years at 62).
            </p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-sky text-navy">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Age at onset</th>
                    <th className="px-4 py-3 font-semibold">Credits generally needed</th>
                    <th className="px-4 py-3 font-semibold">Work</th>
                  </tr>
                </thead>
                <tbody>
                  {WORK_CREDIT_TABLE.map((row) => (
                    <tr key={row.age} className="border-t border-border">
                      <td className="px-4 py-2.5">{row.age}</td>
                      <td className="px-4 py-2.5">{row.credits}</td>
                      <td className="px-4 py-2.5">{row.years}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">
              SSA tables are estimates and do not cover every situation. Statutory blindness has no recent-work test.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-navy">The medical standard</h2>
            <p className="mt-3 text-muted leading-relaxed">
              SSA pays only for total disability. You must be unable to engage in substantial gainful activity because of a
              medically determinable impairment expected to last at least 12 months or result in death. 2026 SGA: $
              {FIGURES_2026.sgaNonBlind.toLocaleString()} per month, or ${FIGURES_2026.sgaBlind.toLocaleString()} if you are
              statutorily blind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-navy">Five-step sequential evaluation</h2>
            <ol className="mt-5 space-y-4">
              {FIVE_STEPS.map((s) => (
                <li key={s.step} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-dark">Step {s.step}</p>
                  <h3 className="mt-1 text-lg font-bold text-navy">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-navy">What this campaign does not do</h2>
            <p className="mt-3 text-muted leading-relaxed">
              We cannot declare you disabled, bind SSA, or promise a monthly amount. Your Primary Insurance Amount is
              computed from your lifetime earnings record. File for free at SSA.gov even if you never speak with us.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="coral">
                <Link to="/contact">Request a free screening</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/work-credits">Work-credit guide</Link>
              </Button>
            </div>
          </section>
        </article>
        <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-soft lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-navy">Quick screening</h2>
          <p className="mt-1 mb-4 text-sm text-muted">Not an SSA application.</p>
          <IntakeForm compact source="eligibility-aside" />
        </aside>
      </div>
    </main>
  );
}

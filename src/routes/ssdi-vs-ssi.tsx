import { createFileRoute } from "@tanstack/react-router";
import { InlineCta } from "@/components/layout/inline-cta";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/ssdi-vs-ssi")({
  head: () =>
    pageHead({
      title: "SSDI vs SSI — What’s the Difference?",
      description:
        "SSDI is work-credit insurance. SSI is needs-based (Title XVI) with strict income and resource limits. Medical rules are similar; money rules are not.",
      path: "/ssdi-vs-ssi",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Compare programs"
        title="SSDI vs SSI"
        lede="People mix these up constantly. The medical standard is largely the same. Everything about how you qualify financially is not."
      />
      <article className="container-page max-w-3xl py-14">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-sky text-navy">
              <tr>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">SSDI (Title II)</th>
                <th className="px-4 py-3">SSI (Title XVI)</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {[
                ["What it is", "Earned insurance from FICA-covered work", "Needs-based cash assistance"],
                ["Work credits", "Required (age-based + recent work)", "Not required"],
                ["Income / resources", "Not means-tested (other benefits may offset)", "Strict limits on income and resources"],
                ["Payment amount", "Based on your earnings record", "Federal benefit rate minus countable income"],
                ["Medicare / Medicaid", "Medicare after 24 months of entitlement (with exceptions)", "Medicaid in most states immediately"],
                ["Waiting period", "Five months (ALS excepted)", "None"],
                ["Who may also qualify", "Some spouses and children of the worker", "Aged, blind, or disabled with low resources"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold text-navy">{row[0]}</td>
                  <td className="px-4 py-3">{row[1]}</td>
                  <td className="px-4 py-3">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <InlineCta title="Need help telling SSDI from SSI?" />
        </div>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Some people receive both (“concurrent” benefits) if their SSDI check is low and they still meet SSI resource
          rules. SSA can take both applications on one visit. This campaign focuses on SSDI but will flag obvious SSI issues
          during screening.
        </p>
      </article>
    </main>
  );
}

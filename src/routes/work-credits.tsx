import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { FIGURES_2026, WORK_CREDIT_TABLE } from "@/lib/ssdi";

export const Route = createFileRoute("/work-credits")({
  head: () =>
    pageHead({
      title: "SSDI Work Credits and the 20/40 Rule (2026)",
      description:
        "2026 SSDI work credits: $1,890 each, $7,560 for four credits. Recent-work test and duration-of-work test explained, including the 20/40 rule.",
      path: "/work-credits",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Insured status"
        title="Work credits for SSDI"
        lede={`In 2026 you earn one credit per $${FIGURES_2026.workCredit.toLocaleString()} of covered earnings, up to four credits ($${FIGURES_2026.maxCreditsEarnings.toLocaleString()}). Credits do not “expire” for retirement, but SSDI has a recent-work test.`}
      />
      <article className="container-page max-w-3xl space-y-6 py-14 text-muted leading-relaxed">
        <h2 className="text-2xl font-extrabold text-navy">Recent work vs duration of work</h2>
        <p>
          SSA applies two tests. The recent-work test looks at credits just before onset (for most people 31+, 20 credits in
          the last 10 years — the 20/40 rule). The duration-of-work test looks at lifetime credits, which increase with age
          until 40 credits. Your date last insured (DLI) is the last day you still meet the recent-work test. Onset after
          DLI generally means no SSDI (SSI may still be possible).
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-sky text-navy">
              <tr>
                <th className="px-4 py-3">Age at onset</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Work</th>
              </tr>
            </thead>
            <tbody>
              {WORK_CREDIT_TABLE.map((row) => (
                <tr key={row.age} className="border-t border-border">
                  <td className="px-4 py-2.5 text-navy">{row.age}</td>
                  <td className="px-4 py-2.5">{row.credits}</td>
                  <td className="px-4 py-2.5">{row.years}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Credits are earned through covered wages or self-employment. Your date last insured is the last day you still
          meet the recent-work test.
        </p>
      </article>
    </main>
  );
}

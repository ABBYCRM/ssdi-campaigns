import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { APPEAL_LEVELS, FIGURES_2026 } from "@/lib/ssdi";

export const Route = createFileRoute("/appeals")({
  head: () =>
    pageHead({
      title: "SSDI Appeals: Reconsideration, ALJ, Appeals Council, Court",
      description:
        "Four SSDI appeal levels, 60-day deadlines, and 2026 processing times for reconsideration and hearings. Independent campaign — not SSA.",
      path: "/appeals",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Appeals"
        title="How an SSDI appeal works"
        lede={`You generally have ${FIGURES_2026.appealDays} days from the date you receive a decision to appeal to the next level. SSA presumes you received the notice five days after the date on it.`}
      />
      <div className="container-page grid gap-5 py-14 md:grid-cols-2">
        {APPEAL_LEVELS.map((lvl, i) => (
          <article key={lvl.title} className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-dark">Level {i + 1}</p>
            <h2 className="mt-1 text-xl font-extrabold text-navy">{lvl.title}</h2>
            <p className="mt-2 text-sm font-semibold text-navy">{lvl.timing}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{lvl.body}</p>
          </article>
        ))}
      </div>
      <p className="container-page max-w-3xl pb-16 text-sm text-muted">
        You can appeal online at SSA.gov. This campaign can help you understand the record and connect you with a
        representative for a hearing.{" "}
        <Link to="/hearings" className="font-semibold text-teal-dark hover:underline">
          Hearings explained
        </Link>
      </p>
    </main>
  );
}

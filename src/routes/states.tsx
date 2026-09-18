import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { US_STATES } from "@/lib/states";

export const Route = createFileRoute("/states")({
  head: () =>
    pageHead({
      title: "SSDI Help in All 50 States",
      description:
        "SSDI is federal, but Disability Determination Services is state-run. Find SSDI campaign information for every U.S. state and D.C.",
      path: "/states",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Local + federal"
        title="SSDI in every state"
        lede="The medical and work-credit rules are national. The agency that first reads your medical file is your state’s Disability Determination Service. Pick your state for a localized briefing."
      />
      <div className="container-page grid grid-cols-2 gap-2 py-14 sm:grid-cols-3 md:grid-cols-4">
        {US_STATES.map((s) => (
          <Link
            key={s.slug}
            to="/ssdi/$state"
            params={{ state: s.slug }}
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-3 py-3 text-sm font-semibold text-navy hover:border-teal hover:bg-sky"
          >
            {s.name}
          </Link>
        ))}
      </div>
    </main>
  );
}

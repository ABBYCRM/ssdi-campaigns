import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { RESOURCE_LINKS } from "@/lib/site";

export const Route = createFileRoute("/resources")({
  head: () =>
    pageHead({
      title: "SSDI Resource Guides",
      description: "Guides on SSDI eligibility, work credits, applications, denials, appeals, hearings, and the Blue Book.",
      path: "/resources",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Library"
        title="SSDI resource guides"
        lede="Educational explainers written from SSA publications and the Code of Federal Regulations. Not legal advice."
      />
      <div className="container-page grid gap-3 py-14 sm:grid-cols-2 md:grid-cols-3">
        {RESOURCE_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="rounded-xl border border-border bg-card px-5 py-6 font-semibold text-navy hover:border-teal hover:bg-sky"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </main>
  );
}

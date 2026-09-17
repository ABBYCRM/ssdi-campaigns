import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { IntakeForm } from "@/components/forms/intake-form";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { getState } from "@/lib/states";
import { FIGURES_2026 } from "@/lib/ssdi";

export const Route = createFileRoute("/ssdi/$state")({
  loader: ({ params }) => {
    const state = getState(params.state);
    if (!state) throw notFound();
    return { state };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.state.name ?? "Your State";
    return pageHead({
      title: `SSDI Benefits in ${name}`,
      description: `SSDI eligibility, ${name} Disability Determination Services, 2026 work credits and SGA, and free campaign screening for ${name} residents. Not affiliated with SSA.`,
      path: `/ssdi/${loaderData?.state.slug ?? ""}`,
      keywords: `SSDI ${name}, Social Security Disability ${name}, ${name} DDS, disability benefits ${name}, SSDI application ${name}`,
    });
  },
  component: StatePage,
});

function StatePage() {
  const { state } = Route.useLoaderData();
  return (
    <main id="main">
      <PageHero
        kicker={`${state.abbr} · United States`}
        title={`SSDI help in ${state.name}`}
        lede={`Social Security Disability Insurance is a federal program. If you live in ${state.name}, ${state.dds} usually makes the first medical decision on SSA’s behalf.`}
      />
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_20rem]">
        <article className="max-w-3xl space-y-5 text-muted leading-relaxed">
          <p>{state.note}</p>
          <h2 className="text-2xl font-extrabold text-navy">What does not change by state</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Work-credit amounts and the 20/40 rule (2026: ${FIGURES_2026.workCredit.toLocaleString()} per credit).</li>
            <li>
              SGA: ${FIGURES_2026.sgaNonBlind.toLocaleString()}/month non-blind; ${FIGURES_2026.sgaBlind.toLocaleString()} if
              statutorily blind.
            </li>
            <li>Five-step sequential evaluation and the Blue Book listings.</li>
            <li>Five-month waiting period and 24-month Medicare clock (with statutory exceptions).</li>
            <li>60-day appeal deadlines.</li>
          </ul>
          <h2 className="text-2xl font-extrabold text-navy">What does change</h2>
          <p>
            DDS staffing, consultative-exam vendors, hearing-office wait times, and which local clinics SSA already knows.
            Privacy and call-recording rules also vary — see our{" "}
            <Link to="/privacy" className="font-semibold text-navy underline">
              50-state privacy policy
            </Link>
            .
          </p>
          <p>
            You can apply from {state.name} at no charge on SSA.gov. This page is geo-targeted educational content, not a
            state government service.
          </p>
        </article>
        <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-bold text-navy">{state.abbr} screening</h2>
          <p className="mt-1 mb-4 text-sm text-muted">Independent campaign form.</p>
          <IntakeForm compact source={`state-${state.slug}`} />
        </aside>
      </div>
    </main>
  );
}

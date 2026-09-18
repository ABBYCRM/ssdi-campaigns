import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCta } from "@/components/layout/inline-cta";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { FIGURES_2026 } from "@/lib/ssdi";

export const Route = createFileRoute("/application")({
  head: () =>
    pageHead({
      title: "How to Apply for SSDI",
      description:
        "How to file an SSDI application, what medical and work evidence to gather, and typical 2026 processing times.",
      path: "/application",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Filing"
        title="How to apply for SSDI"
        lede="You can file your own SSDI claim at no charge. A campaign can help you prepare. It cannot file as if it were SSA."
      />
      <article className="container-page max-w-3xl space-y-5 py-14 text-muted leading-relaxed">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="text-navy">Protect a filing date.</strong> Apply with SSA online, by phone, or at a field
            office. The protective filing date can affect back pay. This campaign can help you get the file ready.
          </li>
          <li>
            <strong className="text-navy">List every medical source.</strong> Doctors, clinics, hospitals, therapists, VA,
            IHS. SSA cannot consider evidence it does not have.
          </li>
          <li>
            <strong className="text-navy">Work history for 15 years.</strong> Job titles, physical and mental demands, dates,
            and whether you used special accommodations.
          </li>
          <li>
            <strong className="text-navy">Function, not just diagnoses.</strong> What you can do in a competitive workday
            matters more than a label.
          </li>
        </ol>
        <InlineCta title="Want help getting the file ready?" />
        <p>
          Mid-2026 initial decisions averaged about {FIGURES_2026.initialDecisionDays} days. That is not a deadline and not a
          guarantee. After you apply, respond to SSA and DDS requests quickly — silence is a common reason for denial.
        </p>
        <Link to="/contact" className="inline-block font-semibold text-teal-dark hover:underline">
          Request application-prep help
        </Link>
      </article>
    </main>
  );
}

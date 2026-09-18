import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCta } from "@/components/layout/inline-cta";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { SERVICES } from "@/lib/ssdi";

export const Route = createFileRoute("/services")({
  head: () =>
    pageHead({
      title: "SSDI Campaign Services",
      description:
        "Free SSDI consultation, case assessment, document preparation, and connections to SSA-appointed hearing representatives. Independent campaign — not a law firm.",
      path: "/services",
    }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <main id="main">
      <PageHero
        kicker="Our services"
        title="How this campaign helps"
        lede="We educate, screen, and organize. SSA still decides every claim. This campaign’s screening is always free."
      />
      <div className="container-page grid gap-6 py-14 md:grid-cols-2">
        {SERVICES.map((s, i) => (
          <article key={s.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-dark">0{i + 1}</p>
            <h2 className="mt-2 text-xl font-extrabold text-navy">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
          </article>
        ))}
      </div>
      <div className="container-page pb-6">
        <InlineCta title="Ready for a free campaign screening?" />
      </div>
      <section className="container-page max-w-3xl pb-16">
        <h2 className="text-2xl font-extrabold text-navy">Fees and representation</h2>
        <p className="mt-3 text-muted leading-relaxed">
          Completing this campaign’s screening form is free. SSA-appointed representatives (attorneys or eligible
          non-attorneys under 20 CFR § 404.1705) may charge a fee only if SSA or a court approves it, typically a
          contingency of past-due benefits subject to SSA’s cap. We do not keep a percentage of your monthly check. You
          appoint a representative with Form SSA-1696. See 20 CFR §§ 404.1700–404.1740 for conduct and fee rules.
        </p>
        <p className="mt-3 text-muted leading-relaxed">
          Social Security Act § 1140 requires us to say, clearly: this campaign is independent. We do not issue benefits
          or replace SSA. Completing this screening is free and never required to pursue a claim.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild variant="coral" className="min-h-11">
            <Link to="/contact">Start a free consultation</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/hearings">About hearings</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

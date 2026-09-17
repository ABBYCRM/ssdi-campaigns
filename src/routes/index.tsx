import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Banknote,
  BriefcaseMedical,
  Check,
  ClipboardList,
  Megaphone,
  Puzzle,
} from "lucide-react";
import { IntakeForm } from "@/components/forms/intake-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { FAQS, FIGURES_2026, SERVICES } from "@/lib/ssdi";
import { HERO_IMG } from "@/lib/hero-img";
import { CONSULT_IMG } from "@/lib/consult-img";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "SSDI Benefits: Are You Eligible?",
      description:
        "Independent SSDI campaign helping you navigate Social Security Disability Insurance eligibility, applications, denials, and appeals. Free consultation. Not affiliated with SSA.",
      path: "/",
    }),
  component: Home,
});

function Home() {
  return (
    <main id="main">
      <section className="relative overflow-hidden bg-sky" aria-label="Campaign hero">
        <img
          src={HERO_IMG}
          alt="A couple meeting with an SSDI campaign advisor in front of a city skyline"
          className="mx-auto h-auto w-full max-w-5xl object-contain object-bottom"
          width={1792}
          height={1008}
        />
      </section>

      <section className="bg-card px-4 pb-4 pt-8 text-center md:pt-10">
        <h1 className="text-[1.65rem] font-extrabold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
          <span className="text-red">SSDI Benefits:</span>{" "}
          <span className="text-navy">Are You Eligible?</span>
        </h1>
        <p className="mt-3 text-base font-bold uppercase tracking-[0.04em] text-navy sm:text-xl md:text-2xl">
          Our campaign helps you navigate the process.
        </p>
      </section>

      <section className="bg-card px-4 py-10">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <IconBubble>
                <Banknote className="size-6 text-teal" />
              </IconBubble>
              <IconBubble>
                <BriefcaseMedical className="size-6 text-red" />
              </IconBubble>
              <h2 className="text-2xl font-extrabold tracking-tight text-navy">What is SSDI?</h2>
            </div>
            <ul className="ml-1 list-disc space-y-1.5 pl-5 text-ink">
              <li>Monthly payments</li>
              <li>Federal insurance program</li>
              <li>Based on your work history</li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              In 2026 you earn one work credit per ${FIGURES_2026.workCredit.toLocaleString()} in covered earnings (max four
              per year). Average disabled-worker benefit: about ${FIGURES_2026.avgWorkerBenefit.toLocaleString()}/month.
            </p>
            <Link to="/what-is-ssdi" className="mt-3 inline-block text-sm font-semibold text-teal-dark hover:underline">
              Learn how SSDI works
            </Link>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-3">
              <IconBubble>
                <Megaphone className="size-6 text-coral" />
              </IconBubble>
              <IconBubble>
                <Puzzle className="size-6 text-navy" />
              </IconBubble>
              <h2 className="text-2xl font-extrabold tracking-tight text-navy">Why a campaign?</h2>
            </div>
            <ul className="ml-1 list-disc space-y-1.5 pl-5 text-ink">
              <li>Help with applications</li>
              <li>Support with appeals</li>
              <li>Understand denials</li>
              <li>Guidance on medical proof</li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Most initial claims are denied. A campaign exists to explain the federal rules, organize evidence, and connect
              you with qualified representatives when a hearing is the next step.
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-3">
              <IconBubble>
                <ClipboardList className="size-6 text-navy" />
              </IconBubble>
              <h2 className="text-2xl font-extrabold tracking-tight text-navy">Common campaign services</h2>
            </div>
            <ul className="space-y-2">
              {SERVICES.map((s) => (
                <li key={s.title} className="flex items-start gap-2 text-ink">
                  <Check className="mt-0.5 size-5 shrink-0 text-teal" strokeWidth={3} />
                  <span>{s.title}</span>
                </li>
              ))}
            </ul>
            <Link to="/services" className="mt-4 inline-block text-sm font-semibold text-teal-dark hover:underline">
              See how we help
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-sky py-8" aria-labelledby="eligibility-form">
        <div className="container-page">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="lg:max-w-xs">
              <h2 id="eligibility-form" className="text-xl font-extrabold text-navy">
                Eligibility check form
              </h2>
              <p className="mt-2 text-sm text-muted">
                Screening only — this is not an SSA application. Apply for free at{" "}
                <a className="font-semibold underline" href={SITE.ssaApplyUrl} target="_blank" rel="noopener noreferrer">
                  SSA.gov
                </a>
                .
              </p>
            </div>
            <div className="flex-1">
              <IntakeForm compact source="home-bar" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-14">
        <div className="container-page grid gap-10 md:grid-cols-3">
          <Stat value={`${FIGURES_2026.disabledWorkersMillions}M`} label="Disabled workers receiving SSDI (Jan 2026)" />
          <Stat value={`$${FIGURES_2026.sgaNonBlind.toLocaleString()}`} label="2026 monthly SGA limit (non-blind)" />
          <Stat value={`${FIGURES_2026.waitingMonths} months`} label="Statutory waiting period before SSDI payments" />
        </div>
        <p className="container-page mt-6 text-center text-xs text-muted">
          Figures compiled from SSA publications and the Congressional Research Service snapshot for January 2026. They are
          educational, not a prediction of your benefit.
        </p>
      </section>

      <section className="border-t border-border bg-paper py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Official path</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy">SSA decides every claim</h2>
            <p className="mt-4 text-muted leading-relaxed">
              Disability Determination Services in your state reviews medical evidence using SSA’s five-step sequential
              evaluation. We do not issue benefits, guarantee approval, or replace SSA. Social Security Act § 1140 prohibits
              implying a government endorsement — we don’t.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="coral">
                <Link to="/eligibility">Check eligibility rules</Link>
              </Button>
              <Button asChild variant="outline">
                <a href={SITE.ssaApplyUrl} target="_blank" rel="noopener noreferrer">
                  Apply on SSA.gov
                </a>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            <img
              src={CONSULT_IMG}
              alt="Advisor reviewing disability paperwork with a couple at a table"
              className="h-64 w-full object-cover"
              width={1792}
              height={1008}
            />
          </div>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-navy">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-6" defaultValue="item-0">
            {FAQS.slice(0, 6).map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Link to="/faq" className="mt-6 inline-block text-sm font-semibold text-teal-dark hover:underline">
            Read all FAQs
          </Link>
        </div>
      </section>
    </main>
  );
}

function IconBubble({ children }: { children: ReactNode }) {
  return <span className="grid size-11 place-items-center rounded-xl bg-sky text-navy">{children}</span>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-sky/60 p-6 text-center">
      <p className="text-3xl font-extrabold text-navy">{value}</p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  );
}

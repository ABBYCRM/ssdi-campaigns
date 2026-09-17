import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, Check, ClipboardList, Megaphone, Puzzle, Stethoscope } from "lucide-react";
import { IntakeForm } from "@/components/forms/intake-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { pageHead } from "@/lib/seo";
import { FAQS, FIGURES_2026, SERVICES } from "@/lib/ssdi";

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
    <main id="main" className="bg-paper">
      <section className="relative overflow-hidden" aria-label="Campaign hero">
        <img
          src="/images/hero.jpg"
          alt="Tropical beach with palm trees and turquoise water"
          className="h-[20rem] w-full object-cover object-center sm:h-[24rem] md:h-[28rem]"
          width={1792}
          height={1008}
        />
        <h1 className="pointer-events-none absolute inset-y-0 left-0 z-[1] flex w-[68%] items-center justify-center px-4 text-center font-display text-[1.7rem] font-semibold uppercase leading-[1.1] tracking-wide text-navy drop-shadow-[0_2px_0_rgb(255_248_238_/_0.75)] sm:text-4xl md:text-5xl lg:text-[3.35rem]">
          SSDI Benefits:
          <br />
          Are You Eligible?
        </h1>
        <img
          src="/images/badger-point.png"
          alt="Happy Badger, the SSDI Campaigns mascot, pointing the way"
          className="absolute bottom-0 right-2 z-[2] w-36 drop-shadow-lg sm:right-6 sm:w-48 md:right-10 md:w-60 lg:w-72"
          width={720}
          height={720}
        />
      </section>

      <section className="relative px-4 pb-8 pt-8 md:pb-12">
        <div className="container-page grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.75rem] bg-teal p-6 text-card shadow-soft">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-card/20">
                <Banknote className="size-7" />
              </span>
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide">What is SSDI?</h2>
            </div>
            <ul className="space-y-1.5 text-sm font-semibold leading-snug">
              <li>• Monthly Payments</li>
              <li>• Federal Program</li>
              <li>• Based on Work History</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] bg-coral p-6 text-card shadow-soft">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-card/20">
                <Stethoscope className="size-7" />
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-card/20">
                <Megaphone className="size-7" />
              </span>
            </div>
            <ul className="space-y-1.5 text-sm font-bold leading-snug">
              <li>
                • Help with <span className="uppercase">Applications</span>
              </li>
              <li>
                • Support with <span className="uppercase">Appeals</span>
              </li>
              <li>
                • Understand <span className="uppercase">Denials</span>
              </li>
              <li>
                • Guidance on <span className="uppercase">Medical Proof</span>
              </li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-line bg-gold p-6 text-navy shadow-soft">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Why a campaign?</h2>
              <Puzzle className="size-8 shrink-0 text-coral" />
            </div>
            <ul className="space-y-1.5 text-sm font-bold">
              {SERVICES.map((s) => (
                <li key={s.title} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-teal-dark" strokeWidth={3} />
                  {s.title}
                </li>
              ))}
            </ul>
          </article>
        </div>
        <div className="container-page mt-2 flex flex-col items-center md:mt-[-2.5rem] md:flex-row md:items-end md:justify-end">
          <div className="mb-1 hidden items-center gap-2 text-navy md:mb-8 md:mr-[-1rem] md:flex">
            <ClipboardList className="size-6 text-teal-dark" />
            <p className="font-display text-lg font-semibold uppercase tracking-wide">Common campaign services:</p>
          </div>
          <img
            src="/images/badger-relax.png"
            alt="Happy Badger relaxing on a beach towel"
            className="w-64 drop-shadow-md sm:w-80 md:w-[22rem]"
            width={900}
            height={506}
          />
        </div>
      </section>

      <section className="px-4 py-6" aria-labelledby="eligibility-form">
        <div className="container-page">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
            <h2 id="eligibility-form" className="shrink-0 font-display text-xl font-semibold text-navy lg:pt-2">
              Eligibility Check Form
            </h2>
            <div className="w-full flex-1">
              <IntakeForm compact source="home-bar" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sky/50 py-12">
        <div className="container-page grid gap-6 md:grid-cols-3">
          <Stat value={`${FIGURES_2026.disabledWorkersMillions}M`} label="Disabled workers receiving SSDI (Jan 2026)" />
          <Stat value={`$${FIGURES_2026.sgaNonBlind.toLocaleString()}`} label="2026 monthly SGA limit (non-blind)" />
          <Stat value={`${FIGURES_2026.waitingMonths} months`} label="Statutory waiting period before SSDI payments" />
        </div>
      </section>

      <section className="py-14">
        <div className="container-page max-w-3xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-navy">Frequently asked questions</h2>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
      <p className="font-display text-3xl font-semibold text-navy">{value}</p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Mail, Phone, Clock } from "lucide-react";
import { IntakeForm } from "@/components/forms/intake-form";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { getPublicPhone } from "@/lib/public-phone";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "Free SSDI Consultation",
      description:
        "Request a free SSDI eligibility screening. Call +1 (561) 652-0362 or email Intake@abbycrm.com. Independent campaign — not affiliated with SSA.",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const phone = getPublicPhone();
  return (
    <main id="main">
      <PageHero
        kicker="Contact"
        title="Free consultation"
        lede="Tell us your name, number, state, and disability type. This is a campaign screening, not an SSA application, not legal advice, and not a promise of benefits."
      />
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_18rem]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <IntakeForm source="contact" />
        </div>
        <aside className="space-y-4">
          {phone.provisioned ? (
            <Card icon={<Phone className="size-4" />} title="Call" body={phone.display} href={`tel:${phone.tel}`} />
          ) : (
            <Card
              icon={<Phone className="size-4" />}
              title="Call"
              body="Inbound line pending — use this form. The SSDI Vapi number will appear here once provisioned."
            />
          )}
          <Card icon={<Mail className="size-4" />} title="Email" body={SITE.email} href={`mailto:${SITE.email}`} />
          <Card icon={<Clock className="size-4" />} title="Hours" body={SITE.hours} />
          <p className="text-xs leading-relaxed text-muted">
            Privacy requests:{" "}
            <a className="underline" href={`mailto:${SITE.privacyEmail}`}>
              {SITE.privacyEmail}
            </a>
            . Independent campaign — not a government agency.
          </p>
        </aside>
      </div>
    </main>
  );
}

function Card({
  icon,
  title,
  body,
  href,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-dark">
        {icon}
        {title}
      </p>
      <p className="mt-2 font-semibold text-navy">{body}</p>
    </>
  );
  const cls = "block rounded-xl border border-border bg-card p-5";
  return href ? (
    <a className={cls} href={href}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

import { ContactCtas } from "@/components/layout/contact-ctas";
import { SITE } from "@/lib/site";

export function CtaBand({
  title = "Ready to check SSDI eligibility?",
  lede = "Call +1 (561) 652-0362, start a screening, or email Intake@abbycrm.com. This is not SSA and not a promise of benefits.",
}: {
  title?: string;
  lede?: string;
}) {
  return (
    <section className="border-t border-border bg-sky">
      <div className="container-page flex flex-col gap-5 py-8 sm:py-10 md:flex-row md:items-center md:justify-between md:py-12 lg:py-14">
        <div className="max-w-xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-navy md:text-3xl">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">{lede}</p>
          <p className="mt-2 text-sm font-semibold text-navy">{SITE.hours}</p>
        </div>
        <ContactCtas className="shrink-0 md:max-w-md lg:max-w-none" />
      </div>
    </section>
  );
}

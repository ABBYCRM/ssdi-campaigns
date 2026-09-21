import { ContactCtas } from "@/components/layout/contact-ctas";
import { ContactLine } from "@/components/layout/contact-ctas";

export function PageHero({
  kicker,
  title,
  lede,
  cta = true,
}: {
  kicker?: string;
  title: string;
  lede: string;
  /** Full CTAs on content pages; quiet call line on legal; off only if explicitly false. */
  cta?: boolean | "quiet";
}) {
  return (
    <section className="border-b border-border bg-sky">
      <div className="container-page py-8 sm:py-10 md:py-14 lg:py-16">
        {kicker ? <p className="eyebrow">{kicker}</p> : null}
        <h1 className="mt-2 max-w-3xl text-[1.75rem] font-extrabold leading-tight tracking-tight text-navy sm:text-4xl md:text-[2.5rem] md:leading-tight">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">{lede}</p>
        {cta === true ? <ContactCtas className="mt-6" compact /> : null}
        {cta === "quiet" ? <ContactLine className="mt-5" /> : null}
      </div>
    </section>
  );
}

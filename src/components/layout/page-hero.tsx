import { ContactCtas } from "@/components/layout/contact-ctas";

export function PageHero({
  kicker,
  title,
  lede,
  cta = true,
}: {
  kicker?: string;
  title: string;
  lede: string;
  /** Call / screening / email CTAs under the lede. Off on legal pages. */
  cta?: boolean;
}) {
  return (
    <section className="border-b border-border bg-sky">
      <div className="container-page py-10 md:py-14 lg:py-16">
        {kicker ? <p className="eyebrow">{kicker}</p> : null}
        <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight text-navy sm:text-4xl md:text-[2.5rem] md:leading-tight">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">{lede}</p>
        {cta ? <ContactCtas className="mt-6" compact showEmail /> : null}
      </div>
    </section>
  );
}

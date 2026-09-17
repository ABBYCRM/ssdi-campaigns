export function PageHero({
  kicker,
  title,
  lede,
}: {
  kicker?: string;
  title: string;
  lede: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <img
        src="/images/hero.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        width={1792}
        height={1008}
      />
      <div className="absolute inset-0 bg-paper/78" />
      <div className="relative container-page py-12 md:py-16">
        {kicker ? <p className="eyebrow">{kicker}</p> : null}
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{lede}</p>
      </div>
    </section>
  );
}

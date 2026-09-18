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
    <section className="border-b border-border bg-sky">
      <div className="container-page py-12 md:py-16">
        {kicker ? <p className="eyebrow">{kicker}</p> : null}
        <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight text-navy md:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{lede}</p>
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { BLUE_BOOK } from "@/lib/ssdi";

export const Route = createFileRoute("/blue-book")({
  head: () =>
    pageHead({
      title: "SSA Blue Book Listings (Adult)",
      description:
        "The 14 adult body-system categories in SSA’s Listing of Impairments. Meeting a listing can mean approval at step 3. Not being listed does not mean you cannot qualify.",
      path: "/blue-book",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Listings of Impairments"
        title="The SSA Blue Book"
        lede="Part A of the Listing of Impairments describes adult medical criteria SSA considers severe enough to prevent any gainful activity. You do not have to be “in the Blue Book” to win — many claims are decided at steps 4 and 5 on residual functional capacity."
      />
      <div className="container-page grid gap-4 py-14 sm:grid-cols-2">
        {BLUE_BOOK.map((item) => (
          <article key={item.code} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-dark">{item.code}</p>
            <h2 className="mt-1 text-lg font-extrabold text-navy">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.examples}</p>
          </article>
        ))}
      </div>
      <p className="container-page max-w-3xl pb-16 text-sm text-muted">
        Childhood claims use Part B of the listings. Meeting a listing is one path — many awards are decided on residual
        functional capacity at steps 4 and 5.
      </p>
    </main>
  );
}

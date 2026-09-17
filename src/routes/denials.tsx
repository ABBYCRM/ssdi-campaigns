import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/denials")({
  head: () =>
    pageHead({
      title: "SSDI Denial Reasons and What To Do Next",
      description:
        "Most SSDI claims are denied initially. Common reasons: SGA, insufficient work credits, incomplete medical evidence. You usually have 60 days to appeal.",
      path: "/denials",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="After a no"
        title="Understanding SSDI denials"
        lede="A denial is not the end of the claim. It is often the start of the real case. Appeal within 60 days of receiving the notice."
      />
      <article className="container-page max-w-3xl space-y-5 py-14 text-muted leading-relaxed">
        <h2 className="text-2xl font-extrabold text-navy">Frequent denial reasons</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Earnings over substantial gainful activity.</li>
          <li>Not enough recent work credits / onset after date last insured.</li>
          <li>Impairment not expected to last 12 months.</li>
          <li>Insufficient medical evidence or missed consultative exam.</li>
          <li>SSA finds you can still do past work or other work in the national economy.</li>
          <li>Failure to follow prescribed treatment without good cause, or failure to cooperate.</li>
        </ul>
        <p>
          Read the notice. Technical denials (insured status, SGA) are different from medical denials. Do not file a brand
          new application if you are still inside the appeal window — you can lose your protective filing date.
        </p>
        <Link to="/appeals" className="inline-block font-semibold text-teal-dark hover:underline">
          See the four appeal levels
        </Link>
      </article>
    </main>
  );
}

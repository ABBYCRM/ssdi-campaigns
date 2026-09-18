import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/cookies")({
  head: () =>
    pageHead({
      title: "Cookie Policy",
      description: "How SSDI Campaigns uses necessary and optional cookies, and how Global Privacy Control is honored.",
      path: "/cookies",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Legal"
        title="Cookie policy"
        lede="We keep cookies to a minimum."
        cta={false}
      />
      <article className="container-page max-w-3xl space-y-4 py-14 text-sm leading-relaxed text-muted">
        <p>
          <strong className="text-navy">Strictly necessary:</strong> session, CSRF, load balancing, cookie-consent storage,
          and security. These do not require opt-in under U.S. state privacy laws.
        </p>
        <p>
          <strong className="text-navy">Optional analytics:</strong> only if you tap Accept on the banner and you are not
          sending a Global Privacy Control signal. We do not run third-party advertising pixels on this build.
        </p>
        <p>
          You can reject optional cookies, use browser controls, or send GPC. California, Colorado, Connecticut, and other
          states treat GPC as a valid opt-out of sale/share. See the{" "}
          <Link to="/privacy" className="font-semibold text-navy underline">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
    </main>
  );
}

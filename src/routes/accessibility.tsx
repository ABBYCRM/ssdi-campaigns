import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/accessibility")({
  head: () =>
    pageHead({
      title: "Accessibility Statement",
      description: "SSDI Campaigns aims to conform to WCAG 2.2 Level AA. Contact us with access barriers.",
      path: "/accessibility",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Access"
        title="Accessibility statement"
        lede="People visiting a disability-benefits site should not have to fight the interface."
        cta={false}
      />
      <article className="container-page max-w-3xl space-y-4 py-14 text-sm leading-relaxed text-muted">
        <p>
          We aim to conform to WCAG 2.2 Level AA: semantic headings, skip link, visible focus, form labels, 4.5:1 text
          contrast, keyboard access to navigation and the accordion, and respect for prefers-reduced-motion. Alternative
          contact: {SITE.phonePhrase} and {SITE.email}.
        </p>
        <p>
          If you encounter a barrier, email {SITE.email} with the page URL and a description. We will work to fix it. This
          statement does not limit rights under the ADA, Section 504, or state disability-rights laws.
        </p>
      </article>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/sms-terms")({
  head: () =>
    pageHead({
      title: "SMS Terms and Conditions",
      description: "SSDI Campaigns text messaging terms: STOP, HELP, frequency, rates, and TCPA consent.",
      path: "/sms-terms",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero kicker="TCPA" title="SMS terms" lede="Applies if you opt in to text messages from SSDI Campaigns." />
      <article className="container-page max-w-3xl space-y-4 py-14 text-sm leading-relaxed text-muted">
        <p>
          Program: campaign follow-up about SSDI screening, appointments, and document reminders. Frequency: varies,
          typically fewer than 8 messages per month. Message and data rates may apply.
        </p>
        <p>
          Opt out: reply STOP, END, CANCEL, UNSUBSCRIBE, or QUIT. We will confirm and cease marketing texts. For help:
          reply HELP or call {SITE.phoneDisplay}. Carriers are not liable for delayed or undelivered messages.
        </p>
        <p>
          Consent is obtained via an unchecked checkbox and is not a condition of receiving services. See our{" "}
          <Link to="/privacy" className="font-semibold text-navy underline">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
    </main>
  );
}

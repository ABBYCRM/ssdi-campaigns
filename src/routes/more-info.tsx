import { createFileRoute, Link } from "@tanstack/react-router";
import { IntakeForm } from "@/components/forms/intake-form";
import { CallLink } from "@/components/layout/call-link";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/more-info")({
  component: MoreInfoPage,
  head: () => ({
    meta: [
      { title: `Share more details | ${SITE.name}` },
      {
        name: "description",
        content:
          "Share a few more details for your SSDI Campaigns educational screening. Not affiliated with SSA. Not legal advice.",
      },
    ],
  }),
});

function MoreInfoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal">Educational screening</p>
      <h1 className="mt-2 text-3xl font-bold text-navy">Share a few more details</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Thanks for starting with SSDI Campaigns. This page is an optional follow-up so our team can better understand your
        situation. This is educational screening only — not an SSA decision and not legal advice. We are not affiliated with
        the Social Security Administration.
      </p>
      <p className="mt-2 text-sm text-muted">
        Prefer to talk? Call <CallLink className="font-semibold text-navy" icon={false} /> or email{" "}
        <a className="font-semibold text-navy underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        .
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <IntakeForm source="more-info-email" />
      </div>
      <p className="mt-6 text-xs text-muted">
        <Link to="/privacy" className="underline">
          Privacy Policy
        </Link>{" "}
        ·{" "}
        <Link to="/disclaimer" className="underline">
          Disclaimer
        </Link>
      </p>
    </main>
  );
}

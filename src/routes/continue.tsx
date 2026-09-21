import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CallLink } from "@/components/layout/call-link";
import { continueSchema } from "@/lib/form-schema";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/continue")({
  validateSearch: (search: Record<string, unknown>) => ({
    id:
      typeof search.id === "string"
        ? search.id
        : typeof search.ref === "string"
          ? search.ref
          : "",
  }),
  head: () =>
    pageHead({
      title: "Share a few more details",
      description:
        "Optional follow-up for your SSDI Campaigns educational screening. Not affiliated with SSA. Not legal advice.",
      path: "/continue",
    }),
  component: ContinuePage,
});

type Choice = "yes" | "no" | "unsure" | "";

function ContinuePage() {
  const { id } = Route.useSearch();
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [durationLikely12Months, setDuration] = React.useState<Choice>("");
  const [workingAboveSga, setSga] = React.useState<Choice>("");
  const [workCreditsLikely, setCredits] = React.useState<Choice>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const raw = {
      id,
      durationLikely12Months: durationLikely12Months || undefined,
      workingAboveSga: workingAboveSga || undefined,
      workCreditsLikely: workCreditsLikely || undefined,
      message: String(fd.get("message") ?? ""),
    };
    const parsed = continueSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/continue", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok && !body?.ok) {
        setError("We could not save this right now. You can reply to your email instead.");
        return;
      }
      setDone(true);
    } catch {
      setError("We could not save this right now. You can reply to your email instead.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal">Educational screening</p>
      <h1 className="mt-2 text-3xl font-bold text-navy">Share a few more details</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Thanks for starting with SSDI Campaigns. These optional questions help our team review your situation carefully.
        This is educational screening only — not an SSA decision and not legal advice. We are not affiliated with the
        Social Security Administration.
      </p>
      <p className="mt-2 text-sm text-muted">
        Prefer to talk? Call <CallLink className="font-semibold text-navy" icon={false} />.
      </p>

      {!id ? (
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-navy" role="status">
          Open this page from the link in your confirmation email so we can match your details. You can also reply to that
          email with anything you would like us to know.
        </p>
      ) : done ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <span className="grid size-12 place-items-center rounded-full bg-teal/10 text-teal">
            <CheckCircle2 className="size-6" />
          </span>
          <h2 className="text-lg font-bold text-navy">Thank you</h2>
          <p className="max-w-md text-sm text-muted">
            We received your additional details. A specialist may follow up by phone or email. Applying for SSDI through
            SSA is always free.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 grid gap-5 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <ChoiceField
            label="Has your condition lasted (or is it expected to last) 12 months or longer?"
            name="duration"
            value={durationLikely12Months}
            onChange={setDuration}
          />
          <ChoiceField
            label="Are you currently working and earning above Substantial Gainful Activity (SGA)?"
            name="sga"
            value={workingAboveSga}
            onChange={setSga}
          />
          <ChoiceField
            label="Do you believe you have enough Social Security work credits for SSDI?"
            name="credits"
            value={workCreditsLikely}
            onChange={setCredits}
          />
          <div className="grid gap-1.5">
            <Label htmlFor="continue-msg">Anything else that would help? (optional)</Label>
            <Textarea
              id="continue-msg"
              name="message"
              rows={4}
              placeholder="Prior denials, upcoming hearings, doctors, or other notes…"
            />
          </div>
          {error ? (
            <p className="text-sm font-medium text-red" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="teal" size="lg" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Saving…" : "Send more details"}
          </Button>
          <p className="text-[0.7rem] leading-relaxed text-muted">
            Independent campaign — not SSA. Not legal advice. You may also reply to your confirmation email.
          </p>
        </form>
      )}

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

function ChoiceField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: Choice;
  onChange: (v: Choice) => void;
}) {
  const opts: { v: Choice; t: string }[] = [
    { v: "yes", t: "Yes" },
    { v: "no", t: "No" },
    { v: "unsure", t: "Not sure" },
  ];
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium text-navy">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <label
            key={o.v}
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm ${
              value === o.v ? "border-teal bg-teal/10 font-semibold text-navy" : "border-border text-muted"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={o.v}
              checked={value === o.v}
              onChange={() => onChange(o.v)}
            />
            {o.t}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

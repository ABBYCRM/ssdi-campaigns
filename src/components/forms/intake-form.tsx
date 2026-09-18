import * as React from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DISABILITY_OPTIONS, intakeSchema } from "@/lib/form-schema";
import { US_STATES } from "@/lib/states";
import { SITE, TCPA_CONSENT } from "@/lib/site";
import { CallLink } from "@/components/layout/call-link";
import { submitIntake } from "@/lib/submit-intake";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
  source?: string;
  className?: string;
};

export function IntakeForm({ compact, source = "site", className }: Props) {
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [disabilityType, setDisabilityType] = React.useState("");
  const [state, setState] = React.useState("");
  const [tcpa, setTcpa] = React.useState(false);
  const [sensitiveHealth, setSensitiveHealth] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      disabilityType,
      state,
      zip: String(fd.get("zip") ?? ""),
      message: String(fd.get("message") ?? ""),
      tcpa,
      sensitiveHealth,
      source,
      hp: String(fd.get("company") ?? ""),
    };
    const parsed = intakeSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Please check the form.";
      setError(first);
      return;
    }
    setPending(true);
    try {
      const res = await submitIntake({ data: parsed.data });
      if (res.ok) setDone(true);
      else setError("We could not send this right now. Please call us.");
    } catch {
      setError("We could not send this right now. Please call us.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className={cn("flex flex-col items-center gap-3 py-6 text-center", className)}>
        <span className="grid size-12 place-items-center rounded-full bg-teal/10 text-teal">
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className="text-lg font-bold text-navy">Request received</h3>
        <p className="max-w-md text-sm text-muted">
          Thanks. A campaign specialist will follow up at the number you provided.
          {SITE.phoneProvisioned ? (
            <>
              {" "}
              You can also call <CallLink className="font-semibold text-navy" icon={false} />.
            </>
          ) : (
            <> You can also use the contact form if you need to reach us.</>
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-3", className)} noValidate>
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" htmlFor={`${source}-name`}>
          <Input id={`${source}-name`} name="name" autoComplete="name" required placeholder="Full name" />
        </Field>
        <Field label="Phone" htmlFor={`${source}-phone`}>
          <Input id={`${source}-phone`} name="phone" type="tel" autoComplete="tel" required placeholder="(555) 555-5555" />
        </Field>
        {!compact ? (
          <Field label="Email (optional)" htmlFor={`${source}-email`}>
            <Input id={`${source}-email`} name="email" type="email" autoComplete="email" placeholder="you@email.com" />
          </Field>
        ) : null}
        <Field label="Disability type" htmlFor={`${source}-dtype`}>
          <Select value={disabilityType} onValueChange={setDisabilityType}>
            <SelectTrigger id={`${source}-dtype`} aria-label="Disability type">
              <SelectValue placeholder="Disability type" />
            </SelectTrigger>
            <SelectContent>
              {DISABILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="State" htmlFor={`${source}-state`}>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger id={`${source}-state`} aria-label="State">
              <SelectValue placeholder="Your state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.slug} value={s.abbr}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {!compact ? (
          <Field label="ZIP (optional)" htmlFor={`${source}-zip`}>
            <Input id={`${source}-zip`} name="zip" inputMode="numeric" autoComplete="postal-code" placeholder="ZIP" />
          </Field>
        ) : null}
      </div>
      {!compact ? (
        <Field label="Anything else we should know? (optional)" htmlFor={`${source}-msg`}>
          <Textarea id={`${source}-msg`} name="message" rows={4} placeholder="Work history, denials, upcoming hearing…" />
        </Field>
      ) : null}

      <label className="flex min-h-11 items-start gap-3 text-xs leading-relaxed text-muted">
        <Checkbox checked={sensitiveHealth} onCheckedChange={(v) => setSensitiveHealth(v === true)} className="mt-0.5 size-6" />
        <span>
          I understand this form collects health-related information (disability type) so we can screen SSDI eligibility. Read the{" "}
          <Link to="/privacy" className="font-semibold text-navy underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      <label className="flex min-h-11 items-start gap-3 text-xs leading-relaxed text-muted">
        <Checkbox checked={tcpa} onCheckedChange={(v) => setTcpa(v === true)} className="mt-0.5 size-6" />
        <span>{TCPA_CONSENT}</span>
      </label>

      {error ? (
        <p className="text-sm font-medium text-red" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="teal" size="lg" disabled={pending} className={compact ? "md:w-auto" : "w-full sm:w-auto"}>
        {pending ? "Sending…" : "Submit your case"}
      </Button>
      <p className="text-[0.7rem] leading-relaxed text-muted">
        Not a government agency. Applying at SSA is free. Consent is not required to obtain information — you may{" "}
        {SITE.phoneProvisioned ? (
          <>
            call <CallLink className="font-semibold text-navy" icon={false} /> instead
          </>
        ) : (
          <>use the contact form instead</>
        )}
        .
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

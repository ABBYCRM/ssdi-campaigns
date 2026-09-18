import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy-request")({
  head: () =>
    pageHead({
      title: "Privacy Request",
      description: "Exercise access, deletion, correction, portability, or sale/share opt-out rights.",
      path: "/privacy-request",
    }),
  component: Page,
});

function Page() {
  const [sent, setSent] = React.useState(false);
  const [type, setType] = React.useState("");

  if (sent) {
    return (
      <main id="main">
        <PageHero
          kicker="Privacy"
          title="Request logged"
          lede="This form is not yet wired to a case system. Email us at the privacy address if you need a faster human response."
          cta="quiet"
        />
        <p className="container-page max-w-xl py-14 text-sm text-muted">
          Email {SITE.privacyEmail}. We will verify your identity and respond within 45 days.
        </p>
      </main>
    );
  }

  return (
    <main id="main">
      <PageHero
        kicker="Privacy"
        title="Consumer privacy request"
        lede="Available to residents of every U.S. state. We will not discriminate against you for exercising a right."
        cta="quiet"
      />
      <form
        className="container-page my-14 grid max-w-xl gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="pr-name">Name</Label>
          <Input id="pr-name" required name="name" autoComplete="name" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pr-email">Email</Label>
          <Input id="pr-email" required type="email" name="email" autoComplete="email" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pr-phone">Phone used on the campaign form (if any)</Label>
          <Input id="pr-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="grid gap-1.5">
          <Label>Request type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger aria-label="Request type">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="access">Access / know</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="correct">Correct</SelectItem>
              <SelectItem value="port">Portability</SelectItem>
              <SelectItem value="optout">Opt out of sale/share/targeted ads</SelectItem>
              <SelectItem value="limit">Limit use of sensitive information</SelectItem>
              <SelectItem value="appeal">Appeal a prior decision</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pr-details">Details</Label>
          <Textarea id="pr-details" name="details" rows={4} />
        </div>
        <Button type="submit" variant="teal" className="min-h-11">
          Submit request
        </Button>
        <p className="text-xs text-muted">
          This request form currently leads nowhere in our CRM (same as the intake form). Send a parallel email to{" "}
          {SITE.privacyEmail} so a human can process it.
        </p>
      </form>
    </main>
  );
}

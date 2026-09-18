import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { getPublicPhone } from "@/lib/public-phone";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
  showEmail?: boolean;
  /** Full-width stacked buttons below `sm`. */
  stackOnMobile?: boolean;
};

/**
 * Primary campaign CTAs: call +1 (561) 652-0362, start screening, email Intake@abbycrm.com.
 */
export function ContactCtas({ className, compact, showEmail = true, stackOnMobile = true }: Props) {
  const phone = getPublicPhone();
  const size = compact ? "default" : "lg";
  const btn = cn("min-h-11", stackOnMobile ? "w-full sm:w-auto" : "w-auto");

  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch gap-3",
        stackOnMobile ? "flex-col sm:flex-row sm:items-center" : "flex-row items-center",
        className,
      )}
    >
      {phone.provisioned ? (
        <Button asChild variant="coral" size={size} className={cn(btn, "min-w-[10.5rem]")}>
          <a href={`tel:${phone.tel}`} aria-label={`Call SSDI Campaigns at ${phone.display}`}>
            <Phone className="size-4" />
            <span className="sm:hidden">Call now</span>
            <span className="hidden sm:inline">Call {phone.display}</span>
          </a>
        </Button>
      ) : null}
      <Button asChild variant="teal" size={size} className={cn(btn, "min-w-[10.5rem]")}>
        <Link to="/contact">Start screening</Link>
      </Button>
      {showEmail ? (
        <Button asChild variant="outline" size={size} className={cn(btn, "min-w-[10.5rem]")}>
          <a href={`mailto:${SITE.email}`}>
            <Mail className="size-4" />
            <span className="truncate">{SITE.email}</span>
          </a>
        </Button>
      ) : null}
    </div>
  );
}

/** Quiet in-copy contact line for legal pages and tight asides. */
export function ContactLine({ className }: { className?: string }) {
  const phone = getPublicPhone();
  return (
    <p className={cn("text-sm leading-relaxed text-navy", className)}>
      {phone.provisioned ? (
        <>
          Call{" "}
          <a href={`tel:${phone.tel}`} className="font-bold underline-offset-2 hover:underline">
            {phone.display}
          </a>
          {" · "}
        </>
      ) : null}
      <Link to="/contact" className="font-bold underline-offset-2 hover:underline">
        Start screening
      </Link>
      {" · "}
      <a href={`mailto:${SITE.email}`} className="font-bold underline-offset-2 hover:underline">
        {SITE.email}
      </a>
    </p>
  );
}

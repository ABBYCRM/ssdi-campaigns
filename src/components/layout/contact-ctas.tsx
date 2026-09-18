import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallLink } from "@/components/layout/call-link";
import { SITE } from "@/lib/site";
import { getPublicPhone } from "@/lib/public-phone";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Compact row for heroes / sticky bars. */
  compact?: boolean;
  showEmail?: boolean;
};

/**
 * Primary campaign CTAs: call +1 (561) 652-0362, start screening, email Intake@abbycrm.com.
 */
export function ContactCtas({ className, compact, showEmail = true }: Props) {
  const phone = getPublicPhone();
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {phone.provisioned ? (
        <Button asChild variant="coral" size={compact ? "default" : "lg"} className="min-h-11 min-w-[10.5rem]">
          <a href={`tel:${phone.tel}`} aria-label={`Call SSDI Campaigns at ${phone.display}`}>
            <Phone className="size-4" />
            Call {phone.display}
          </a>
        </Button>
      ) : null}
      <Button asChild variant="teal" size={compact ? "default" : "lg"} className="min-h-11 min-w-[10.5rem]">
        <Link to="/contact">Start screening</Link>
      </Button>
      {showEmail ? (
        <Button asChild variant="outline" size={compact ? "default" : "lg"} className="min-h-11 min-w-[10.5rem]">
          <a href={`mailto:${SITE.email}`}>
            <Mail className="size-4" />
            {SITE.email}
          </a>
        </Button>
      ) : (
        <CallLink className="text-sm font-bold text-navy" />
      )}
    </div>
  );
}

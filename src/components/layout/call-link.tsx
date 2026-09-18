import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { getPublicPhone } from "@/lib/public-phone";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  icon?: boolean;
  iconClassName?: string;
};

/**
 * Click-to-call when VITE_PUBLIC_PHONE / INBOUND_PHONE_NUMBER is set to the
 * SSDI Vapi number. Otherwise links to /contact — never CaseClosedFL.
 */
export function CallLink({ className, icon = true, iconClassName = "size-4 text-teal" }: Props) {
  const phone = getPublicPhone();
  const inner = (
    <>
      {icon ? <Phone className={iconClassName} /> : null}
      <span>{phone.provisioned ? phone.display : "Request a call"}</span>
    </>
  );
  const cls = cn("inline-flex items-center gap-1.5", className);

  if (!phone.provisioned) {
    return (
      <Link to="/contact" className={cls} aria-label="Request a call via the contact form">
        {inner}
      </Link>
    );
  }

  return (
    <a href={`tel:${phone.tel}`} className={cls} aria-label={`Call SSDI Campaigns at ${phone.display}`}>
      {inner}
    </a>
  );
}

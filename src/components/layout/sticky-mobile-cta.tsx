import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { getPublicPhone } from "@/lib/public-phone";
import { SITE } from "@/lib/site";

/**
 * Phone + tablet sticky bar: call, start screening, email.
 * Hidden on large screens where the header already shows those CTAs.
 */
export function StickyMobileCta() {
  const phone = getPublicPhone();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-lift lg:hidden">
      <div className="grid grid-cols-2 gap-2 px-3 py-2 md:grid-cols-3">
        {phone.provisioned ? (
          <a
            href={`tel:${phone.tel}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-coral px-3 text-sm font-bold text-white"
            aria-label={`Call SSDI Campaigns at ${phone.display}`}
          >
            <Phone className="size-4 shrink-0" />
            <span className="truncate">Call now</span>
          </a>
        ) : (
          <Link
            to="/contact"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-coral px-3 text-sm font-bold text-white"
          >
            Request a call
          </Link>
        )}
        <Link
          to="/contact"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-teal px-3 text-sm font-bold text-white"
        >
          Start screening
        </Link>
        <a
          href={`mailto:${SITE.email}`}
          className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-bold text-navy md:col-span-1"
        >
          <Mail className="size-4 shrink-0" />
          <span className="truncate">{SITE.email}</span>
        </a>
      </div>
    </div>
  );
}

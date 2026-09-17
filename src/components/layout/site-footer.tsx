import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { LEGAL_LINKS, NAV, SITE, SSA_DISCLAIMER } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-paper">
      <div className="container-page flex flex-col items-center gap-4 py-8 text-center">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-extrabold uppercase tracking-[0.14em] text-navy" aria-label="Footer">
          {NAV.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-coral">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-navy">
          <a href={`tel:${SITE.phoneTel}`} className="inline-flex items-center gap-1.5">
            <Phone className="size-4 text-coral" /> {SITE.phoneDisplay}
          </a>
          <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-1.5">
            <Mail className="size-4 text-coral" /> {SITE.email}
          </a>
        </p>
        <p className="max-w-3xl text-xs italic leading-relaxed text-navy/80">*{SSA_DISCLAIMER}*</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.65rem] uppercase tracking-wide text-muted">
          {LEGAL_LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="hover:text-navy">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

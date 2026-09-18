import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CallLink } from "@/components/layout/call-link";
import { LEGAL_LINKS, NAV, RESOURCE_LINKS, SITE, SSA_DISCLAIMER } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-sky">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Independent campaign helping people understand SSDI eligibility, applications, denials, and appeals.
          </p>
          <p className="mt-4 flex flex-col gap-1.5 text-sm font-semibold text-navy">
            <CallLink className="font-semibold" iconClassName="size-4 text-teal" />
            <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2">
              <Mail className="size-4 text-teal" /> {SITE.email}
            </a>
          </p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-navy">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted hover:text-navy">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/faq" className="text-muted hover:text-navy">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/states" className="text-muted hover:text-navy">
                All 50 States
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-navy">Guides</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {RESOURCE_LINKS.slice(0, 8).map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted hover:text-navy">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-navy">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted hover:text-navy">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/sitemap.xml" className="text-muted hover:text-navy">
                XML Sitemap
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="bg-navy-deep px-4 py-4 text-center text-[0.72rem] leading-relaxed text-sky">
        {SSA_DISCLAIMER}
      </div>
    </footer>
  );
}

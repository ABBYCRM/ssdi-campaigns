import { Link } from "@tanstack/react-router";
import { ContactCtas } from "@/components/layout/contact-ctas";
import { Logo } from "@/components/brand/logo";
import { LEGAL_LINKS, NAV, RESOURCE_LINKS, SSA_DISCLAIMER } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-sky">
      <div className="container-page grid gap-10 py-10 sm:grid-cols-2 md:py-12 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Independent campaign helping people understand SSDI eligibility, applications, denials, and appeals.
          </p>
          <ContactCtas className="mt-5" compact />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-navy">Explore</h2>
          <ul className="mt-3 text-sm">
            {NAV.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-flex min-h-11 min-w-11 items-center px-1 text-muted hover:text-navy">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/faq" className="inline-flex min-h-11 min-w-11 items-center px-1 text-muted hover:text-navy">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/states" className="inline-flex min-h-11 min-w-11 items-center px-1 text-muted hover:text-navy">
                All 50 States
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-navy">Guides</h2>
          <ul className="mt-3 text-sm">
            {RESOURCE_LINKS.slice(0, 8).map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-flex min-h-11 min-w-11 items-center px-1 text-muted hover:text-navy">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-navy">Legal</h2>
          <ul className="mt-3 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-flex min-h-11 min-w-11 items-center px-1 text-muted hover:text-navy">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/sitemap.xml" className="inline-flex min-h-11 min-w-11 items-center px-1 text-muted hover:text-navy">
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

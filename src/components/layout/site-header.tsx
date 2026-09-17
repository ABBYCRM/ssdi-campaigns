import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV, SITE } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-paper/95 backdrop-blur-sm">
      <div className="container-page flex h-[4.25rem] items-center justify-between gap-3">
        <Link to="/" className="min-w-0 shrink-0" aria-label="SSDI Campaigns home">
          <Logo />
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-full px-3 py-2 text-[0.78rem] font-extrabold uppercase tracking-[0.14em] text-navy/80 transition-colors hover:bg-gold hover:text-navy"
              activeProps={{ className: "text-coral" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="coral" size="sm" className="whitespace-nowrap px-5 font-extrabold uppercase tracking-wide">
            <Link to="/contact">Free Consultation</Link>
          </Button>
          <a
            href={`tel:${SITE.phoneTel}`}
            className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-navy"
          >
            {SITE.phoneDisplay}
          </a>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="grid size-11 place-items-center rounded-full border border-border text-navy lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-80 flex-col bg-paper">
            <SheetHeader>
              <SheetTitle asChild>
                <Link to="/" onClick={() => setOpen(false)}>
                  <Logo />
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-full px-3 py-3 text-sm font-extrabold uppercase tracking-wide text-navy hover:bg-gold"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-6">
              <Button asChild variant="coral">
                <Link to="/contact" onClick={() => setOpen(false)}>
                  Free Consultation
                </Link>
              </Button>
              <a href={`tel:${SITE.phoneTel}`} className="text-center text-sm font-bold text-navy">
                {SITE.phoneDisplay}
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

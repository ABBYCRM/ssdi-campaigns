import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV, SITE } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link to="/" className="min-w-0 shrink-0" aria-label="SSDI Campaigns home">
          <Logo />
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-md px-2.5 py-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-navy/80 transition-colors hover:bg-sky hover:text-navy"
              activeProps={{ className: "text-red" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="coral" size="sm" className="whitespace-nowrap">
            <Link to="/contact">Free Consultation</Link>
          </Button>
          <a
            href={`tel:${SITE.phoneTel}`}
            className="flex items-center gap-1.5 whitespace-nowrap text-sm font-extrabold tracking-tight text-navy"
          >
            <Phone className="size-4 text-teal" />
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
          <SheetContent side="right" className="flex w-80 flex-col">
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
                  className="rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wide text-navy hover:bg-sky"
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

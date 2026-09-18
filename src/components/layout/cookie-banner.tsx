import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const KEY = "ssdi-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function set(value: "accept" | "reject") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-50 border-t border-border bg-card p-4 shadow-[0_-12px_40px_-20px_rgb(11_42_74_/_0.4)] lg:bottom-0">
      <div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm text-muted">
          We use necessary cookies to run this site and optional cookies for analytics if you accept. We honor Global
          Privacy Control. See our{" "}
          <Link to="/cookies" className="font-semibold text-navy underline">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="font-semibold text-navy underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="min-h-11" onClick={() => set("reject")}>
            Reject optional
          </Button>
          <Button variant="teal" size="sm" className="min-h-11" onClick={() => set("accept")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

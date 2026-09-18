import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ContactCtas } from "@/components/layout/contact-ctas";

export function NotFound() {
  return (
    <main id="main" className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-navy">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">That URL is not part of this campaign site.</p>
      <div className="mt-6 flex justify-center">
        <ContactCtas className="justify-center" />
      </div>
      <Button asChild variant="outline" className="mt-4 min-h-11">
        <Link to="/">Back home</Link>
      </Button>
    </main>
  );
}

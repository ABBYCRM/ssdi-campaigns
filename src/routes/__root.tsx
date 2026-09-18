import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { CtaBand } from "@/components/layout/cta-band";
import { LiveChat } from "@/components/layout/live-chat";
import { StickyMobileCta } from "@/components/layout/sticky-mobile-cta";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/site";
import appCss from "../styles.css?url";

const APP_NAME = SITE.name;

const LEGAL_PATHS = new Set([
  "/privacy",
  "/terms",
  "/disclaimer",
  "/sms-terms",
  "/cookies",
  "/accessibility",
  "/do-not-sell",
  "/privacy-request",
]);

function ContentCtaSlot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (LEGAL_PATHS.has(pathname) || pathname === "/contact") return null;
  return <CtaBand />;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0B2A4A" },
      { name: "application-name", content: APP_NAME },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col overflow-x-hidden bg-paper pb-[calc(7.5rem+env(safe-area-inset-bottom))] text-ink antialiased lg:pb-0">
        <PreviewHostBridge />
        <AuthProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
          >
            Skip to content
          </a>
          <JsonLd />
          <SiteHeader />
          <Outlet />
          <ContentCtaSlot />
          <SiteFooter />
          <CookieBanner />
          <LiveChat />
          <StickyMobileCta />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});

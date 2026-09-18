import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { pageHead } from "@/lib/seo";
import { STATE_PRIVACY } from "@/lib/privacy-states";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      title: "Privacy Policy — 50-State Notice",
      description:
        "SSDI Campaigns 50-state privacy policy covering CCPA/CPRA, VCDPA, CPA, TDPSA, MHMDA, TCPA, HIPAA boundary, GPC, and every U.S. state’s breach and consumer-privacy rules.",
      path: "/privacy",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="Legal"
        title="Privacy policy (50-state)"
        lede="Effective September 16, 2026. This policy explains how SSDI Campaigns collects, uses, shares, and protects personal information, including health-related disability data, from residents of every U.S. state and the District of Columbia."
        cta={false}
      />
      <article className="container-page max-w-3xl space-y-8 py-14 text-sm leading-relaxed text-muted">
        <p>
          Operator: {SITE.legalName} (“we,” “us”). Contact: {SITE.email}. Privacy requests: {SITE.privacyEmail}. Phone:{" "}
          {SITE.phonePhrase}. Website: {SITE.domain}.
        </p>

        <Section title="1. Who we are — and who we are not">
          We are an independent private campaign. We are not the U.S. Social Security Administration, CMS, HHS, or any
          state DDS. We are not a covered entity under HIPAA merely by operating this website; if we later receive records
          from a covered entity we will handle them under a business-associate or comparable agreement. We are not a law
          firm.
        </Section>

        <Section title="2. Information we collect">
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Identifiers: name, phone, email, postal ZIP, state of residence.</li>
            <li>Sensitive / health-related data: disability type and optional narrative about conditions, denials, or hearings.</li>
            <li>Commercial / campaign data: that you requested a screening.</li>
            <li>Internet activity: IP address, user agent, referring URL, pages viewed, GPC signal, cookie choices — used for TCPA consent logs, security, and (if you accept) analytics.</li>
            <li>Inferences: possible SSDI issues (work credits, SGA, listing category) derived from what you tell us.</li>
            <li>Audio: if you call us, we may record after notice, consistent with one-party / all-party consent laws.</li>
          </ul>
          We do not knowingly collect information from children under 16. SSDI worker claims are adult claims; minor
          auxiliary-beneficiary questions should be directed to SSA.
        </Section>

        <Section title="3. How we use information">
          To respond to your request; to screen eligibility at a high level; to send the communications you consented to
          (including autodialed/prerecorded calls and SMS if you gave PEWC); to refer you, with consent, to an
          SSA-registered representative; to keep required TCPA/E-SIGN records (disclosure text, timestamp, IP, URL); to
          secure the site; to comply with law; and to improve educational content. We do not use sensitive health data for
          cross-context behavioral advertising.
        </Section>

        <Section title="4. Sharing (and “sale” / “share” under state law)">
          We do not sell your information for money today. We may share identifiers and the disability information you
          submitted with:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>SSA-registered attorneys or representatives, if you asked for hearing or case help.</li>
            <li>Vendors who host this site, send SMS/voice, or provide security — bound by contract.</li>
            <li>Professional advisors and authorities when required by law, fraud prevention, or safety.</li>
          </ul>
          Some state laws treat disclosure of personal information for leads or targeted ads as a “sale” or “share” even
          without cash. You may opt out here:{" "}
          <Link className="font-semibold text-navy underline" to="/do-not-sell">
            Do Not Sell or Share My Personal Information
          </Link>
          . We honor Global Privacy Control (GPC) as an opt-out of sale/share.
        </Section>

        <Section title="5. Sensitive data consent">
          Disability type is health information. We collect it only after you check an affirmative box. Colorado, Virginia,
          Connecticut, Texas, Oregon, and similar laws require opt-in for sensitive data. Washington’s My Health My Data
          Act additionally regulates consumer health data — we treat Washington residents’ disability intake as MHMDA
          consumer health data: no geofencing of health facilities, no sale without separate consent.
        </Section>

        <Section title="6. TCPA, telemarketing, and DNC">
          Phone numbers are collected for campaign follow-up. Autodialed/prerecorded calls and texts require prior express
          written consent, captured with an unchecked checkbox, E-SIGN language, and the exact disclosure adjacent to
          submit. Consent is not a condition of receiving information — you may call us instead. We will maintain an
          internal do-not-call list and scrub against the National DNC Registry before outbound campaigns, as required by
          the FTC (refresh at least every 31 days). Reply STOP to texts. State mini-TCPA statutes (including Florida and
          Oklahoma) also apply.
        </Section>

        <Section title="7. Your rights">
          Depending on your state, you may have rights to: confirm processing; access; correct; delete; portability; opt
          out of sale, sharing, and targeted advertising; opt out of certain profiling; limit use of sensitive personal
          information (California); appeal a denied request; and non-discrimination. Submit{" "}
          <Link className="font-semibold text-navy underline" to="/privacy-request">
            a privacy request
          </Link>{" "}
          or email {SITE.privacyEmail}. We will verify you (matching name + phone/email we already have) and respond within
          45 days (or the shorter period your state requires), with one 45-day extension if reasonably necessary. Authorized
          agents: CA and several other states allow them; we will verify the agent and, where required, your signed
          permission.
        </Section>

        <Section title="8. Retention">
          Screening forms and TCPA consent logs: until the campaign follow-up is complete, then up to 5 years (TCPA
          limitations often run 4 years under 28 U.S.C. § 1658). Privacy requests: 2 years. Server logs: 13 months. If
          HubSpot or another CRM is connected later, that system’s retention schedule will be added here.
        </Section>

        <Section title="9. Security">
          TLS in transit, access limited to campaign staff and processors, and vendor diligence. No method is 100% secure.
          Massachusetts 201 CMR 17.00-style reasonable security is our baseline nationwide, plus NY SHIELD and similar
          “reasonable safeguards” statutes.
        </Section>

        <Section title="10. Federal overlay">
          TCPA (47 U.S.C. § 227) and FCC rules; CAN-SPAM for commercial email; E-SIGN / UETA for electronic signatures;
          COPPA (we do not target children); FTC Act § 5; Social Security Act § 1140 (no false SSA affiliation); 20 CFR Part
          404 Subpart R if we or a partner acts as an appointed representative. There is no comprehensive federal consumer
          privacy statute as of 2026.
        </Section>

        <Section title="11. Cookies">
          See our <Link className="font-semibold text-navy underline" to="/cookies">Cookie Policy</Link>. Strictly necessary
          cookies run always. Analytics cookies wait for Accept or are skipped if GPC is present.
        </Section>

        <Section title="12. International">
          This site is directed at U.S. residents. If you access it from abroad, you understand we process in the United
          States.
        </Section>

        <Section title="13. Changes">
          We will post updates here and change the effective date. Material changes to sensitive-data uses will require a
          new consent where law demands it.
        </Section>

        <h2 className="text-2xl font-extrabold text-navy">14. State-by-state addendum</h2>
        <p>
          Every U.S. state has a data-breach notification law. Twenty-plus states now have comprehensive consumer privacy
          codes; others rely on UDAP, sectoral, biometric, health, and recording statutes. The following is our 50-state +
          D.C. notice. Rights listed apply when statutory thresholds are met; we still accept requests from residents of
          every state as a matter of policy.
        </p>
        <div className="divide-y divide-border rounded-xl border border-border">
          {STATE_PRIVACY.map((s) => (
            <section key={s.abbr} className="p-4">
              <h3 className="font-bold text-navy">
                {s.name} ({s.abbr})
              </h3>
              <p className="mt-1">
                <span className="font-semibold text-ink">Comprehensive law: </span>
                {s.comprehensive}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-ink">Breach notice: </span>
                {s.breach}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-ink">Other: </span>
                {s.extra}
              </p>
            </section>
          ))}
        </div>
        <p className="text-xs">
          This addendum is educational compliance mapping, not a guarantee that every statutory threshold is triggered for
          our operation. When a law does not yet apply, we still offer access, deletion, and opt-out.
        </p>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-extrabold text-navy">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

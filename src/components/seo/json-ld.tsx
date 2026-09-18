import { SITE, SSA_DISCLAIMER } from "@/lib/site";
import { FAQS } from "@/lib/ssdi";

export function JsonLd() {
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "NGO"],
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    description: SITE.description,
    areaServed: "US",
    slogan: SITE.tagline,
    disambiguatingDescription: SSA_DISCLAIMER,
  };
  if (SITE.phoneProvisioned && SITE.phoneTel) {
    org.telephone = SITE.phoneTel;
    org.contactPoint = {
      "@type": "ContactPoint",
      telephone: SITE.phoneTel,
      contactType: "customer support",
      areaServed: "US",
      availableLanguage: ["English"],
    };
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/faq`,
      "query-input": "required name=search_term_string",
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "SSDI eligibility screening and campaign assistance",
    provider: { "@type": "Organization", name: SITE.name },
    areaServed: { "@type": "Country", name: "United States" },
    audience: { "@type": "Audience", geographicArea: { "@type": "Country", name: "United States" } },
    serviceType: "Disability benefits education and application navigation",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
    </>
  );
}

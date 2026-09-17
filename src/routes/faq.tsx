import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/page-hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { pageHead } from "@/lib/seo";
import { FAQS } from "@/lib/ssdi";

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead({
      title: "SSDI FAQ",
      description:
        "Answers about SSDI work credits, SGA, waiting periods, Medicare, denials, appeals, fees, and whether this site is SSA.",
      path: "/faq",
    }),
  component: Page,
});

function Page() {
  return (
    <main id="main">
      <PageHero
        kicker="FAQ"
        title="Common SSDI questions"
        lede="Plain-language answers drawn from SSA rules. Not legal advice and not a decision on your claim."
      />
      <div className="container-page max-w-3xl py-14">
        <Accordion type="single" collapsible defaultValue="item-0">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  );
}

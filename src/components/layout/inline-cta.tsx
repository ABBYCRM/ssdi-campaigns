import { ContactCtas } from "@/components/layout/contact-ctas";
import { cn } from "@/lib/utils";

/** Mid-article CTA strip — same visual language as heroes and the end band. */
export function InlineCta({
  title = "Talk with a campaign specialist",
  lede = "Call +1 (561) 652-0362, start a screening, or email Intake@abbycrm.com. Independent campaign — not SSA.",
  className,
}: {
  title?: string;
  lede?: string;
  className?: string;
}) {
  return (
    <aside
      className={cn("rounded-xl border border-border bg-sky p-5 shadow-soft sm:p-6", className)}
      aria-label="Contact SSDI Campaigns"
    >
      <h2 className="text-lg font-extrabold text-navy sm:text-xl">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{lede}</p>
      <ContactCtas className="mt-4" compact />
    </aside>
  );
}

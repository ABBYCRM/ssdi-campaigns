import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-10 shrink-0", className)}
      role="img"
      aria-label="SSDI Campaigns"
    >
      <circle cx="24" cy="24" r="23" fill="#3AA8A0" />
      <circle cx="24" cy="24" r="19.5" fill="#FFF8EE" />
      <circle cx="15.5" cy="18.5" r="4" fill="#C45A2A" />
      <path d="M9.6 32.2c.5-5 3-7.7 5.9-7.7s5.4 2.7 5.9 7.7" fill="#C45A2A" />
      <circle cx="24" cy="16.6" r="4.4" fill="#4A2410" />
      <path d="M16.6 32.4c.7-5.6 3.5-8.6 7.4-8.6s6.7 3 7.4 8.6" fill="#4A2410" />
      <circle cx="32.5" cy="18.5" r="4" fill="#3AA8A0" />
      <path d="M26.6 32.2c.5-5 3-7.7 5.9-7.7s5.4 2.7 5.9 7.7" fill="#3AA8A0" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-10" />
      <span className="font-display whitespace-nowrap text-sm font-semibold uppercase leading-none tracking-[0.08em] text-navy sm:text-base">
        SSDI Campaigns
      </span>
    </span>
  );
}

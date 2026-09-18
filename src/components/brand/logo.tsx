import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-10 shrink-0", className)}
      role="img"
      aria-label="SSDI Campaigns"
    >
      <circle cx="24" cy="24" r="23" fill="#0B2A4A" />
      <path d="M6 34c4 7 12 11 18 11s14-4 18-11" fill="#C8102E" />
      <path d="M8 36c4 6 11 9 16 9s12-3 16-9" fill="#E85A32" opacity="0.9" />
      <circle cx="16.5" cy="18" r="4.1" fill="#F4F8FC" />
      <path d="M10.4 31.2c.6-5.2 3.2-8 6.1-8s5.5 2.8 6.1 8" fill="#F4F8FC" />
      <circle cx="24" cy="16.2" r="4.4" fill="#FFFFFF" />
      <path d="M16.8 32c.7-5.8 3.6-8.8 7.2-8.8s6.5 3 7.2 8.8" fill="#FFFFFF" />
      <circle cx="31.6" cy="18" r="4.1" fill="#E8F4FC" />
      <path d="M25.4 31.2c.6-5.2 3.2-8 6.2-8s5.5 2.8 6.1 8" fill="#E8F4FC" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-9" />
      <span className="whitespace-nowrap text-sm font-extrabold tracking-[0.06em] text-navy uppercase leading-none sm:text-[0.95rem]">
        SSDI Campaigns
      </span>
    </span>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 items-center justify-center overflow-hidden rounded-[10px] bg-brand-gradient shadow-brand",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17 L5 7 L12 14 L19 7 L19 17" />
        <circle cx="12" cy="14" r="1.2" fill="white" stroke="none" />
      </svg>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
    </span>
  );
}

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark className="transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105" />
      {withText && (
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Need<span className="text-white/40">to</span>Solution
        </span>
      )}
    </Link>
  );
}

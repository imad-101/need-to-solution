import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex size-7 items-center justify-center rounded-md bg-pine-700", className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17 L5 7 L12 14 L19 7 L19 17" />
      </svg>
    </span>
  );
}

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {withText && <span className="font-serif-display text-[17px] text-ink">NeedToSolution</span>}
    </Link>
  );
}

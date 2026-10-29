import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, className, dot }: { children: ReactNode; className?: string; dot?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-5",
        className ?? "border-line bg-canvas text-ink-2",
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dot)} />}
      {children}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-ink-2", className)}>
      {children}
    </span>
  );
}

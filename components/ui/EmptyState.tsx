import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass relative flex flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-14 text-center",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-30 mask-fade-b" />
      {icon && (
        <div className="relative mb-4 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-200">
          {icon}
        </div>
      )}
      <h3 className="relative text-base font-semibold text-white">{title}</h3>
      {description && <p className="relative mt-1.5 max-w-sm text-sm text-white/50">{description}</p>}
      {action && <div className="relative mt-5">{action}</div>}
    </div>
  );
}

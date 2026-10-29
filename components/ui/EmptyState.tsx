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
    <div className={cn("card flex flex-col items-center justify-center border-dashed px-6 py-14 text-center", className)}>
      {icon && <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-canvas text-ink-2">{icon}</div>}
      <h3 className="text-base font-medium text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

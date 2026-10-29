import { cn } from "@/lib/utils";

export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-ink-3">{label}</span>
          <span className="tabular font-medium text-ink-2">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
        <div className="h-full rounded-full bg-pine-600 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

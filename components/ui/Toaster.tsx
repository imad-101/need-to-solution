"use client";

import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { usePlatform } from "@/lib/store";

const icons = {
  success: <CheckCircle2 className="size-4 text-pine-600" />,
  info: <Info className="size-4 text-blue-600" />,
  error: <AlertTriangle className="size-4 text-red-600" />,
};

export function Toaster() {
  const { toasts, dismissToast } = usePlatform();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-[0_12px_32px_-12px_rgba(27,27,25,0.25)] animate-fade-in"
        >
          <span className="mt-0.5">{icons[t.tone ?? "info"]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-ink-3">{t.description}</p>}
          </div>
          <button onClick={() => dismissToast(t.id)} className="text-ink-4 hover:text-ink" aria-label="Dismiss">
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

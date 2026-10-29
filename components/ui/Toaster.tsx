"use client";

import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { usePlatform } from "@/lib/store";
import { cn } from "@/lib/utils";

const icons = {
  success: <CheckCircle2 className="size-4 text-emerald-300" />,
  info: <Info className="size-4 text-sky-300" />,
  error: <AlertTriangle className="size-4 text-rose-300" />,
};

export function Toaster() {
  const { toasts, dismissToast } = usePlatform();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] animate-fade-up",
          )}
        >
          <span className="mt-0.5">{icons[t.tone ?? "info"]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-white/55">{t.description}</p>}
          </div>
          <button onClick={() => dismissToast(t.id)} className="text-white/40 hover:text-white" aria-label="Dismiss">
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

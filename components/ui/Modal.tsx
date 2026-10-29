"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-[fade-up_0.25s_ease_both]"
      />
      <div
        className={cn(
          "glass-strong relative w-full overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] animate-fade-up max-h-[92vh] flex flex-col",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-2xl",
        )}
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 px-6 pt-6 pb-3">
          <div>
            {title && <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>}
            {description && <p className="mt-1 text-sm text-white/55">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="relative overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

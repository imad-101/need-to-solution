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
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-xl border border-line bg-surface shadow-[0_24px_60px_-20px_rgba(27,27,25,0.35)] animate-fade-in sm:rounded-xl",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-2xl",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            {title && <h2 className="font-serif-display text-xl text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-3 transition hover:bg-canvas hover:text-ink" aria-label="Close dialog">
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

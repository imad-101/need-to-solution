"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
  required,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink">
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </span>
        {hint && <span className="text-xs text-ink-3">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function TagInput({
  value,
  onChange,
  placeholder,
  suggestions = [],
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const v = raw.trim().replace(/,+$/, "");
    if (!v) return;
    if (value.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, v]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const remaining = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      <div className="field flex min-h-[42px] flex-wrap items-center gap-1.5 py-1.5">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-pine-100 bg-pine-50 px-2 py-0.5 text-xs text-pine-700">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="text-pine-600/70 hover:text-pine-800" aria-label={`Remove ${tag}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? "" : placeholder}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-4"
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remaining.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] text-ink-3 transition hover:border-ink-3 hover:text-ink"
            >
              <Plus className="size-3" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

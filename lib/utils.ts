import type { ProblemStatus, Urgency, PledgeType, Role } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function credentialId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand = (len: number) =>
    Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `NTS-${rand(4)}-${rand(4)}`;
}

export function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/* Status: subtle tinted chips with a solid dot */
export const statusStyles: Record<ProblemStatus, string> = {
  open: "bg-pine-50 text-pine-700 border-pine-100",
  forming: "bg-blue-50 text-blue-700 border-blue-50",
  "in-progress": "bg-amber-50 text-amber-700 border-amber-50",
  completed: "bg-canvas text-ink-2 border-line",
};

export const statusDot: Record<ProblemStatus, string> = {
  open: "bg-pine-500",
  forming: "bg-blue-600",
  "in-progress": "bg-amber-600",
  completed: "bg-ink-3",
};

export const urgencyStyles: Record<Urgency, string> = {
  low: "text-ink-3",
  medium: "text-amber-700",
  high: "text-red-600",
};

export const pledgeStyles: Record<PledgeType, string> = {
  funding: "bg-pine-50 text-pine-700 border-pine-100",
  mentorship: "bg-blue-50 text-blue-700 border-blue-50",
  resources: "bg-amber-50 text-amber-700 border-amber-50",
};

export const roleStyles: Record<Role, string> = {
  community: "bg-pine-50 text-pine-700 border-pine-100",
  student: "bg-blue-50 text-blue-700 border-blue-50",
  organization: "bg-rust-50 text-rust-700 border-rust-50",
};

export function pluralize(n: number, word: string, plural = `${word}s`) {
  return `${n} ${n === 1 ? word : plural}`;
}

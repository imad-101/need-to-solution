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

export const statusStyles: Record<ProblemStatus, string> = {
  open: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  forming: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  "in-progress": "bg-amber-400/10 text-amber-300 border-amber-400/20",
  completed: "bg-brand-400/15 text-brand-200 border-brand-400/30",
};

export const statusDot: Record<ProblemStatus, string> = {
  open: "bg-emerald-400",
  forming: "bg-sky-400",
  "in-progress": "bg-amber-400",
  completed: "bg-brand-300",
};

export const urgencyStyles: Record<Urgency, string> = {
  low: "text-white/50",
  medium: "text-amber-300",
  high: "text-rose-300",
};

export const pledgeStyles: Record<PledgeType, string> = {
  funding: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  mentorship: "bg-sky-400/10 text-sky-200 border-sky-400/20",
  resources: "bg-amber-400/10 text-amber-200 border-amber-400/20",
};

export const roleStyles: Record<Role, string> = {
  community: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  student: "bg-sky-400/10 text-sky-200 border-sky-400/20",
  organization: "bg-fuchsia-400/10 text-fuchsia-200 border-fuchsia-400/20",
};

export function pluralize(n: number, word: string, plural = `${word}s`) {
  return `${n} ${n === 1 ? word : plural}`;
}

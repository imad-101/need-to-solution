"use client";

import Link from "next/link";
import { BadgeCheck, Clock, ExternalLink } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import type { Credential } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function CredentialCard({ credential, className, showUser = false }: { credential: Credential; showUser?: boolean; className?: string }) {
  const { userById, problemById } = usePlatform();
  const problem = problemById(credential.problemId);
  const verifier = credential.verifiedBy === "platform" ? null : userById(credential.verifiedBy);
  const holder = userById(credential.userId);

  return (
    <div
      className={cn(
        "border-gradient relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600/30 via-ink-3 to-magenta-600/20 p-[1px]",
        className,
      )}
    >
      <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-ink-2/90 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-magenta-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-20 mask-fade-b" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Verified project experience</p>
              <p className="font-mono text-xs text-brand-200">{credential.id}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
            <BadgeCheck className="size-3.5" /> Verified
          </span>
        </div>

        {showUser && holder && (
          <div className="relative mt-5 flex items-center gap-3">
            <Avatar user={holder} size="md" />
            <div>
              <p className="text-sm font-semibold text-white">{holder.name}</p>
              <p className="text-xs text-white/50">{holder.headline}</p>
            </div>
          </div>
        )}

        <div className="relative mt-5">
          <p className="text-xs text-white/45">Role</p>
          <p className="text-lg font-semibold tracking-tight text-white">{credential.role}</p>
          {problem && (
            <Link href={`/problems/${problem.id}`} className="mt-1 inline-flex items-center gap-1 text-sm text-white/65 hover:text-white">
              {problem.title}
              <ExternalLink className="size-3.5" />
            </Link>
          )}
        </div>

        <div className="relative mt-4 flex flex-wrap gap-1.5">
          {credential.skills.map((s) => (
            <span key={s} className="rounded-md border border-brand-400/30 bg-brand-500/15 px-2 py-0.5 text-[11px] text-brand-100">
              {s}
            </span>
          ))}
        </div>

        <div className="relative mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-white/8 pt-4 text-xs text-white/55">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {credential.hours} hours · issued {formatDate(credential.issuedAt)}
            </p>
            <p>
              Verified by{" "}
              <span className="font-medium text-white/85">{verifier ? verifier.name : "NeedToSolution"}</span>
            </p>
          </div>
          <Link href={`/verify/${credential.id}`} className="font-medium text-brand-200 hover:text-white">
            Verify →
          </Link>
        </div>
      </div>
    </div>
  );
}

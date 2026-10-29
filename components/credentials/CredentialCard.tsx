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
    <div className={cn("card overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-line bg-canvas px-5 py-3">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <div className="leading-tight">
            <p className="label">Verified project experience</p>
            <p className="font-mono text-xs text-ink-2">{credential.id}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-pine-100 bg-pine-50 px-2 py-0.5 text-[11px] font-medium text-pine-700">
          <BadgeCheck className="size-3.5" /> Verified
        </span>
      </div>

      <div className="p-5">
        {showUser && holder && (
          <div className="mb-4 flex items-center gap-3">
            <Avatar user={holder} size="md" />
            <div>
              <p className="text-sm font-medium text-ink">{holder.name}</p>
              <p className="text-xs text-ink-3">{holder.headline}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-ink-3">Role</p>
        <p className="font-serif-display text-xl text-ink">{credential.role}</p>
        {problem && (
          <Link href={`/problems/${problem.id}`} className="mt-1 inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink hover:underline underline-offset-4">
            {problem.title}
            <ExternalLink className="size-3.5" />
          </Link>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {credential.skills.map((s) => (
            <span key={s} className="rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] text-ink-2">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4 text-xs text-ink-3">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {credential.hours} hours · issued {formatDate(credential.issuedAt)}
            </p>
            <p>
              Verified by <span className="font-medium text-ink">{verifier ? verifier.name : "NeedToSolution"}</span>
            </p>
          </div>
          <Link href={`/verify/${credential.id}`} className="font-medium text-pine-700 hover:underline underline-offset-4">
            Verify
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, Users, HandCoins, ArrowBigUp, Flame } from "lucide-react";
import { Badge, Chip } from "@/components/ui/Badge";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import type { Problem } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { cn, statusDot, statusStyles, pluralize } from "@/lib/utils";

export function ProblemCard({ problem, compact = false }: { problem: Problem; compact?: boolean }) {
  const { userById, teamsForProblem, pledgesForProblem, currentUser, toggleUpvote, state } = usePlatform();
  const author = userById(problem.submittedBy);
  const teams = teamsForProblem(problem.id);
  const pledges = pledgesForProblem(problem.id);
  const members = Array.from(new Set(teams.flatMap((t) => t.memberIds)))
    .map((id) => state.users.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => !!u);
  const openRoles = teams.reduce((n, t) => n + t.openRoles.length, 0);
  const upvoted = !!currentUser && problem.upvotes.includes(currentUser.id);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:bg-white/[0.05] hover:shadow-[0_30px_60px_-30px_rgba(124,58,237,0.6)]",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-brand-500/0 blur-3xl transition duration-500 group-hover:bg-brand-500/20" />

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusStyles[problem.status]} dot={statusDot[problem.status]}>
              {STATUS_LABEL[problem.status]}
            </Badge>
            <Badge>{problem.category}</Badge>
            {problem.urgency === "high" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-300">
                <Flame className="size-3.5" /> Urgent
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleUpvote(problem.id);
            }}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition",
              upvoted
                ? "border-brand-400/50 bg-brand-500/20 text-brand-100"
                : "border-white/10 text-white/60 hover:border-white/25 hover:text-white",
            )}
            aria-label="Upvote"
          >
            <ArrowBigUp className={cn("size-4", upvoted && "fill-current")} />
            {problem.upvotes.length}
          </button>
        </div>

        <Link href={`/problems/${problem.id}`} className="block focus:outline-none">
          <h3 className="text-balance text-lg font-semibold leading-snug tracking-tight text-white transition group-hover:text-brand-100 sm:text-xl">
            {problem.title}
          </h3>
          <p className={cn("mt-2 text-sm leading-relaxed text-white/55", compact ? "line-clamp-2" : "line-clamp-3")}>
            {problem.summary}
          </p>
        </Link>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {problem.needs.slice(0, compact ? 3 : 4).map((n) => (
            <Chip key={n}>{n}</Chip>
          ))}
          {problem.needs.length > (compact ? 3 : 4) && (
            <Chip className="text-white/45">+{problem.needs.length - (compact ? 3 : 4)}</Chip>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{problem.location}</span>
            </span>
            <span className="shrink-0">{problem.impact}</span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
            <div className="flex items-center gap-2.5">
              {author && <Avatar user={author} size="sm" />}
              <div className="leading-tight">
                <p className="text-xs font-medium text-white/85">{author?.name ?? "Community member"}</p>
                <p className="text-[11px] text-white/45">Submitted this</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/55">
              {members.length > 0 ? (
                <AvatarStack users={members} max={3} size="xs" />
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> No team yet
                </span>
              )}
              {pledges.length > 0 && (
                <span className="inline-flex items-center gap-1 text-emerald-300/80">
                  <HandCoins className="size-3.5" /> {pledges.length}
                </span>
              )}
            </div>
          </div>
          {openRoles > 0 && (
            <p className="mt-3 text-[11px] font-medium text-sky-300/90">
              {pluralize(openRoles, "open role")} on {pluralize(teams.length, "team")}
            </p>
          )}
        </div>
      </div>
      <Link
        href={`/problems/${problem.id}`}
        aria-label={`Open ${problem.title}`}
        className="absolute right-4 top-4 hidden size-8 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg transition group-hover:opacity-100 sm:flex translate-y-10"
      >
        <ArrowUpRight className="size-4" />
      </Link>
    </article>
  );
}

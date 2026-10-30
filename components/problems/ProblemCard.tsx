"use client";

import Link from "next/link";
import { MapPin, Users, HandCoins, ArrowBigUp, Flame } from "lucide-react";
import { Badge, Chip } from "@/components/ui/Badge";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import type { Problem } from "@/lib/types";
import { REVIEW_LABEL, STATUS_LABEL } from "@/lib/types";
import { cn, reviewDot, reviewStyles, statusDot, statusStyles, pluralize } from "@/lib/utils";

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
    <article className="card card-hover card-accent group flex h-full flex-col">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {problem.reviewStatus !== "approved" && (
              <Badge className={reviewStyles[problem.reviewStatus]} dot={reviewDot[problem.reviewStatus]}>
                {REVIEW_LABEL[problem.reviewStatus]}
              </Badge>
            )}
            <Badge className={statusStyles[problem.status]} dot={statusDot[problem.status]}>
              {STATUS_LABEL[problem.status]}
            </Badge>
            <Badge>{problem.category}</Badge>
            {problem.urgency === "high" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600">
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
              "tabular inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition active:scale-90",
              upvoted ? "border-pine-600 bg-pine-50 text-pine-700" : "border-line text-ink-3 hover:border-ink-3 hover:text-ink",
            )}
            aria-label="Upvote"
          >
            <ArrowBigUp className={cn("size-4", upvoted && "animate-pop fill-current")} />
            {problem.upvotes.length}
          </button>
        </div>

        <Link href={`/problems/${problem.id}`} className="block focus:outline-none">
          <h3 className="font-serif-display text-balance text-[1.2rem] leading-snug text-ink group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
            {problem.title}
          </h3>
          <p className={cn("mt-2 text-sm leading-relaxed text-ink-2", compact ? "line-clamp-2" : "line-clamp-3")}>{problem.summary}</p>
        </Link>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {problem.needs.slice(0, compact ? 3 : 4).map((n) => (
            <Chip key={n}>{n}</Chip>
          ))}
          {problem.needs.length > (compact ? 3 : 4) && <Chip className="text-ink-3">+{problem.needs.length - (compact ? 3 : 4)}</Chip>}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 text-xs text-ink-3">
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{problem.location}</span>
            </span>
            <span className="shrink-0">{problem.impact}</span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
            <div className="flex items-center gap-2.5">
              {author && <Avatar user={author} size="sm" />}
              <div className="leading-tight">
                <p className="text-xs font-medium text-ink">{author?.name ?? "Community member"}</p>
                <p className="text-[11px] text-ink-3">Submitted this</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-3">
              {members.length > 0 ? (
                <AvatarStack users={members} max={3} size="xs" />
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> No team yet
                </span>
              )}
              {pledges.length > 0 && (
                <span className="inline-flex items-center gap-1 text-pine-700">
                  <HandCoins className="size-3.5" /> {pledges.length}
                </span>
              )}
            </div>
          </div>
          {openRoles > 0 && (
            <p className="mt-3 text-[11px] font-medium text-blue-700">
              {pluralize(openRoles, "open role")} on {pluralize(teams.length, "team")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, Users } from "lucide-react";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePlatform } from "@/lib/store";
import { STATUS_LABEL } from "@/lib/types";
import { formatDate, statusDot, statusStyles } from "@/lib/utils";

export function TeamsBrowser() {
  const { state, currentUser, openAuth } = usePlatform();
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);

  const teams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.teams
      .map((t) => ({ team: t, problem: state.problems.find((p) => p.id === t.problemId)! }))
      .filter(({ problem }) => !!problem)
      .filter(({ team, problem }) => (onlyOpen ? team.openRoles.length > 0 && problem.status !== "completed" : true))
      .filter(({ team, problem }) => (q ? [team.name, team.pitch, problem.title, problem.location, ...team.openRoles].join(" ").toLowerCase().includes(q) : true))
      .sort((a, b) => b.team.openRoles.length - a.team.openRoles.length || b.team.createdAt.localeCompare(a.team.createdAt));
  }, [state.teams, state.problems, query, onlyOpen]);

  const mine = currentUser ? state.teams.filter((t) => t.memberIds.includes(currentUser.id)) : [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search teams, roles, problems" className="field pl-9" />
        </div>
        <label className="inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-sm text-ink-2">
          <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} className="accent-pine-700" />
          Recruiting only
        </label>
      </div>

      {mine.length > 0 && (
        <div className="mt-5 rounded-md border border-pine-100 bg-pine-50 px-4 py-3 text-sm text-pine-800">
          You are on {mine.length} {mine.length === 1 ? "team" : "teams"}:{" "}
          {mine.map((t, i) => (
            <span key={t.id}>
              <Link href={`/problems/${t.problemId}`} className="font-medium underline underline-offset-4">
                {t.name}
              </Link>
              {i < mine.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      )}

      {teams.length === 0 ? (
        <EmptyState
          className="mt-5"
          icon={<Users className="size-5" />}
          title="No teams match"
          description="Start your own team on any open problem and define the roles you need."
          action={<Button href="/problems?status=open">Browse open problems</Button>}
        />
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {teams.map(({ team, problem }) => {
            const members = team.memberIds.map((id) => state.users.find((u) => u.id === id)).filter((u): u is NonNullable<typeof u> => !!u);
            const lead = state.users.find((u) => u.id === team.leadId);
            const isMember = !!currentUser && team.memberIds.includes(currentUser.id);
            return (
              <article key={team.id} className="card card-hover flex flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <Badge className={statusStyles[problem.status]} dot={statusDot[problem.status]}>
                    {STATUS_LABEL[problem.status]}
                  </Badge>
                  <span className="text-xs text-ink-3">Formed {formatDate(team.createdAt)}</span>
                </div>
                <h3 className="font-serif-display mt-4 text-xl text-ink">{team.name}</h3>
                <Link href={`/problems/${problem.id}`} className="mt-1 inline-flex items-center gap-1 text-sm text-pine-700 hover:underline underline-offset-4">
                  {problem.title} <ArrowUpRight className="size-3.5" />
                </Link>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{team.pitch}</p>

                <div className="mt-5 flex items-center gap-2.5">
                  <AvatarStack users={members} max={4} size="sm" />
                  <span className="text-xs text-ink-3">
                    {members.length} {members.length === 1 ? "member" : "members"}
                    {lead && <> · led by {lead.name.split(" ")[0]}</>}
                  </span>
                </div>

                <div className="mt-5 border-t border-line pt-4">
                  <p className="label">Open roles</p>
                  {team.openRoles.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-3">Team is full.</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {team.openRoles.map((r) => (
                        <span key={r} className="rounded-md border border-dashed border-blue-600/40 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  {lead && (
                    <div className="flex items-center gap-2">
                      <Avatar user={lead} size="xs" />
                      <span className="text-xs text-ink-3">{lead.headline}</span>
                    </div>
                  )}
                  {isMember ? (
                    <span className="text-xs font-medium text-pine-700">You&apos;re on this team</span>
                  ) : team.openRoles.length > 0 && problem.status !== "completed" ? (
                    currentUser?.role === "student" ? (
                      <Button size="sm" href={`/problems/${problem.id}`}>
                        View and join
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => openAuth("student")}>
                        Join as student
                      </Button>
                    )
                  ) : (
                    <Button size="sm" variant="ghost" href={`/problems/${problem.id}`}>
                      View project
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

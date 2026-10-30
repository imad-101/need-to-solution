"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, Check, ChevronDown, Clock, FileText, Inbox, ShieldCheck, Users, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePlatform } from "@/lib/store";
import { REVIEW_LABEL, ROLE_LABEL, STATUS_LABEL, type Problem, type ReviewStatus } from "@/lib/types";
import { cn, formatDate, reviewDot, reviewStyles, roleStyles, statusDot, statusStyles, urgencyStyles } from "@/lib/utils";

type Tab = ReviewStatus | "all";

export function AdminDashboard() {
  const { currentUser, openAuth, state } = usePlatform();
  const [tab, setTab] = useState<Tab>("pending");

  const counts = useMemo(
    () => ({
      pending: state.problems.filter((p) => p.reviewStatus === "pending").length,
      approved: state.problems.filter((p) => p.reviewStatus === "approved").length,
      rejected: state.problems.filter((p) => p.reviewStatus === "rejected").length,
      all: state.problems.length,
    }),
    [state.problems],
  );

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={<ShieldCheck className="size-5" />}
          title="Administrators only"
          description={currentUser ? `You are signed in as ${currentUser.name}, who is not an administrator.` : "Sign in with an administrator account to review submitted problems."}
          action={
            currentUser ? (
              <Button variant="outline" href="/dashboard">
                Go to your dashboard
              </Button>
            ) : (
              <Button onClick={() => openAuth()}>Sign in</Button>
            )
          }
        />
      </div>
    );
  }

  const list = state.problems
    .filter((p) => (tab === "all" ? true : p.reviewStatus === tab))
    .sort((a, b) => (tab === "pending" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));

  const usersByRole = (["community", "student", "organization"] as const).map((r) => ({ role: r, n: state.users.filter((u) => u.role === r).length }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div className="max-w-2xl">
          <p className="label flex items-center gap-2">
            <ShieldCheck className="size-3.5" /> Admin
          </p>
          <h1 className="font-serif-display mt-3 text-balance text-4xl text-ink sm:text-5xl">Review queue</h1>
          <p className="mt-4 text-pretty text-base text-ink-2 sm:text-[17px]">
            Every submitted problem waits here until you approve it. Approved problems go public immediately, and the submitter sees your decision on their dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar user={currentUser} />
          <div className="leading-tight">
            <p className="text-sm font-medium text-ink">{currentUser.name}</p>
            <p className="text-xs text-ink-3">{ROLE_LABEL.admin}</p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Clock className="size-4" />} label="Awaiting review" value={counts.pending} accent={counts.pending > 0} />
        <Stat icon={<FileText className="size-4" />} label="Public problems" value={counts.approved} />
        <Stat icon={<Users className="size-4" />} label="Accounts" value={state.users.length} hint={usersByRole.map((x) => `${x.n} ${x.role}`).join(" · ")} />
        <Stat icon={<BadgeCheck className="size-4" />} label="Certificates issued" value={state.credentials.length} />
      </dl>

      <div className="mt-10 flex flex-wrap gap-1 border-b border-line">
        {(["pending", "approved", "rejected", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition",
              tab === t ? "border-pine-700 font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink",
            )}
          >
            {t === "all" ? "All" : REVIEW_LABEL[t]}
            <span className={cn("tabular rounded-md px-1.5 py-0.5 text-[11px]", t === "pending" && counts.pending > 0 ? "bg-amber-50 text-amber-700" : "bg-canvas text-ink-3")}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Inbox className="size-5" />}
          title={tab === "pending" ? "Nothing waiting for review" : "No problems here"}
          description={tab === "pending" ? "New submissions will show up here the moment someone sends one." : "Switch tabs to see other submissions."}
        />
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((p) => (
            <ReviewCard key={p.id} problem={p} defaultOpen={tab === "pending" && list.length <= 3} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, hint, accent }: { icon: React.ReactNode; label: string; value: number; hint?: string; accent?: boolean }) {
  return (
    <div className={cn("p-5", accent ? "bg-amber-50" : "bg-surface")}>
      <div className="flex items-center gap-2">
        <span className={accent ? "text-amber-700" : "text-ink-2"}>{icon}</span>
        <dt className="label">{label}</dt>
      </div>
      <dd className="tabular mt-3 text-3xl font-medium text-ink">{value}</dd>
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

function ReviewCard({ problem, defaultOpen }: { problem: Problem; defaultOpen: boolean }) {
  const { userById, reviewProblem, busy } = usePlatform();
  const [open, setOpen] = useState(defaultOpen);
  const [note, setNote] = useState(problem.reviewNote ?? "");
  const author = userById(problem.submittedBy);
  const reviewer = problem.reviewedAt ? "an administrator" : null;

  return (
    <article className={cn("card overflow-hidden", problem.reviewStatus === "pending" && "border-amber-600/30")}>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-4 p-5 text-left transition hover:bg-canvas">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={reviewStyles[problem.reviewStatus]} dot={reviewDot[problem.reviewStatus]}>
              {REVIEW_LABEL[problem.reviewStatus]}
            </Badge>
            <Badge className={statusStyles[problem.status]} dot={statusDot[problem.status]}>
              {STATUS_LABEL[problem.status]}
            </Badge>
            <Badge>{problem.category}</Badge>
            <span className={cn("text-[11px] font-medium capitalize", urgencyStyles[problem.urgency])}>{problem.urgency} urgency</span>
          </div>
          <h3 className="font-serif-display mt-3 text-xl text-ink">{problem.title}</h3>
          <p className="mt-1 text-sm text-ink-3">
            {problem.location} · {problem.impact} · submitted {formatDate(problem.createdAt)}
            {author && (
              <>
                {" "}
                by <span className="text-ink-2">{author.name}</span>
              </>
            )}
          </p>
        </div>
        <ChevronDown className={cn("mt-1 size-5 shrink-0 text-ink-4 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-line bg-canvas/40 p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div>
              <p className="label">Summary</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{problem.summary}</p>
              <p className="label mt-5">Full description</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-2">{problem.description}</p>
              <p className="label mt-5">Help needed</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {problem.needs.map((n) => (
                  <Chip key={n}>{n}</Chip>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {author && (
                <div className="card p-4">
                  <p className="label">Submitted by</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar user={author} />
                    <div className="min-w-0">
                      <Link href={`/contributors/${author.id}`} className="block truncate text-sm font-medium text-ink hover:underline underline-offset-4">
                        {author.name}
                      </Link>
                      <p className="truncate text-xs text-ink-3">{author.headline}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-ink-3">
                    <Badge className={roleStyles[author.role]}>{ROLE_LABEL[author.role]}</Badge>
                    <span className="self-center">Joined {formatDate(author.joinedAt)}</span>
                  </div>
                </div>
              )}

              <div className="card p-4">
                <p className="label">Decision</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note to the submitter (shown on their dashboard)…"
                  className="field mt-3 min-h-[84px] resize-y text-sm"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button onClick={() => reviewProblem(problem.id, "approved", note)} disabled={busy || problem.reviewStatus === "approved"}>
                    <Check className="size-4" /> Approve
                  </Button>
                  <Button variant="danger" onClick={() => reviewProblem(problem.id, "rejected", note)} disabled={busy || problem.reviewStatus === "rejected"}>
                    <X className="size-4" /> Decline
                  </Button>
                </div>
                {problem.reviewedAt && reviewer && (
                  <p className="mt-3 text-[11px] text-ink-3">
                    Last decision {formatDate(problem.reviewedAt)} by {reviewer}.
                  </p>
                )}
                <Link href={`/problems/${problem.id}`} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-pine-700 hover:underline underline-offset-4">
                  Open the problem page <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

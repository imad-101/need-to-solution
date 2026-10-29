"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, Building2, HandCoins, GraduationCap, Package } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { usePlatform } from "@/lib/store";
import { PLEDGE_LABEL, STATUS_LABEL, type PledgeType } from "@/lib/types";
import { cn, formatMoney, pledgeStyles, statusDot, statusStyles } from "@/lib/utils";

const ways: Array<{ type: PledgeType; icon: React.ReactNode; title: string; body: string }> = [
  {
    type: "funding",
    icon: <HandCoins className="size-5" />,
    title: "Funding",
    body: "Micro-grants for materials, travel and stipends. Every dollar is tied to a named problem and a visible team.",
  },
  {
    type: "mentorship",
    icon: <GraduationCap className="size-5" />,
    title: "Mentorship",
    body: "Your experts review plans, unblock teams and verify the work at the end. A few hours a month changes outcomes.",
  },
  {
    type: "resources",
    icon: <Package className="size-5" />,
    title: "Resources",
    body: "Equipment, software, field staff, logistics. The things students cannot source alone.",
  },
];

export function OrgHub() {
  const { state, currentUser, openAuth } = usePlatform();

  const orgs = state.users.filter((u) => u.role === "organization");
  const needingSupport = useMemo(
    () =>
      state.problems
        .filter((p) => p.status !== "completed")
        .map((p) => ({ p, pledges: state.pledges.filter((x) => x.problemId === p.id).length }))
        .sort((a, b) => a.pledges - b.pledges || b.p.upvotes.length - a.p.upvotes.length)
        .slice(0, 6)
        .map((x) => x.p),
    [state.problems, state.pledges],
  );

  const totalFunding = state.pledges.reduce((n, p) => n + (p.amount ?? 0), 0);
  const myPledges = currentUser ? state.pledges.filter((p) => p.orgId === currentUser.id) : [];

  return (
    <div className="space-y-16">
      <section>
        <div className="grid gap-4 md:grid-cols-3">
          {ways.map((w) => (
            <div key={w.type} className="card p-6">
              <span className={cn("inline-flex rounded-md border p-2", pledgeStyles[w.type])}>{w.icon}</span>
              <h3 className="font-serif-display mt-4 text-xl text-ink">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{w.body}</p>
            </div>
          ))}
        </div>

        <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          <Stat label="Pledged so far" value={formatMoney(totalFunding)} />
          <Stat label="Active pledges" value={String(state.pledges.length)} />
          <Stat label="Partner organizations" value={String(orgs.length)} />
        </dl>

        <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 bg-canvas p-6">
          <div>
            <p className="text-base font-medium text-ink">{currentUser?.role === "organization" ? `Welcome back, ${currentUser.name}` : "Ready to back a project?"}</p>
            <p className="mt-1 text-sm text-ink-2">
              {currentUser?.role === "organization"
                ? `You have ${myPledges.length} active pledge${myPledges.length === 1 ? "" : "s"}. Find your next project below.`
                : "Create an organization account and pledge directly on any problem page."}
            </p>
          </div>
          {currentUser?.role === "organization" ? (
            <Button href="/dashboard">Open dashboard</Button>
          ) : (
            <Button onClick={() => openAuth("organization")}>
              <Building2 className="size-4" /> Join as an organization
            </Button>
          )}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="font-serif-display text-2xl text-ink">Projects that need backing</h2>
            <p className="mt-1 text-sm text-ink-3">Sorted by fewest pledges first, so support goes where it matters most.</p>
          </div>
          <Link href="/problems" className="hidden items-center gap-1 text-sm text-pine-700 hover:underline underline-offset-4 sm:inline-flex">
            All problems <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {needingSupport.map((p) => (
            <ProblemCard key={p.id} problem={p} compact />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif-display mb-5 border-b border-line pb-4 text-2xl text-ink">Organizations already here</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => {
            const pledges = state.pledges.filter((p) => p.orgId === org.id);
            const problems = Array.from(new Set(pledges.map((p) => p.problemId)))
              .map((id) => state.problems.find((p) => p.id === id))
              .filter((p): p is NonNullable<typeof p> => !!p);
            return (
              <div key={org.id} className="card p-5">
                <div className="flex items-center gap-3">
                  <Avatar user={org} size="lg" />
                  <div className="min-w-0">
                    <Link href={`/contributors/${org.id}`} className="block truncate text-base font-medium text-ink hover:underline underline-offset-4">
                      {org.name}
                    </Link>
                    <p className="truncate text-xs text-ink-3">
                      {org.orgType} · {org.location}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {Array.from(new Set(pledges.map((p) => p.type))).map((t) => (
                    <span key={t} className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide", pledgeStyles[t])}>
                      {PLEDGE_LABEL[t]}
                    </span>
                  ))}
                  {pledges.length === 0 && <span className="text-xs text-ink-3">New partner</span>}
                </div>
                <ul className="mt-4 divide-y divide-line">
                  {problems.slice(0, 3).map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                      <Link href={`/problems/${p.id}`} className="truncate text-ink-2 hover:text-ink">
                        {p.title}
                      </Link>
                      <Badge className={statusStyles[p.status]} dot={statusDot[p.status]}>
                        {STATUS_LABEL[p.status]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <button
            onClick={() => openAuth("organization")}
            className="card flex min-h-[200px] flex-col items-center justify-center border-dashed p-5 text-center text-ink-3 transition hover:border-ink-3 hover:text-ink"
          >
            <Building2 className="mb-3 size-6" />
            <span className="text-sm font-medium">Your organization here</span>
            <span className="mt-1 text-xs">Takes about a minute</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="label">{label}</dt>
      <dd className="tabular mt-1 text-2xl font-medium text-ink">{value}</dd>
    </div>
  );
}

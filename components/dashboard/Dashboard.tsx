"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Building2, GraduationCap, HandCoins, Plus, Users, FileText, Target, LayoutDashboard } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress } from "@/components/ui/Progress";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { usePlatform } from "@/lib/store";
import { PLEDGE_LABEL, ROLE_LABEL, STATUS_LABEL } from "@/lib/types";
import { cn, formatMoney, pledgeStyles, statusDot, statusStyles } from "@/lib/utils";

export function Dashboard() {
  const { currentUser, hydrated, openAuth } = usePlatform();

  if (!hydrated) {
    return <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6" />;
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={<LayoutDashboard className="size-5" />}
          title="Your dashboard lives here"
          description="Sign in to see your problems, teams, pledges and verified credentials in one place."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => openAuth()}>Sign in</Button>
              <Button variant="outline" href="/problems">
                Browse problems
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-8">
        <div className="flex items-center gap-4">
          <Avatar user={currentUser} size="xl" />
          <div>
            <p className="label">{ROLE_LABEL[currentUser.role]} dashboard</p>
            <h1 className="font-serif-display mt-1 text-3xl text-ink sm:text-4xl">{currentUser.name}</h1>
            <p className="mt-1 text-sm text-ink-3">
              {currentUser.headline} · {currentUser.location}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" href={`/contributors/${currentUser.id}`}>
            Public profile
          </Button>
          {currentUser.role === "community" && (
            <Button href="/submit">
              <Plus className="size-4" /> Submit a problem
            </Button>
          )}
          {currentUser.role === "student" && (
            <Button href="/teams">
              <Users className="size-4" /> Find a team
            </Button>
          )}
          {currentUser.role === "organization" && (
            <Button href="/organizations">
              <HandCoins className="size-4" /> Back a project
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {currentUser.role === "community" && <CommunityView />}
        {currentUser.role === "student" && <StudentView />}
        {currentUser.role === "organization" && <OrgView />}
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-surface p-5">
      <div className="flex items-center gap-2 text-ink-3">
        <span className="text-ink-2">{icon}</span>
        <span className="label">{label}</span>
      </div>
      <p className="tabular mt-3 text-3xl font-medium text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
      <h2 className="font-serif-display text-xl text-ink">{children}</h2>
      {right}
    </div>
  );
}

function CommunityView() {
  const { state, currentUser } = usePlatform();
  const me = currentUser!;
  const mine = state.problems.filter((p) => p.submittedBy === me.id);
  const teams = state.teams.filter((t) => mine.some((p) => p.id === t.problemId));
  const pledges = state.pledges.filter((pl) => mine.some((p) => p.id === pl.problemId));
  const backers = mine.reduce((n, p) => n + p.upvotes.length, 0);

  return (
    <div className="space-y-10">
      <StatGrid>
        <StatTile icon={<FileText className="size-4" />} label="Problems posted" value={mine.length} />
        <StatTile icon={<Users className="size-4" />} label="Teams working" value={teams.length} />
        <StatTile icon={<HandCoins className="size-4" />} label="Pledges received" value={pledges.length} hint={formatMoney(pledges.reduce((n, p) => n + (p.amount ?? 0), 0)) + " in funding"} />
        <StatTile icon={<Target className="size-4" />} label="Backers" value={backers} />
      </StatGrid>

      <section>
        <SectionTitle>Your problems</SectionTitle>
        {mine.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-5" />}
            title="You haven't posted a problem yet"
            description="Describe something your community is facing. Students and organizations are waiting for real challenges."
            action={<Button href="/submit">Submit a problem</Button>}
          />
        ) : (
          <div className="space-y-3">
            {mine.map((p) => {
              const t = state.teams.filter((x) => x.problemId === p.id);
              const pl = state.pledges.filter((x) => x.problemId === p.id);
              const done = p.milestones.filter((m) => m.done).length;
              return (
                <Link key={p.id} href={`/problems/${p.id}`} className="card card-hover block p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={statusStyles[p.status]} dot={statusDot[p.status]}>
                          {STATUS_LABEL[p.status]}
                        </Badge>
                        <Badge>{p.category}</Badge>
                      </div>
                      <h3 className="font-serif-display mt-3 text-lg text-ink">{p.title}</h3>
                      <p className="mt-1 text-sm text-ink-3">
                        {t.length} {t.length === 1 ? "team" : "teams"} · {pl.length} {pl.length === 1 ? "pledge" : "pledges"} · {p.upvotes.length} backers · {p.updates.length} updates
                      </p>
                    </div>
                    <ArrowUpRight className="size-5 text-ink-4" />
                  </div>
                  {p.milestones.length > 0 && <Progress className="mt-4" value={(done / p.milestones.length) * 100} label="Milestones" />}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StudentView() {
  const { state, currentUser } = usePlatform();
  const me = currentUser!;
  const teams = state.teams.filter((t) => t.memberIds.includes(me.id));
  const credentials = state.credentials.filter((c) => c.userId === me.id);
  const hours = credentials.reduce((n, c) => n + c.hours, 0);
  const active = teams.filter((t) => state.problems.find((p) => p.id === t.problemId)?.status !== "completed");
  const matches = state.problems
    .filter((p) => p.status !== "completed" && !teams.some((t) => t.problemId === p.id))
    .map((p) => ({ p, score: p.needs.filter((n) => me.skills.some((s) => n.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(n.toLowerCase().split(" ")[0]))).length }))
    .sort((a, b) => b.score - a.score || b.p.upvotes.length - a.p.upvotes.length)
    .slice(0, 3)
    .map((x) => x.p);

  return (
    <div className="space-y-10">
      <StatGrid>
        <StatTile icon={<Users className="size-4" />} label="Active teams" value={active.length} />
        <StatTile icon={<BadgeCheck className="size-4" />} label="Verified credentials" value={credentials.length} />
        <StatTile icon={<GraduationCap className="size-4" />} label="Verified hours" value={hours} />
        <StatTile icon={<Target className="size-4" />} label="Projects completed" value={new Set(credentials.map((c) => c.problemId)).size} />
      </StatGrid>

      <section>
        <SectionTitle>Your teams</SectionTitle>
        {teams.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title="You're not on a team yet"
            description="Join an existing team or start your own around a problem that matches your skills."
            action={<Button href="/teams">Find a team</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((t) => {
              const p = state.problems.find((x) => x.id === t.problemId)!;
              const done = p.milestones.filter((m) => m.done).length;
              return (
                <Link key={t.id} href={`/problems/${p.id}`} className="card card-hover block p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Badge className={statusStyles[p.status]} dot={statusDot[p.status]}>
                      {STATUS_LABEL[p.status]}
                    </Badge>
                    <span className="text-xs text-ink-3">{t.memberRoles[me.id]}</span>
                  </div>
                  <h3 className="font-serif-display mt-3 text-lg text-ink">{t.name}</h3>
                  <p className="mt-0.5 text-sm text-ink-3">{p.title}</p>
                  {p.milestones.length > 0 && <Progress className="mt-4" value={(done / p.milestones.length) * 100} label="Progress" />}
                  {t.openRoles.length > 0 && (
                    <p className="mt-3 text-xs text-blue-700">
                      {t.openRoles.length} open role{t.openRoles.length > 1 ? "s" : ""} still needed
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionTitle
          right={
            <Link href="/problems" className="text-sm text-pine-700 hover:underline underline-offset-4">
              See all
            </Link>
          }
        >
          Matched to your skills
        </SectionTitle>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((p) => (
            <ProblemCard key={p.id} problem={p} compact />
          ))}
        </div>
      </section>

      {credentials.length > 0 && (
        <section>
          <SectionTitle>Your verified experience</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {credentials.map((c) => (
              <CredentialCard key={c.id} credential={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrgView() {
  const { state, currentUser } = usePlatform();
  const me = currentUser!;
  const pledges = state.pledges.filter((p) => p.orgId === me.id);
  const problemIds = Array.from(new Set(pledges.map((p) => p.problemId)));
  const problems = problemIds.map((id) => state.problems.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);
  const verified = state.credentials.filter((c) => c.verifiedBy === me.id);
  const funding = pledges.reduce((n, p) => n + (p.amount ?? 0), 0);
  const people = new Set(state.teams.filter((t) => problemIds.includes(t.problemId)).flatMap((t) => t.memberIds)).size;
  const suggestions = state.problems
    .filter((p) => p.status !== "completed" && !problemIds.includes(p.id))
    .sort((a, b) => state.pledges.filter((x) => x.problemId === a.id).length - state.pledges.filter((x) => x.problemId === b.id).length)
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <StatGrid>
        <StatTile icon={<HandCoins className="size-4" />} label="Funding pledged" value={formatMoney(funding)} />
        <StatTile icon={<Building2 className="size-4" />} label="Projects backed" value={problems.length} />
        <StatTile icon={<Users className="size-4" />} label="Students supported" value={people} />
        <StatTile icon={<BadgeCheck className="size-4" />} label="Credentials verified" value={verified.length} />
      </StatGrid>

      <section>
        <SectionTitle>Projects you back</SectionTitle>
        {problems.length === 0 ? (
          <EmptyState
            icon={<HandCoins className="size-5" />}
            title="No pledges yet"
            description="Open any problem and pledge funding, mentorship or resources. Teams see it immediately."
            action={<Button href="/organizations">Find a project</Button>}
          />
        ) : (
          <div className="space-y-3">
            {problems.map((p) => {
              const mine = pledges.filter((x) => x.problemId === p.id);
              const teams = state.teams.filter((t) => t.problemId === p.id);
              const done = p.milestones.filter((m) => m.done).length;
              return (
                <Link key={p.id} href={`/problems/${p.id}`} className="card card-hover block p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusStyles[p.status]} dot={statusDot[p.status]}>
                          {STATUS_LABEL[p.status]}
                        </Badge>
                        {mine.map((pl) => (
                          <span key={pl.id} className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide", pledgeStyles[pl.type])}>
                            {PLEDGE_LABEL[pl.type]}
                            {pl.amount ? ` · ${formatMoney(pl.amount)}` : ""}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-serif-display mt-3 text-lg text-ink">{p.title}</h3>
                      <p className="mt-1 text-sm text-ink-3">
                        {teams.length} {teams.length === 1 ? "team" : "teams"} · {p.updates.length} updates · {p.location}
                      </p>
                    </div>
                    <ArrowUpRight className="size-5 text-ink-4" />
                  </div>
                  {p.milestones.length > 0 && <Progress className="mt-4" value={(done / p.milestones.length) * 100} label="Milestones" />}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Needs your kind of help</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((p) => (
            <ProblemCard key={p.id} problem={p} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

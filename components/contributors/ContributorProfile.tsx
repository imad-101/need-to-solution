"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { usePlatform } from "@/lib/store";
import { PLEDGE_LABEL, ROLE_LABEL, STATUS_LABEL } from "@/lib/types";
import { cn, formatDate, formatMoney, pledgeStyles, roleStyles, statusDot, statusStyles } from "@/lib/utils";

export function ContributorProfile({ id }: { id: string }) {
  const { state, currentUser } = usePlatform();
  const user = state.users.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState title="Profile not found" description="This person may have left or the link is wrong." action={<Button href="/problems">Browse problems</Button>} />
      </div>
    );
  }

  const credentials = state.credentials.filter((c) => c.userId === user.id);
  const teams = state.teams.filter((t) => t.memberIds.includes(user.id));
  const submitted = state.problems.filter((p) => p.submittedBy === user.id);
  const pledges = state.pledges.filter((p) => p.orgId === user.id);
  const verified = state.credentials.filter((c) => c.verifiedBy === user.id);
  const hours = credentials.reduce((n, c) => n + c.hours, 0);
  const isMe = currentUser?.id === user.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/problems" className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition hover:text-ink">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar user={user} size="xl" className="!size-24 !text-3xl" />
          <div className="min-w-0 flex-1">
            <Badge className={roleStyles[user.role]}>
              {ROLE_LABEL[user.role]}
              {user.orgType ? ` · ${user.orgType}` : ""}
            </Badge>
            <h1 className="font-serif-display mt-3 text-3xl text-ink sm:text-4xl">{user.name}</h1>
            <p className="mt-1 text-base text-ink-2">{user.headline}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {user.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" /> Joined {formatDate(user.joinedAt)}
              </span>
            </div>
          </div>
          {isMe && (
            <Button variant="outline" href="/dashboard">
              Open dashboard
            </Button>
          )}
        </div>
        {user.bio && <p className="mt-6 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-2">{user.bio}</p>}
        {user.skills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {user.skills.map((s) => (
              <Chip key={s} className="px-2.5 py-1 text-sm">
                {s}
              </Chip>
            ))}
          </div>
        )}
      </header>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        {user.role === "student" && (
          <>
            <Stat label="Verified credentials" value={credentials.length} />
            <Stat label="Verified hours" value={hours} />
            <Stat label="Teams joined" value={teams.length} />
          </>
        )}
        {user.role === "community" && (
          <>
            <Stat label="Problems submitted" value={submitted.length} />
            <Stat label="Teams mobilized" value={state.teams.filter((t) => submitted.some((p) => p.id === t.problemId)).length} />
            <Stat label="Completed projects" value={submitted.filter((p) => p.status === "completed").length} />
          </>
        )}
        {user.role === "organization" && (
          <>
            <Stat label="Funding pledged" value={formatMoney(pledges.reduce((n, p) => n + (p.amount ?? 0), 0))} />
            <Stat label="Projects backed" value={new Set(pledges.map((p) => p.problemId)).size} />
            <Stat label="Credentials verified" value={verified.length} />
          </>
        )}
      </dl>

      {user.role === "student" && (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2 border-b border-line pb-3">
            <BadgeCheck className="size-4 text-pine-600" />
            <h2 className="font-serif-display text-xl text-ink">Verified project experience</h2>
          </div>
          {credentials.length === 0 ? (
            <EmptyState
              icon={<Clock className="size-5" />}
              title="No credentials yet"
              description="Credentials are issued automatically when a project is marked complete, verified by the supporting organization."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {credentials.map((c) => (
                <CredentialCard key={c.id} credential={c} />
              ))}
            </div>
          )}
        </section>
      )}

      {teams.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif-display mb-4 border-b border-line pb-3 text-xl text-ink">Teams</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => {
              const p = state.problems.find((x) => x.id === t.problemId)!;
              return (
                <Link key={t.id} href={`/problems/${p.id}`} className="card card-hover p-5">
                  <div className="flex items-center justify-between">
                    <Badge className={statusStyles[p.status]} dot={statusDot[p.status]}>
                      {STATUS_LABEL[p.status]}
                    </Badge>
                    {t.leadId === user.id && <span className="label">Lead</span>}
                  </div>
                  <h3 className="mt-3 font-medium text-ink">{t.name}</h3>
                  <p className="mt-0.5 text-sm text-ink-3">{t.memberRoles[user.id]}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-ink-3">{p.title}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {submitted.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif-display mb-4 border-b border-line pb-3 text-xl text-ink">Problems submitted</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {submitted.map((p) => (
              <ProblemCard key={p.id} problem={p} compact />
            ))}
          </div>
        </section>
      )}

      {pledges.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif-display mb-4 border-b border-line pb-3 text-xl text-ink">Support provided</h2>
          <div className="space-y-3">
            {pledges.map((pl) => {
              const p = state.problems.find((x) => x.id === pl.problemId);
              return (
                <Link key={pl.id} href={`/problems/${pl.problemId}`} className="card card-hover flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p?.title}</p>
                    <p className="mt-0.5 text-xs text-ink-3">{pl.details}</p>
                  </div>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide", pledgeStyles[pl.type])}>
                    {PLEDGE_LABEL[pl.type]}
                    {pl.amount ? ` · ${formatMoney(pl.amount)}` : ""}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {verified.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif-display mb-4 border-b border-line pb-3 text-xl text-ink">Credentials this organization verified</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {verified.map((c) => (
              <CredentialCard key={c.id} credential={c} showUser />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="label">{label}</dt>
      <dd className="tabular mt-1 text-2xl font-medium text-ink">{value}</dd>
    </div>
  );
}

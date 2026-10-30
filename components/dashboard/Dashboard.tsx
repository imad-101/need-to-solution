"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress } from "@/components/ui/Progress";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { usePlatform } from "@/lib/store";
import { PLEDGE_LABEL, REVIEW_LABEL, ROLE_LABEL, STATUS_LABEL, type Problem, type Team } from "@/lib/types";
import { cn, formatMoney, pledgeStyles, reviewDot, reviewStyles, statusDot, statusStyles } from "@/lib/utils";

export function Dashboard() {
  const { currentUser, openAuth } = usePlatform();

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={<LayoutDashboard className="size-5" />}
          title="Your dashboard lives here"
          description="Sign in to see your problems, teams, pledges and certificates in one place."
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
              {currentUser.headline} · {currentUser.location} · {currentUser.email}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" href={`/contributors/${currentUser.id}`}>
            Public profile
          </Button>
          {currentUser.role === "admin" && (
            <Button href="/admin">
              <ShieldCheck className="size-4" /> Review queue
            </Button>
          )}
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
        {currentUser.role === "admin" && <AdminView />}
      </div>
    </div>
  );
}

/* ----------------------------- Shared pieces ----------------------------- */

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

function SectionTitle({ children, right, hint }: { children: React.ReactNode; right?: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
      <div>
        <h2 className="font-serif-display text-xl text-ink">{children}</h2>
        {hint && <p className="mt-0.5 text-sm text-ink-3">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

/** Problems the viewer submitted, with the review pipeline made visible. Shown to every role. */
function SubmittedProblems({ userId, always }: { userId: string; always?: boolean }) {
  const { state } = usePlatform();
  const mine = state.problems.filter((p) => p.submittedBy === userId);
  if (mine.length === 0 && !always) return null;

  return (
    <section>
      <SectionTitle
        hint="Every submission is reviewed by an administrator before it goes public."
        right={
          <Button size="sm" variant="outline" href="/submit">
            <Plus className="size-4" /> New problem
          </Button>
        }
      >
        Problems you submitted
      </SectionTitle>
      {mine.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" />}
          title="You haven't submitted a problem yet"
          description="Describe something your community is facing. Students and organizations are waiting for real challenges."
          action={<Button href="/submit">Submit a problem</Button>}
        />
      ) : (
        <div className="space-y-3">
          {mine.map((p) => {
            const t = state.teams.filter((x) => x.problemId === p.id);
            const pl = state.pledges.filter((x) => x.problemId === p.id);
            const done = p.milestones.filter((m) => m.done).length;
            const pending = p.reviewStatus === "pending";
            return (
              <Link key={p.id} href={`/problems/${p.id}`} className={cn("card card-hover block p-5", pending && "border-amber-600/30")}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={reviewStyles[p.reviewStatus]} dot={reviewDot[p.reviewStatus]}>
                        {REVIEW_LABEL[p.reviewStatus]}
                      </Badge>
                      {p.reviewStatus === "approved" && (
                        <Badge className={statusStyles[p.status]} dot={statusDot[p.status]}>
                          {STATUS_LABEL[p.status]}
                        </Badge>
                      )}
                      <Badge>{p.category}</Badge>
                    </div>
                    <h3 className="font-serif-display mt-3 text-lg text-ink">{p.title}</h3>
                    {p.reviewStatus === "approved" ? (
                      <p className="mt-1 text-sm text-ink-3">
                        {t.length} {t.length === 1 ? "team" : "teams"} · {pl.length} {pl.length === 1 ? "pledge" : "pledges"} · {p.upvotes.length} backers · {p.updates.length} updates
                      </p>
                    ) : pending ? (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-amber-700">
                        <Clock className="size-3.5" /> In the review queue. You will see it here the moment it is approved.
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-red-600">{p.reviewNote ? `Reviewer note: ${p.reviewNote}` : "Not approved. You can submit a revised version."}</p>
                    )}
                  </div>
                  <ArrowUpRight className="size-5 text-ink-4" />
                </div>
                {p.reviewStatus === "approved" && p.milestones.length > 0 && <Progress className="mt-4" value={(done / p.milestones.length) * 100} label="Milestones" />}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ProjectTile({ team, problem, me }: { team: Team; problem: Problem; me: string }) {
  const done = problem.milestones.filter((m) => m.done).length;
  return (
    <Link href={`/problems/${problem.id}`} className="card card-hover block p-5">
      <div className="flex items-center justify-between gap-3">
        <Badge className={statusStyles[problem.status]} dot={statusDot[problem.status]}>
          {STATUS_LABEL[problem.status]}
        </Badge>
        <span className="text-xs text-ink-3">{team.memberRoles[me]}</span>
      </div>
      <h3 className="font-serif-display mt-3 text-lg text-ink">{team.name}</h3>
      <p className="mt-0.5 text-sm text-ink-3">{problem.title}</p>
      {problem.status !== "completed" && problem.milestones.length > 0 && <Progress className="mt-4" value={(done / problem.milestones.length) * 100} label="Progress" />}
      {problem.status === "forming" && team.leadId === me && <p className="mt-3 text-xs text-pine-700">You lead this team. Start the project when the team is ready.</p>}
      {team.openRoles.length > 0 && problem.status !== "completed" && (
        <p className="mt-3 text-xs text-blue-700">
          {team.openRoles.length} open role{team.openRoles.length > 1 ? "s" : ""} still needed
        </p>
      )}
    </Link>
  );
}

/* ----------------------------- Community ----------------------------- */

function CommunityView() {
  const { state, currentUser } = usePlatform();
  const me = currentUser!;
  const mine = state.problems.filter((p) => p.submittedBy === me.id);
  const live = mine.filter((p) => p.reviewStatus === "approved");
  const teams = state.teams.filter((t) => live.some((p) => p.id === t.problemId));
  const pledges = state.pledges.filter((pl) => live.some((p) => p.id === pl.problemId));
  const pending = mine.filter((p) => p.reviewStatus === "pending").length;

  return (
    <div className="space-y-10">
      <StatGrid>
        <StatTile icon={<FileText className="size-4" />} label="Problems submitted" value={mine.length} hint={pending ? `${pending} awaiting review` : "All reviewed"} />
        <StatTile icon={<Users className="size-4" />} label="Teams working" value={teams.length} />
        <StatTile icon={<HandCoins className="size-4" />} label="Pledges received" value={pledges.length} hint={formatMoney(pledges.reduce((n, p) => n + (p.amount ?? 0), 0)) + " in funding"} />
        <StatTile icon={<Target className="size-4" />} label="Completed" value={live.filter((p) => p.status === "completed").length} />
      </StatGrid>
      <SubmittedProblems userId={me.id} always />
    </div>
  );
}

/* ----------------------------- Student ----------------------------- */

function StudentView() {
  const { state, currentUser } = usePlatform();
  const me = currentUser!;
  const teams = state.teams.filter((t) => t.memberIds.includes(me.id));
  const withProblem = teams
    .map((t) => ({ team: t, problem: state.problems.find((p) => p.id === t.problemId) }))
    .filter((x): x is { team: Team; problem: Problem } => !!x.problem);
  const ongoing = withProblem.filter((x) => x.problem.status !== "completed");
  const completed = withProblem.filter((x) => x.problem.status === "completed");
  const credentials = state.credentials.filter((c) => c.userId === me.id);
  const hours = credentials.reduce((n, c) => n + c.hours, 0);

  const skillMatch = (p: Problem) =>
    p.needs.filter((n) => me.skills.some((s) => n.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(n.toLowerCase().split(" ")[0]))).length;
  const available = state.problems
    .filter((p) => p.reviewStatus === "approved" && p.status !== "completed" && !teams.some((t) => t.problemId === p.id))
    .map((p) => ({ p, score: skillMatch(p) }))
    .sort((a, b) => b.score - a.score || b.p.upvotes.length - a.p.upvotes.length)
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <StatGrid>
        <StatTile icon={<Users className="size-4" />} label="Ongoing projects" value={ongoing.length} />
        <StatTile icon={<Target className="size-4" />} label="Completed projects" value={completed.length} />
        <StatTile icon={<BadgeCheck className="size-4" />} label="Certificates" value={credentials.length} />
        <StatTile icon={<GraduationCap className="size-4" />} label="Verified hours" value={hours} />
      </StatGrid>

      <section>
        <SectionTitle hint="Teams you are on whose project is still in motion.">Ongoing projects</SectionTitle>
        {ongoing.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title="Nothing in progress yet"
            description="Join an existing team or start your own around a problem that matches your skills."
            action={<Button href="/teams">Find a team</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ongoing.map(({ team, problem }) => (
              <ProjectTile key={team.id} team={team} problem={problem} me={me.id} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle hint="Each completed project comes with a certificate anyone can verify by its serial number.">Completed projects</SectionTitle>
        {completed.length === 0 ? (
          <EmptyState
            icon={<BadgeCheck className="size-5" />}
            title="No completed projects yet"
            description="When a project you worked on is marked complete, your certificate appears here with its serial number."
          />
        ) : (
          <div className="space-y-4">
            {completed.map(({ team, problem }) => {
              const cred = credentials.find((c) => c.problemId === problem.id);
              return (
                <div key={team.id} className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <ProjectTile team={team} problem={problem} me={me.id} />
                  {cred ? (
                    <CredentialCard credential={cred} />
                  ) : (
                    <div className="card flex items-center justify-center p-5 text-sm text-ink-3">Certificate pending</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionTitle
          hint="Open problems ranked by how well they match your skills."
          right={
            <Link href="/problems" className="link-underline inline-flex items-center gap-1 text-sm text-pine-700">
              Browse all <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          Available to you
        </SectionTitle>
        {available.length === 0 ? (
          <EmptyState icon={<Compass className="size-5" />} title="No open problems right now" description="Check back soon, or submit one yourself." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {available.map(({ p, score }) => (
              <div key={p.id} className="relative">
                {score > 0 && (
                  <span className="absolute -top-2 left-4 z-10 rounded-md border border-pine-100 bg-pine-50 px-2 py-0.5 text-[11px] font-medium text-pine-700">
                    Matches {score} of your skills
                  </span>
                )}
                <ProblemCard problem={p} compact />
              </div>
            ))}
          </div>
        )}
      </section>

      {credentials.length > 0 && (
        <section>
          <SectionTitle hint="Share a serial number with anyone; they can confirm it on the verify page.">Your certificates</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {credentials.map((c) => (
              <CredentialCard key={c.id} credential={c} />
            ))}
          </div>
        </section>
      )}

      <SubmittedProblems userId={me.id} />
    </div>
  );
}

/* ----------------------------- Organization ----------------------------- */

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
    .filter((p) => p.reviewStatus === "approved" && p.status !== "completed" && !problemIds.includes(p.id))
    .sort((a, b) => state.pledges.filter((x) => x.problemId === a.id).length - state.pledges.filter((x) => x.problemId === b.id).length)
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <StatGrid>
        <StatTile icon={<HandCoins className="size-4" />} label="Funding pledged" value={formatMoney(funding)} />
        <StatTile icon={<Building2 className="size-4" />} label="Projects backed" value={problems.length} />
        <StatTile icon={<Users className="size-4" />} label="Students supported" value={people} />
        <StatTile icon={<BadgeCheck className="size-4" />} label="Certificates verified" value={verified.length} />
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

      {verified.length > 0 && (
        <section>
          <SectionTitle>Certificates you verified</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {verified.map((c) => (
              <CredentialCard key={c.id} credential={c} showUser />
            ))}
          </div>
        </section>
      )}

      <SubmittedProblems userId={me.id} />
    </div>
  );
}

/* ----------------------------- Admin ----------------------------- */

function AdminView() {
  const { state, currentUser } = usePlatform();
  const pending = state.problems.filter((p) => p.reviewStatus === "pending");
  return (
    <div className="space-y-10">
      <StatGrid>
        <StatTile icon={<Clock className="size-4" />} label="Awaiting review" value={pending.length} />
        <StatTile icon={<FileText className="size-4" />} label="Public problems" value={state.problems.filter((p) => p.reviewStatus === "approved").length} />
        <StatTile icon={<Users className="size-4" />} label="Accounts" value={state.users.length} />
        <StatTile icon={<BadgeCheck className="size-4" />} label="Certificates issued" value={state.credentials.length} />
      </StatGrid>
      <section>
        <SectionTitle
          right={
            <Button size="sm" href="/admin">
              Open the review queue <ArrowRight className="size-4" />
            </Button>
          }
        >
          Waiting for you
        </SectionTitle>
        {pending.length === 0 ? (
          <EmptyState icon={<ShieldCheck className="size-5" />} title="The queue is empty" description="New submissions appear here as soon as they arrive." />
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((p) => (
              <Link key={p.id} href="/admin" className="card card-hover flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                  <p className="text-xs text-ink-3">
                    {p.category} · {p.location}
                  </p>
                </div>
                <Badge className={reviewStyles.pending} dot={reviewDot.pending}>
                  {REVIEW_LABEL.pending}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
      <SubmittedProblems userId={currentUser!.id} />
    </div>
  );
}

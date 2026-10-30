"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowBigUp,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flame,
  HandCoins,
  MapPin,
  MessageSquare,
  Plus,
  Rocket,
  Share2,
  Target,
  Users,
  UserPlus,
  LogOut,
} from "lucide-react";
import { Badge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Field, TagInput } from "@/components/ui/Field";
import { Progress } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/EmptyState";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { usePlatform } from "@/lib/store";
import { PLEDGE_LABEL, REVIEW_LABEL, STATUS_LABEL, type PledgeType, type Team } from "@/lib/types";
import { cn, formatDate, formatMoney, pledgeStyles, reviewDot, reviewStyles, statusDot, statusStyles, urgencyStyles } from "@/lib/utils";

export function ProblemDetail({ id }: { id: string }) {
  const platform = usePlatform();
  const { state, currentUser, toggleUpvote, notify, openAuth } = platform;
  const problem = state.problems.find((p) => p.id === id);
  const [teamModal, setTeamModal] = useState(false);
  const [pledgeModal, setPledgeModal] = useState(false);
  const [joinTarget, setJoinTarget] = useState<Team | null>(null);

  if (!problem) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState title="Problem not found" description="It may have been removed, or the link is wrong." action={<Button href="/problems">Browse problems</Button>} />
      </div>
    );
  }

  const author = state.users.find((u) => u.id === problem.submittedBy);
  const teams = state.teams.filter((t) => t.problemId === problem.id);
  const pledges = state.pledges.filter((p) => p.problemId === problem.id);
  const credentials = state.credentials.filter((c) => c.problemId === problem.id);
  const upvoted = !!currentUser && problem.upvotes.includes(currentUser.id);
  const isMember = !!currentUser && teams.some((t) => t.memberIds.includes(currentUser.id));
  const isLead = !!currentUser && teams.some((t) => t.leadId === currentUser.id);
  const isAuthor = currentUser?.id === problem.submittedBy;
  const isSupporter = !!currentUser && pledges.some((p) => p.orgId === currentUser.id);
  const isAdmin = currentUser?.role === "admin";
  const canPost = isMember || isAuthor || isSupporter || isAdmin;
  const approved = problem.reviewStatus === "approved";
  const doneCount = problem.milestones.filter((m) => m.done).length;
  const progress = problem.milestones.length ? (doneCount / problem.milestones.length) * 100 : 0;
  const totalFunding = pledges.reduce((n, p) => n + (p.amount ?? 0), 0);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: problem.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        notify({ title: "Link copied", tone: "success" });
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/problems" className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition hover:text-ink">
        <ArrowLeft className="size-4" /> All problems
      </Link>

      {!approved && (
        <div
          className={cn(
            "mt-6 flex flex-wrap items-start gap-3 rounded-lg border p-4 text-sm",
            problem.reviewStatus === "pending" ? "border-amber-600/30 bg-amber-50 text-amber-700" : "border-red-600/30 bg-red-50 text-red-600",
          )}
        >
          <div className="flex-1">
            <p className="font-medium">
              {problem.reviewStatus === "pending" ? "Waiting for an administrator to review this problem" : "This problem was not approved"}
            </p>
            <p className="mt-0.5 opacity-80">
              {problem.reviewStatus === "pending"
                ? "Only you can see it for now. Once approved it becomes public and teams can form around it."
                : problem.reviewNote || "No note was left by the reviewer. You can submit a revised version."}
            </p>
          </div>
          {isAdmin && problem.reviewStatus === "pending" && (
            <Button size="sm" href="/admin">
              Open review queue
            </Button>
          )}
        </div>
      )}

      {/* Header */}
      <header className="mt-6 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {!approved && (
            <Badge className={reviewStyles[problem.reviewStatus]} dot={reviewDot[problem.reviewStatus]}>
              {REVIEW_LABEL[problem.reviewStatus]}
            </Badge>
          )}
          <Badge className={statusStyles[problem.status]} dot={statusDot[problem.status]}>
            {STATUS_LABEL[problem.status]}
          </Badge>
          <Badge>{problem.category}</Badge>
          <span className={cn("inline-flex items-center gap-1 text-xs font-medium capitalize", urgencyStyles[problem.urgency])}>
            <Flame className="size-3.5" /> {problem.urgency} urgency
          </span>
        </div>
        <h1 className="font-serif-display mt-5 max-w-4xl text-balance text-3xl leading-[1.1] text-ink sm:text-5xl">{problem.title}</h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-ink-2 sm:text-lg">{problem.summary}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" /> {problem.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="size-4" /> {problem.impact}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" /> Posted {formatDate(problem.createdAt)}
          </span>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleUpvote(problem.id)}
            className={cn(
              "tabular inline-flex h-10 items-center gap-2 rounded-md border px-3.5 text-sm font-medium transition",
              upvoted ? "border-pine-600 bg-pine-50 text-pine-700" : "border-line-strong bg-surface text-ink-2 hover:border-ink-3 hover:text-ink",
            )}
          >
            <ArrowBigUp className={cn("size-5", upvoted && "fill-current")} />
            {problem.upvotes.length} {upvoted ? "Backed" : "Back this"}
          </button>
          {problem.status !== "completed" && approved && (
            <>
              <Button onClick={() => (currentUser?.role === "student" ? setTeamModal(true) : openAuth("student"))}>
                <Users className="size-4" /> Form a team
              </Button>
              <Button variant="outline" onClick={() => (currentUser?.role === "organization" ? setPledgeModal(true) : openAuth("organization"))}>
                <HandCoins className="size-4" /> Pledge support
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={share}>
            <Share2 className="size-4" /> Share
          </Button>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="space-y-8">
          <section>
            <h2 className="label mb-3">The situation</h2>
            <p className="max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{problem.description}</p>
            <div className="mt-6">
              <p className="label">Help needed</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {problem.needs.map((n) => (
                  <Chip key={n} className="px-2.5 py-1 text-sm">
                    {n}
                  </Chip>
                ))}
              </div>
            </div>
            {author && (
              <div className="card mt-6 flex items-center gap-3 p-4">
                <Avatar user={author} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink-3">Submitted by</p>
                  <Link href={`/contributors/${author.id}`} className="text-sm font-medium text-ink hover:underline underline-offset-4">
                    {author.name}
                  </Link>
                  <p className="truncate text-xs text-ink-3">
                    {author.headline} · {author.location}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Teams */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="label">
                Teams <span className="text-ink-4">({teams.length})</span>
              </h2>
              {problem.status !== "completed" && approved && currentUser?.role === "student" && !isMember && (
                <Button size="sm" variant="outline" onClick={() => setTeamModal(true)}>
                  <Plus className="size-4" /> New team
                </Button>
              )}
            </div>
            {teams.length === 0 ? (
              <EmptyState
                icon={<Users className="size-5" />}
                title="No team yet"
                description={approved ? "Start a team, define the roles you need, and other students can join you." : "Teams can form once the problem is approved."}
                action={
                  approved ? (
                    <Button onClick={() => (currentUser?.role === "student" ? setTeamModal(true) : openAuth("student"))}>
                      Form the first team
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <TeamCard key={team.id} team={team} onJoin={() => setJoinTarget(team)} completed={problem.status === "completed"} />
                ))}
              </div>
            )}
          </section>

          {/* Milestones */}
          {(problem.milestones.length > 0 || isMember) && (
            <section className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-medium text-ink">Milestones</h2>
                <span className="tabular text-sm text-ink-3">
                  {doneCount}/{problem.milestones.length} complete
                </span>
              </div>
              <Progress value={progress} className="mt-4" />
              <ul className="mt-4 divide-y divide-line">
                {problem.milestones.map((m) => (
                  <li key={m.id}>
                    <button
                      disabled={!isMember || problem.status === "completed"}
                      onClick={() => platform.toggleMilestone(problem.id, m.id)}
                      className={cn(
                        "flex w-full items-center gap-3 py-2.5 text-left text-sm transition",
                        isMember && problem.status !== "completed" && "hover:text-pine-700",
                        m.done ? "text-ink-3 line-through decoration-ink-4" : "text-ink",
                      )}
                    >
                      {m.done ? <CheckCircle2 className="size-[18px] text-pine-600" /> : <Circle className="size-[18px] text-ink-4" />}
                      {m.title}
                    </button>
                  </li>
                ))}
              </ul>
              {isMember && problem.status !== "completed" && <AddMilestone problemId={problem.id} />}
            </section>
          )}

          {/* Updates */}
          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-medium text-ink">Updates</h2>
            {problem.updates.length === 0 ? (
              <p className="mt-2 text-sm text-ink-3">No updates yet. Team members, the submitter and supporters can post here.</p>
            ) : (
              <ol className="mt-5 space-y-6 border-l border-line pl-5">
                {[...problem.updates].reverse().map((u) => {
                  const a = state.users.find((x) => x.id === u.authorId);
                  return (
                    <li key={u.id} className="relative">
                      <span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-pine-600 ring-4 ring-surface" />
                      <div className="flex items-center gap-2.5">
                        {a && <Avatar user={a} size="xs" />}
                        <p className="text-sm font-medium text-ink">{a?.name ?? "Unknown"}</p>
                        <span className="text-xs text-ink-3">{formatDate(u.createdAt)}</span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{u.text}</p>
                    </li>
                  );
                })}
              </ol>
            )}
            {canPost && problem.status !== "completed" && <PostUpdate problemId={problem.id} />}
          </section>

          {credentials.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <BadgeCheck className="size-4 text-pine-600" />
                <h2 className="label">Certificates issued</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {credentials.map((c) => (
                  <CredentialCard key={c.id} credential={c} showUser />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Lifecycle */}
          <div className="card p-5">
            <p className="label">Lifecycle</p>
            <ol className="mt-4 space-y-3">
              {(["open", "forming", "in-progress", "completed"] as const).map((s, i) => {
                const order = ["open", "forming", "in-progress", "completed"];
                const idx = order.indexOf(problem.status);
                const reached = i <= idx;
                const current = i === idx;
                return (
                  <li key={s} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "tabular flex size-6 items-center justify-center rounded-full border text-[11px] font-medium",
                        reached ? "border-pine-600 bg-pine-50 text-pine-700" : "border-line text-ink-4",
                        current && problem.status !== "completed" && "ring-2 ring-pine-100",
                      )}
                    >
                      {reached && !current ? <CheckCircle2 className="size-3.5" /> : i + 1}
                    </span>
                    <span className={cn("text-sm", reached ? "text-ink" : "text-ink-4")}>{STATUS_LABEL[s]}</span>
                  </li>
                );
              })}
            </ol>

            {(isLead || isAdmin) && problem.status === "forming" && (
              <Button className="mt-5 w-full" onClick={() => platform.startProject(problem.id)}>
                <Rocket className="size-4" /> Start the project
              </Button>
            )}
            {(isLead || isSupporter || isAuthor || isAdmin) && problem.status === "in-progress" && (
              <Button className="mt-5 w-full" onClick={() => platform.completeProject(problem.id)}>
                <BadgeCheck className="size-4" /> Mark complete and issue certificates
              </Button>
            )}
            {problem.status === "completed" && problem.completedAt && <p className="mt-4 text-xs text-ink-3">Completed {formatDate(problem.completedAt)}</p>}
          </div>

          {/* Support */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <p className="label">Support</p>
              {totalFunding > 0 && <span className="tabular text-sm font-medium text-pine-700">{formatMoney(totalFunding)}</span>}
            </div>
            {pledges.length === 0 ? (
              <p className="mt-3 text-sm text-ink-3">No organization has pledged yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {pledges.map((p) => {
                  const org = state.users.find((u) => u.id === p.orgId);
                  return (
                    <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        {org && <Avatar user={org} size="sm" />}
                        <div className="min-w-0 flex-1">
                          <Link href={`/contributors/${p.orgId}`} className="block truncate text-sm font-medium text-ink hover:underline underline-offset-4">
                            {org?.name}
                          </Link>
                        </div>
                        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide", pledgeStyles[p.type])}>
                          {PLEDGE_LABEL[p.type]}
                          {p.amount ? ` · ${formatMoney(p.amount)}` : ""}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-ink-2">{p.details}</p>
                    </li>
                  );
                })}
              </ul>
            )}
            {problem.status !== "completed" && approved && (
              <Button variant="outline" className="mt-4 w-full" onClick={() => (currentUser?.role === "organization" ? setPledgeModal(true) : openAuth("organization"))}>
                <HandCoins className="size-4" /> Pledge support
              </Button>
            )}
          </div>

          {/* Backers */}
          <div className="card p-5">
            <p className="label">Backed by</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {problem.upvotes.length === 0 && <p className="text-sm text-ink-3">Be the first to back this.</p>}
              {problem.upvotes
                .map((id) => state.users.find((u) => u.id === id))
                .filter((u): u is NonNullable<typeof u> => !!u)
                .map((u) => (
                  <Link key={u.id} href={`/contributors/${u.id}`} title={u.name}>
                    <Avatar user={u} size="sm" />
                  </Link>
                ))}
            </div>
          </div>
        </aside>
      </div>

      <CreateTeamModal open={teamModal} onClose={() => setTeamModal(false)} problemId={problem.id} needs={problem.needs} />
      <PledgeModal open={pledgeModal} onClose={() => setPledgeModal(false)} problemId={problem.id} />
      <JoinTeamModal team={joinTarget} onClose={() => setJoinTarget(null)} />
    </div>
  );
}

/* ----------------------------- Team card ----------------------------- */

function TeamCard({ team, onJoin, completed }: { team: Team; onJoin: () => void; completed: boolean }) {
  const { state, currentUser, leaveTeam, openAuth } = usePlatform();
  const members = team.memberIds.map((id) => state.users.find((u) => u.id === id)).filter((u): u is NonNullable<typeof u> => !!u);
  const isMember = !!currentUser && team.memberIds.includes(currentUser.id);
  const isLead = currentUser?.id === team.leadId;

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif-display text-xl text-ink">{team.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">{team.pitch}</p>
        </div>
        <span className="text-xs text-ink-3">Formed {formatDate(team.createdAt)}</span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="label">Members</p>
          <ul className="mt-3 space-y-2.5">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-2.5">
                <Avatar user={m} size="sm" />
                <div className="min-w-0 leading-tight">
                  <Link href={`/contributors/${m.id}`} className="block truncate text-sm font-medium text-ink hover:underline underline-offset-4">
                    {m.name}
                    {m.id === team.leadId && <span className="ml-1.5 rounded bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-ink-2">Lead</span>}
                  </Link>
                  <p className="truncate text-xs text-ink-3">{team.memberRoles[m.id]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label">Open roles</p>
          {team.openRoles.length === 0 ? (
            <p className="mt-3 text-sm text-ink-3">{completed ? "Project completed." : "Team is full for now."}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {team.openRoles.map((r) => (
                <li key={r} className="flex items-center justify-between gap-2 rounded-md border border-dashed border-blue-600/40 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  {r}
                  {!isMember && !completed && (
                    <button
                      onClick={() => (currentUser?.role === "student" ? onJoin() : openAuth("student"))}
                      className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/30 hover:bg-blue-50"
                    >
                      <UserPlus className="size-3.5" /> Join
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isMember && !isLead && !completed && (
        <div className="mt-5 flex justify-end">
          <Button size="sm" variant="danger" onClick={() => leaveTeam(team.id)}>
            <LogOut className="size-4" /> Leave team
          </Button>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Inline forms ----------------------------- */

function PostUpdate({ problemId }: { problemId: string }) {
  const { postUpdate, currentUser } = usePlatform();
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        postUpdate(problemId, text);
        setText("");
      }}
      className="mt-6 flex gap-3 border-t border-line pt-5"
    >
      {currentUser && <Avatar user={currentUser} size="sm" className="mt-1" />}
      <div className="flex-1">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share progress with the community…" className="field min-h-[80px] resize-y" />
        <div className="mt-2 flex justify-end">
          <Button size="sm" type="submit" disabled={!text.trim()}>
            <MessageSquare className="size-4" /> Post update
          </Button>
        </div>
      </div>
    </form>
  );
}

function AddMilestone({ problemId }: { problemId: string }) {
  const { addMilestone } = usePlatform();
  const [title, setTitle] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addMilestone(problemId, title);
        setTitle("");
      }}
      className="mt-4 flex gap-2"
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a milestone…" className="field" />
      <Button type="submit" variant="outline" disabled={!title.trim()}>
        <Plus className="size-4" />
      </Button>
    </form>
  );
}

/* ----------------------------- Modals ----------------------------- */

function CreateTeamModal({ open, onClose, problemId, needs }: { open: boolean; onClose: () => void; problemId: string; needs: string[] }) {
  const { createTeam } = usePlatform();
  const [name, setName] = useState("");
  const [pitch, setPitch] = useState("");
  const [myRole, setMyRole] = useState("");
  const [openRoles, setOpenRoles] = useState<string[]>([]);

  return (
    <Modal open={open} onClose={onClose} title="Form a team" description="Describe your approach and the roles you still need.">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const t = await createTeam(problemId, { name, pitch, openRoles, myRole });
          if (t) {
            onClose();
            setName("");
            setPitch("");
            setMyRole("");
            setOpenRoles([]);
          }
        }}
        className="space-y-4"
      >
        <Field label="Team name" required>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vital Signs Collective" required />
        </Field>
        <Field label="Your approach" required hint="One or two sentences">
          <textarea className="field min-h-[90px]" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="How will your team tackle this?" required />
        </Field>
        <Field label="Your role on the team" required>
          <input className="field" value={myRole} onChange={(e) => setMyRole(e.target.value)} placeholder="e.g. Web developer" required />
        </Field>
        <Field label="Open roles you need" hint="Enter to add">
          <TagInput value={openRoles} onChange={setOpenRoles} placeholder="e.g. Swahili translator" suggestions={needs} />
        </Field>
        <Button type="submit" className="w-full" size="lg">
          <Users className="size-4" /> Create team
        </Button>
      </form>
    </Modal>
  );
}

function JoinTeamModal({ team, onClose }: { team: Team | null; onClose: () => void }) {
  const { joinTeam } = usePlatform();
  const [role, setRole] = useState<string>("");
  const [custom, setCustom] = useState("");
  const effective = role === "__custom" ? custom : role || team?.openRoles[0] || "";

  return (
    <Modal open={!!team} onClose={onClose} title={team ? `Join ${team.name}` : ""} description="Pick the role you'll take on." size="sm">
      {team && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!effective.trim()) return;
            joinTeam(team.id, effective.trim());
            onClose();
            setRole("");
            setCustom("");
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            {team.openRoles.map((r) => {
              const selected = (role || team.openRoles[0]) === r && role !== "__custom";
              return (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition",
                    selected ? "border-pine-600 bg-pine-50 text-ink" : "border-line bg-surface text-ink-2 hover:border-line-strong",
                  )}
                >
                  {r}
                  {selected && <CheckCircle2 className="size-4 text-pine-600" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setRole("__custom")}
              className={cn(
                "w-full rounded-md border px-4 py-3 text-left text-sm transition",
                role === "__custom" ? "border-pine-600 bg-pine-50 text-ink" : "border-dashed border-line-strong text-ink-3 hover:border-ink-3",
              )}
            >
              Propose a different role
            </button>
            {role === "__custom" && <input className="field" autoFocus value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="What will you contribute?" />}
          </div>
          <Button type="submit" className="w-full" disabled={!effective.trim()}>
            <UserPlus className="size-4" /> Join as {effective || "…"}
          </Button>
        </form>
      )}
    </Modal>
  );
}

function PledgeModal({ open, onClose, problemId }: { open: boolean; onClose: () => void; problemId: string }) {
  const { pledgeSupport } = usePlatform();
  const [type, setType] = useState<PledgeType>("funding");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Pledge support" description="Tell the team exactly what you can provide.">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const p = await pledgeSupport(problemId, { type, amount: amount ? Number(amount) : undefined, details });
          if (p) {
            onClose();
            setAmount("");
            setDetails("");
          }
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(PLEDGE_LABEL) as PledgeType[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-md border px-3 py-2.5 text-sm font-medium transition",
                type === t ? "border-pine-600 bg-pine-50 text-pine-700" : "border-line bg-surface text-ink-2 hover:border-line-strong",
              )}
            >
              {PLEDGE_LABEL[t]}
            </button>
          ))}
        </div>
        {type === "funding" && (
          <Field label="Amount (USD)" required>
            <input className="field" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="4000" required />
          </Field>
        )}
        <Field label="Details" required hint="What, when, and any conditions">
          <textarea
            className="field min-h-[100px]"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={type === "mentorship" ? "Weekly review calls with one of our engineers…" : type === "resources" ? "One solar pump kit delivered to site…" : "Printing, transport and volunteer stipends…"}
            required
          />
        </Field>
        <Button type="submit" className="w-full" size="lg">
          <HandCoins className="size-4" /> Confirm pledge
        </Button>
      </form>
    </Modal>
  );
}

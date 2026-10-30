import "server-only";

import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import type {
  Category,
  ClientState,
  Credential,
  CurrentUser,
  OrgType,
  PlatformState,
  Pledge,
  PledgeType,
  Problem,
  ProblemStatus,
  ReviewStatus,
  Role,
  Team,
  Urgency,
  User,
} from "@/lib/types";

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : undefined);

export function toPublicUser(row: typeof schema.users.$inferSelect): User {
  return {
    id: row.id,
    name: row.name,
    role: row.role as Role,
    headline: row.headline,
    location: row.location,
    skills: row.skills ?? [],
    bio: row.bio ?? undefined,
    avatarHue: row.avatarHue,
    orgType: (row.orgType as OrgType | null) ?? undefined,
    joinedAt: row.joinedAt.toISOString(),
  };
}

/**
 * Everything the client needs, shaped like the old local store. Public visitors get approved problems
 * only; signed-in users also get their own submissions (so they can follow the review); admins get all.
 */
export async function loadPlatformState(viewer: CurrentUser | null): Promise<PlatformState> {
  const [userRows, problemRows, upvoteRows, updateRows, milestoneRows, teamRows, memberRows, pledgeRows, credentialRows] =
    await Promise.all([
      db.select().from(schema.users),
      db.select().from(schema.problems),
      db.select().from(schema.problemUpvotes).orderBy(asc(schema.problemUpvotes.createdAt)),
      db.select().from(schema.updates).orderBy(asc(schema.updates.createdAt)),
      db.select().from(schema.milestones).orderBy(asc(schema.milestones.position)),
      db.select().from(schema.teams),
      db.select().from(schema.teamMembers).orderBy(asc(schema.teamMembers.joinedAt)),
      db.select().from(schema.pledges).orderBy(asc(schema.pledges.createdAt)),
      db.select().from(schema.credentials),
    ]);

  const isAdmin = viewer?.role === "admin";
  const visible = problemRows.filter((p) => isAdmin || p.reviewStatus === "approved" || (viewer && p.submittedBy === viewer.id));
  const visibleIds = new Set(visible.map((p) => p.id));

  const upvotesBy = new Map<string, string[]>();
  for (const u of upvoteRows) upvotesBy.set(u.problemId, [...(upvotesBy.get(u.problemId) ?? []), u.userId]);
  const updatesBy = new Map<string, Problem["updates"]>();
  for (const u of updateRows)
    updatesBy.set(u.problemId, [
      ...(updatesBy.get(u.problemId) ?? []),
      { id: u.id, authorId: u.authorId, text: u.text, createdAt: u.createdAt.toISOString() },
    ]);
  const milestonesBy = new Map<string, Problem["milestones"]>();
  for (const m of milestoneRows)
    milestonesBy.set(m.problemId, [...(milestonesBy.get(m.problemId) ?? []), { id: m.id, title: m.title, done: m.done }]);

  const problems: Problem[] = visible
    .map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      description: p.description,
      category: p.category as Category,
      location: p.location,
      submittedBy: p.submittedBy,
      createdAt: p.createdAt.toISOString(),
      status: p.status as ProblemStatus,
      needs: p.needs ?? [],
      impact: p.impact,
      urgency: p.urgency as Urgency,
      upvotes: upvotesBy.get(p.id) ?? [],
      updates: updatesBy.get(p.id) ?? [],
      milestones: milestonesBy.get(p.id) ?? [],
      completedAt: iso(p.completedAt),
      reviewStatus: p.reviewStatus as ReviewStatus,
      reviewNote: p.reviewNote ?? undefined,
      reviewedAt: iso(p.reviewedAt),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const membersBy = new Map<string, Array<{ userId: string; role: string }>>();
  for (const m of memberRows) membersBy.set(m.teamId, [...(membersBy.get(m.teamId) ?? []), { userId: m.userId, role: m.role }]);

  const teams: Team[] = teamRows
    .filter((t) => visibleIds.has(t.problemId))
    .map((t) => {
      const members = membersBy.get(t.id) ?? [];
      return {
        id: t.id,
        problemId: t.problemId,
        name: t.name,
        pitch: t.pitch,
        leadId: t.leadId,
        memberIds: members.map((m) => m.userId),
        memberRoles: Object.fromEntries(members.map((m) => [m.userId, m.role])),
        openRoles: t.openRoles ?? [],
        createdAt: t.createdAt.toISOString(),
      };
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const pledges: Pledge[] = pledgeRows
    .filter((p) => visibleIds.has(p.problemId))
    .map((p) => ({
      id: p.id,
      problemId: p.problemId,
      orgId: p.orgId,
      type: p.type as PledgeType,
      amount: p.amount ?? undefined,
      details: p.details,
      createdAt: p.createdAt.toISOString(),
    }));

  const credentials: Credential[] = credentialRows
    .filter((c) => visibleIds.has(c.problemId))
    .map((c) => ({
      id: c.id,
      userId: c.userId,
      problemId: c.problemId,
      teamId: c.teamId,
      role: c.role,
      skills: c.skills ?? [],
      issuedAt: c.issuedAt.toISOString(),
      verifiedBy: c.verifiedBy,
      hours: c.hours,
    }))
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  return {
    users: userRows.map(toPublicUser),
    problems,
    teams,
    pledges,
    credentials,
    currentUserId: viewer?.id ?? null,
  };
}

export async function loadClientState(): Promise<ClientState> {
  const currentUser = await getCurrentUser();
  const state = await loadPlatformState(currentUser);
  return { state, currentUser };
}

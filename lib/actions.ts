"use server";

import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createSession, destroySession, getCurrentUser, toCurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { loadClientState, loadPlatformState } from "@/lib/data/state";
import { credentialId, uid } from "@/lib/utils";
import {
  CATEGORIES,
  ORG_TYPES,
  type Category,
  type ClientState,
  type CurrentUser,
  type OrgType,
  type PledgeType,
  type ReviewStatus,
  type Role,
  type SignupRole,
  type Urgency,
} from "@/lib/types";

/* ----------------------------- Plumbing ----------------------------- */

export type ActionResult<T = null> = { ok: true; data: T; state: ClientState } | { ok: false; error: string };

class ActionError extends Error {}

const fail = (message: string): never => {
  throw new ActionError(message);
};

/** Runs a mutation, then returns the fresh client state so the UI can replace its copy in one step. */
async function run<T>(fn: () => Promise<T>, viewer?: () => Promise<CurrentUser | null>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    const state = viewer ? await viewer().then(async (u) => ({ state: await loadPlatformState(u), currentUser: u })) : await loadClientState();
    return { ok: true, data, state };
  } catch (e) {
    if (e instanceof ActionError) return { ok: false, error: e.message };
    console.error("[action]", e);
    return { ok: false, error: "Something went wrong on the server. Please try again." };
  }
}

const roleWord: Record<Role, string> = { community: "community members", student: "students", organization: "organizations", admin: "administrators" };

async function requireUser(roles?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in to continue.");
  if (roles && user.role !== "admin" && !roles.includes(user.role)) {
    return fail(`This action is for ${roles.map((r) => roleWord[r]).join(" and ")}. You are signed in as a ${user.role}.`);
  }
  return user;
}

const clean = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const cleanList = (v: unknown, max = 20) =>
  Array.isArray(v) ? Array.from(new Set(v.map((x) => clean(x, 60)).filter(Boolean))).slice(0, max) : [];

async function getProblem(id: string) {
  const [p] = await db.select().from(schema.problems).where(eq(schema.problems.id, id)).limit(1);
  return p ?? fail("That problem no longer exists.");
}

type ProblemRow = typeof schema.problems.$inferSelect;

function assertVisible(p: ProblemRow, user: CurrentUser) {
  if (p.reviewStatus !== "approved" && user.role !== "admin" && p.submittedBy !== user.id) fail("This problem is not public yet.");
  return p;
}

async function problemContext(problemId: string, user: CurrentUser) {
  const problem = assertVisible(await getProblem(problemId), user);
  const teamRows = await db.select().from(schema.teams).where(eq(schema.teams.problemId, problemId));
  const teamIds = teamRows.map((t) => t.id);
  const members = teamIds.length
    ? (await db.select().from(schema.teamMembers)).filter((m) => teamIds.includes(m.teamId))
    : [];
  const pledgeRows = await db.select().from(schema.pledges).where(eq(schema.pledges.problemId, problemId));
  const isMember = members.some((m) => m.userId === user.id);
  const isLead = teamRows.some((t) => t.leadId === user.id);
  const isAuthor = problem.submittedBy === user.id;
  const isSupporter = pledgeRows.some((p) => p.orgId === user.id);
  const isAdmin = user.role === "admin";
  return { problem, teams: teamRows, members, pledges: pledgeRows, isMember, isLead, isAuthor, isSupporter, isAdmin };
}

/* ----------------------------- Auth ----------------------------- */

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: SignupRole;
  headline?: string;
  location?: string;
  skills?: string[];
  orgType?: OrgType;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUp(input: SignUpInput): Promise<ActionResult<CurrentUser>> {
  let created: CurrentUser | null = null;
  return run(
    async () => {
      const name = clean(input.name, 80);
      const email = clean(input.email, 160).toLowerCase();
      const password = typeof input.password === "string" ? input.password : "";
      const role = input.role;
      if (name.length < 2) fail("Please enter your name.");
      if (!EMAIL_RE.test(email)) fail("Please enter a valid email address.");
      if (password.length < 8) fail("Use a password of at least 8 characters.");
      if (!["community", "student", "organization"].includes(role)) fail("Pick a role.");

      const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
      if (existing) fail("An account with this email already exists. Sign in instead.");

      const id = uid("u");
      const defaults: Record<SignupRole, string> = { community: "Community member", student: "Student", organization: "Organization" };
      const [row] = await db
        .insert(schema.users)
        .values({
          id,
          name,
          email,
          passwordHash: await hashPassword(password),
          role,
          headline: clean(input.headline, 120) || defaults[role],
          location: clean(input.location, 120) || "Remote",
          skills: cleanList(input.skills),
          avatarHue: Math.floor(Math.random() * 360),
          orgType: role === "organization" ? (ORG_TYPES.includes(input.orgType as OrgType) ? input.orgType : "NGO") : null,
        })
        .returning();
      await createSession(id);
      created = toCurrentUser(row);
      return created;
    },
    async () => created,
  );
}

export async function signIn(input: { email: string; password: string }): Promise<ActionResult<CurrentUser>> {
  let user: CurrentUser | null = null;
  return run(
    async () => {
      const email = clean(input.email, 160).toLowerCase();
      const [row] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      const ok = row && (await verifyPassword(typeof input.password === "string" ? input.password : "", row.passwordHash));
      if (!row || !ok) fail("Email or password is incorrect.");
      await createSession(row.id);
      user = toCurrentUser(row);
      return user;
    },
    async () => user,
  );
}

export async function signOut(): Promise<ActionResult> {
  return run(
    async () => {
      await destroySession();
      return null;
    },
    async () => null,
  );
}

export async function getState(): Promise<ClientState> {
  return loadClientState();
}

/* ----------------------------- Problems ----------------------------- */

export interface SubmitProblemInput {
  title: string;
  summary: string;
  description: string;
  category: Category;
  location: string;
  needs: string[];
  impact: string;
  urgency: Urgency;
}

/** Anyone with an account can submit. The problem waits in the admin queue until approved. */
export async function submitProblem(input: SubmitProblemInput): Promise<ActionResult<{ id: string; reviewStatus: ReviewStatus }>> {
  return run(async () => {
    const user = await requireUser();
    const title = clean(input.title, 120);
    const summary = clean(input.summary, 600);
    const description = clean(input.description, 6000);
    const location = clean(input.location, 120);
    const needs = cleanList(input.needs);
    if (title.length < 10) fail("Give the problem a clear title (at least 10 characters).");
    if (summary.length < 30) fail("The summary should be at least a sentence or two.");
    if (description.length < 80) fail("Describe the situation in more detail so a team can scope it.");
    if (!location) fail("Where is this problem?");
    if (needs.length === 0) fail("Add at least one kind of help you need.");
    if (!CATEGORIES.includes(input.category)) fail("Pick a category.");
    const urgency: Urgency = ["low", "medium", "high"].includes(input.urgency) ? input.urgency : "medium";

    const id = uid("p");
    const reviewStatus: ReviewStatus = user.role === "admin" ? "approved" : "pending";
    await db.insert(schema.problems).values({
      id,
      title,
      summary,
      description,
      category: input.category,
      location,
      submittedBy: user.id,
      needs,
      impact: clean(input.impact, 120) || "Community-wide",
      urgency,
      reviewStatus,
      reviewedBy: reviewStatus === "approved" ? user.id : null,
      reviewedAt: reviewStatus === "approved" ? new Date() : null,
    });
    return { id, reviewStatus };
  });
}

export async function toggleUpvote(problemId: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser();
    assertVisible(await getProblem(problemId), user);
    const where = and(eq(schema.problemUpvotes.problemId, problemId), eq(schema.problemUpvotes.userId, user.id));
    const [existing] = await db.select().from(schema.problemUpvotes).where(where).limit(1);
    if (existing) await db.delete(schema.problemUpvotes).where(where);
    else await db.insert(schema.problemUpvotes).values({ problemId, userId: user.id });
    return null;
  });
}

export async function postUpdate(problemId: string, text: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser();
    const ctx = await problemContext(problemId, user);
    if (!(ctx.isMember || ctx.isAuthor || ctx.isSupporter || ctx.isAdmin)) fail("Only team members, the submitter and supporters can post updates.");
    const body = clean(text, 2000);
    if (!body) fail("Write something first.");
    await db.insert(schema.updates).values({ id: uid("up"), problemId, authorId: user.id, text: body });
    return null;
  });
}

export async function addMilestone(problemId: string, title: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser();
    const ctx = await problemContext(problemId, user);
    if (!(ctx.isMember || ctx.isAdmin)) fail("Only team members can add milestones.");
    const t = clean(title, 160);
    if (!t) fail("Give the milestone a title.");
    const existing = await db.select({ id: schema.milestones.id }).from(schema.milestones).where(eq(schema.milestones.problemId, problemId));
    await db.insert(schema.milestones).values({ id: uid("m"), problemId, title: t, position: existing.length });
    return null;
  });
}

export async function toggleMilestone(problemId: string, milestoneId: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser();
    const ctx = await problemContext(problemId, user);
    if (!(ctx.isMember || ctx.isAdmin)) fail("Only team members can update milestones.");
    if (ctx.problem.status === "completed") fail("This project is already complete.");
    const [m] = await db.select().from(schema.milestones).where(and(eq(schema.milestones.id, milestoneId), eq(schema.milestones.problemId, problemId))).limit(1);
    if (!m) fail("Milestone not found.");
    await db.update(schema.milestones).set({ done: !m.done }).where(eq(schema.milestones.id, milestoneId));
    return null;
  });
}

export async function startProject(problemId: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser(["student"]);
    const ctx = await problemContext(problemId, user);
    if (!(ctx.isLead || ctx.isAdmin)) fail("Only a team lead can start the project.");
    if (ctx.problem.status !== "forming") fail("The project can only start while a team is forming.");
    await db.update(schema.problems).set({ status: "in-progress" }).where(eq(schema.problems.id, problemId));
    return null;
  });
}

/** Marks the project complete and issues one certificate per team member. */
export async function completeProject(problemId: string): Promise<ActionResult<{ issued: number }>> {
  return run(async () => {
    const user = await requireUser();
    const ctx = await problemContext(problemId, user);
    if (!(ctx.isLead || ctx.isAuthor || ctx.isSupporter || ctx.isAdmin)) fail("Only the team lead, the submitter or a supporting organization can complete this project.");
    if (ctx.problem.status === "completed") fail("This project is already complete.");
    if (ctx.problem.status !== "in-progress") fail("Start the project before marking it complete.");

    const issuedAt = new Date();
    const verifiedBy = ctx.pledges[0]?.orgId ?? (user.role === "organization" ? user.id : "platform");
    const already = new Set(
      (await db.select({ userId: schema.credentials.userId }).from(schema.credentials).where(eq(schema.credentials.problemId, problemId))).map((c) => c.userId),
    );
    const milestoneRows = await db.select().from(schema.milestones).where(eq(schema.milestones.problemId, problemId));
    const updateRows = await db.select({ id: schema.updates.id }).from(schema.updates).where(eq(schema.updates.problemId, problemId));
    const hours = Math.min(200, 60 + milestoneRows.length * 10 + updateRows.length * 5);
    const userRows = await db.select().from(schema.users);

    let issued = 0;
    for (const member of ctx.members) {
      if (already.has(member.userId)) continue;
      const profile = userRows.find((u) => u.id === member.userId);
      const skills = (profile?.skills ?? []).slice(0, 3);
      let serial = credentialId();
      // Serial numbers are public: make sure this one is unused.
      while ((await db.select({ id: schema.credentials.id }).from(schema.credentials).where(eq(schema.credentials.id, serial)).limit(1)).length) {
        serial = credentialId();
      }
      await db.insert(schema.credentials).values({
        id: serial,
        userId: member.userId,
        problemId,
        teamId: member.teamId,
        role: member.role || "Contributor",
        skills: skills.length ? skills : (ctx.problem.needs ?? []).slice(0, 2),
        issuedAt,
        verifiedBy,
        hours,
      });
      already.add(member.userId);
      issued += 1;
    }

    await db.update(schema.milestones).set({ done: true }).where(eq(schema.milestones.problemId, problemId));
    await db.update(schema.problems).set({ status: "completed", completedAt: issuedAt }).where(eq(schema.problems.id, problemId));
    await db.insert(schema.updates).values({
      id: uid("up"),
      problemId,
      authorId: user.id,
      text: `Project marked complete. ${issued} verified certificate${issued === 1 ? "" : "s"} issued to contributors.`,
      createdAt: issuedAt,
    });
    return { issued };
  });
}

/* ----------------------------- Teams ----------------------------- */

export async function createTeam(
  problemId: string,
  input: { name: string; pitch: string; openRoles: string[]; myRole: string },
): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const user = await requireUser(["student"]);
    const problem = assertVisible(await getProblem(problemId), user);
    if (problem.reviewStatus !== "approved") fail("Teams can form once the problem is approved.");
    if (problem.status === "completed") fail("This project is already complete.");
    const name = clean(input.name, 80);
    const pitch = clean(input.pitch, 600);
    if (name.length < 2) fail("Give the team a name.");
    if (pitch.length < 10) fail("Describe your approach in a sentence or two.");
    const id = uid("t");
    await db.insert(schema.teams).values({ id, problemId, name, pitch, leadId: user.id, openRoles: cleanList(input.openRoles, 12) });
    await db.insert(schema.teamMembers).values({ teamId: id, userId: user.id, role: clean(input.myRole, 60) || "Team lead" });
    if (problem.status === "open") await db.update(schema.problems).set({ status: "forming" }).where(eq(schema.problems.id, problemId));
    return { id };
  });
}

export async function joinTeam(teamId: string, role: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser(["student"]);
    const [team] = await db.select().from(schema.teams).where(eq(schema.teams.id, teamId)).limit(1);
    if (!team) fail("Team not found.");
    const problem = assertVisible(await getProblem(team.problemId), user);
    if (problem.status === "completed") fail("This project is already complete.");
    const [existing] = await db
      .select()
      .from(schema.teamMembers)
      .where(and(eq(schema.teamMembers.teamId, teamId), eq(schema.teamMembers.userId, user.id)))
      .limit(1);
    if (existing) fail("You are already on this team.");
    const r = clean(role, 60) || "Contributor";
    await db.insert(schema.teamMembers).values({ teamId, userId: user.id, role: r });
    await db
      .update(schema.teams)
      .set({ openRoles: (team.openRoles ?? []).filter((x) => x !== r) })
      .where(eq(schema.teams.id, teamId));
    return null;
  });
}

export async function leaveTeam(teamId: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser(["student"]);
    const [team] = await db.select().from(schema.teams).where(eq(schema.teams.id, teamId)).limit(1);
    if (!team) fail("Team not found.");
    if (team.leadId === user.id) fail("Team leads can't leave. Hand over the lead role first.");
    const where = and(eq(schema.teamMembers.teamId, teamId), eq(schema.teamMembers.userId, user.id));
    const [membership] = await db.select().from(schema.teamMembers).where(where).limit(1);
    if (!membership) fail("You are not on this team.");
    await db.delete(schema.teamMembers).where(where);
    await db
      .update(schema.teams)
      .set({ openRoles: [...(team.openRoles ?? []), membership.role] })
      .where(eq(schema.teams.id, teamId));
    return null;
  });
}

/* ----------------------------- Pledges ----------------------------- */

export async function pledgeSupport(
  problemId: string,
  input: { type: PledgeType; amount?: number; details: string },
): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const user = await requireUser(["organization"]);
    const problem = assertVisible(await getProblem(problemId), user);
    if (problem.reviewStatus !== "approved") fail("Pledges open once the problem is approved.");
    if (problem.status === "completed") fail("This project is already complete.");
    if (!["funding", "mentorship", "resources"].includes(input.type)) fail("Pick a kind of support.");
    const details = clean(input.details, 1000);
    if (details.length < 5) fail("Tell the team what you can provide.");
    const amount = input.type === "funding" ? Math.round(Number(input.amount)) : null;
    if (input.type === "funding" && (!amount || amount <= 0)) fail("Enter a funding amount.");
    const id = uid("pl");
    await db.insert(schema.pledges).values({ id, problemId, orgId: user.id, type: input.type, amount, details });
    return { id };
  });
}

/* ----------------------------- Admin ----------------------------- */

export async function reviewProblem(problemId: string, decision: "approved" | "rejected", note?: string): Promise<ActionResult> {
  return run(async () => {
    const admin = await requireUser(["admin"]);
    await getProblem(problemId);
    if (decision !== "approved" && decision !== "rejected") fail("Unknown decision.");
    await db
      .update(schema.problems)
      .set({ reviewStatus: decision, reviewNote: clean(note, 1000) || null, reviewedBy: admin.id, reviewedAt: new Date() })
      .where(eq(schema.problems.id, problemId));
    return null;
  });
}

/**
 * Seeds the Neon database with the demo data from lib/seed.ts plus an admin account.
 * Run with: npm run db:seed   (after npm run db:push)
 * Safe to re-run: every row is inserted with "on conflict do nothing".
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashPassword } from "../lib/auth/password";
import * as schema from "../lib/db/schema";
import { seedState } from "../lib/seed";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing. Put it in .env.local.");
  const db = drizzle(neon(url), { schema });

  const demoPassword = process.env.DEMO_PASSWORD || "demo1234";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@needtosolution.org").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me-now";
  if (!process.env.ADMIN_PASSWORD) {
    console.warn("ADMIN_PASSWORD is not set; using the default 'change-me-now'. Change it in .env.local and re-seed, or change it after signing in.");
  }

  const demoHash = await hashPassword(demoPassword);
  const adminHash = await hashPassword(adminPassword);

  // Demo users get a predictable email: first word of the id after "u-".
  const users = seedState.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: `${u.id.replace(/^u-/, "")}@needtosolution.demo`,
    passwordHash: demoHash,
    role: u.role,
    headline: u.headline,
    location: u.location,
    skills: u.skills,
    bio: u.bio ?? null,
    avatarHue: u.avatarHue,
    orgType: u.orgType ?? null,
    joinedAt: new Date(u.joinedAt),
  }));
  users.push({
    id: "u-admin",
    name: "Platform Admin",
    email: adminEmail,
    passwordHash: adminHash,
    role: "admin",
    headline: "Reviews submitted problems",
    location: "Remote",
    skills: [],
    bio: null,
    avatarHue: 0,
    orgType: null,
    joinedAt: new Date("2026-01-01T00:00:00.000Z"),
  });
  const insertedUsers = await db.insert(schema.users).values(users).onConflictDoNothing().returning({ id: schema.users.id });
  console.log(`users: ${insertedUsers.length} inserted (${users.length} in seed)`);

  const problems = seedState.problems.map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    description: p.description,
    category: p.category,
    location: p.location,
    submittedBy: p.submittedBy,
    createdAt: new Date(p.createdAt),
    status: p.status,
    needs: p.needs,
    impact: p.impact,
    urgency: p.urgency,
    completedAt: p.completedAt ? new Date(p.completedAt) : null,
    reviewStatus: "approved",
    reviewedBy: "u-admin",
    reviewedAt: new Date(p.createdAt),
  }));
  const insertedProblems = await db.insert(schema.problems).values(problems).onConflictDoNothing().returning({ id: schema.problems.id });
  console.log(`problems: ${insertedProblems.length} inserted`);

  const upvotes = seedState.problems.flatMap((p) => p.upvotes.map((userId) => ({ problemId: p.id, userId })));
  if (upvotes.length) await db.insert(schema.problemUpvotes).values(upvotes).onConflictDoNothing();
  const updates = seedState.problems.flatMap((p) =>
    p.updates.map((u) => ({ id: u.id, problemId: p.id, authorId: u.authorId, text: u.text, createdAt: new Date(u.createdAt) })),
  );
  if (updates.length) await db.insert(schema.updates).values(updates).onConflictDoNothing();
  const milestones = seedState.problems.flatMap((p) =>
    p.milestones.map((m, i) => ({ id: m.id, problemId: p.id, title: m.title, done: m.done, position: i })),
  );
  if (milestones.length) await db.insert(schema.milestones).values(milestones).onConflictDoNothing();
  console.log(`upvotes: ${upvotes.length}, updates: ${updates.length}, milestones: ${milestones.length}`);

  const teams = seedState.teams.map((t) => ({
    id: t.id,
    problemId: t.problemId,
    name: t.name,
    pitch: t.pitch,
    leadId: t.leadId,
    openRoles: t.openRoles,
    createdAt: new Date(t.createdAt),
  }));
  if (teams.length) await db.insert(schema.teams).values(teams).onConflictDoNothing();
  const members = seedState.teams.flatMap((t) =>
    t.memberIds.map((userId, i) => ({
      teamId: t.id,
      userId,
      role: t.memberRoles[userId] ?? "Contributor",
      joinedAt: new Date(new Date(t.createdAt).getTime() + i * 60_000),
    })),
  );
  if (members.length) await db.insert(schema.teamMembers).values(members).onConflictDoNothing();
  console.log(`teams: ${teams.length}, members: ${members.length}`);

  const pledges = seedState.pledges.map((p) => ({
    id: p.id,
    problemId: p.problemId,
    orgId: p.orgId,
    type: p.type,
    amount: p.amount ?? null,
    details: p.details,
    createdAt: new Date(p.createdAt),
  }));
  if (pledges.length) await db.insert(schema.pledges).values(pledges).onConflictDoNothing();

  const credentials = seedState.credentials.map((c) => ({
    id: c.id,
    userId: c.userId,
    problemId: c.problemId,
    teamId: c.teamId,
    role: c.role,
    skills: c.skills,
    issuedAt: new Date(c.issuedAt),
    verifiedBy: c.verifiedBy,
    hours: c.hours,
  }));
  if (credentials.length) await db.insert(schema.credentials).values(credentials).onConflictDoNothing();
  console.log(`pledges: ${pledges.length}, credentials: ${credentials.length}`);

  console.log("\nDone. Sign in with:");
  console.log(`  admin     ${adminEmail} / (ADMIN_PASSWORD)`);
  console.log(`  student   dev@needtosolution.demo / ${demoPassword}`);
  console.log(`  community amina@needtosolution.demo / ${demoPassword}`);
  console.log(`  org       hope@needtosolution.demo / ${demoPassword}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

/* Every table mirrors the client-side types in lib/types.ts. Ids are short text ids ("u_…", "p_…") so the
   existing seed data and URLs keep working. */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // community | student | organization | admin
  headline: text("headline").notNull().default(""),
  location: text("location").notNull().default("Remote"),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  bio: text("bio"),
  avatarHue: integer("avatar_hue").notNull().default(150),
  orgType: text("org_type"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const problems = pgTable("problems", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  submittedBy: text("submitted_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("open"), // open | forming | in-progress | completed
  needs: jsonb("needs").$type<string[]>().notNull().default([]),
  impact: text("impact").notNull().default("Community-wide"),
  urgency: text("urgency").notNull().default("medium"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  // Admin review pipeline. Only approved problems are public.
  reviewStatus: text("review_status").notNull().default("pending"), // pending | approved | rejected
  reviewNote: text("review_note"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const problemUpvotes = pgTable(
  "problem_upvotes",
  {
    problemId: text("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.problemId, t.userId] })],
);

export const updates = pgTable("updates", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  done: boolean("done").notNull().default(false),
  position: integer("position").notNull().default(0),
});

export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  pitch: text("pitch").notNull(),
  leadId: text("lead_id")
    .notNull()
    .references(() => users.id),
  openRoles: jsonb("open_roles").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("Contributor"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.teamId, t.userId] })],
);

export const pledges = pgTable("pledges", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  orgId: text("org_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(), // funding | mentorship | resources
  amount: integer("amount"),
  details: text("details").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* A credential is the certificate a contributor receives when a project completes.
   Its id is the public serial number (NTS-XXXX-XXXX) anyone can verify on /verify. */
export const credentials = pgTable("credentials", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id),
  role: text("role").notNull(),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  verifiedBy: text("verified_by").notNull(), // a user id, or "platform"
  hours: integer("hours").notNull().default(0),
});

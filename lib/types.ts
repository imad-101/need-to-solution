export type Role = "community" | "student" | "organization" | "admin";

/** Roles a visitor can pick when creating an account. Admins are created by the seed script. */
export type SignupRole = Exclude<Role, "admin">;

export type ProblemStatus = "open" | "forming" | "in-progress" | "completed";

/** Admin review pipeline. Only approved problems are visible to the public. */
export type ReviewStatus = "pending" | "approved" | "rejected";

export type Urgency = "low" | "medium" | "high";

export type PledgeType = "funding" | "mentorship" | "resources";

export type Category =
  | "Health"
  | "Education"
  | "Environment"
  | "Infrastructure"
  | "Technology"
  | "Agriculture"
  | "Economic Opportunity";

export type OrgType = "NGO" | "Company" | "University" | "Government" | "Foundation";

export interface User {
  id: string;
  name: string;
  role: Role;
  headline: string;
  location: string;
  skills: string[];
  bio?: string;
  avatarHue: number;
  orgType?: OrgType;
  joinedAt: string;
}

/** The signed-in user. Email is only ever sent to its owner. */
export interface CurrentUser extends User {
  email: string;
}

export interface Update {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface Problem {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: Category;
  location: string;
  submittedBy: string;
  createdAt: string;
  status: ProblemStatus;
  needs: string[];
  impact: string;
  urgency: Urgency;
  upvotes: string[];
  updates: Update[];
  milestones: Milestone[];
  completedAt?: string;
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  reviewedAt?: string;
}

export interface Team {
  id: string;
  problemId: string;
  name: string;
  pitch: string;
  leadId: string;
  memberIds: string[];
  memberRoles: Record<string, string>;
  openRoles: string[];
  createdAt: string;
}

export interface Pledge {
  id: string;
  problemId: string;
  orgId: string;
  type: PledgeType;
  amount?: number;
  details: string;
  createdAt: string;
}

/** A verifiable certificate of project experience. `id` is the public serial number. */
export interface Credential {
  id: string;
  userId: string;
  problemId: string;
  teamId: string;
  role: string;
  skills: string[];
  issuedAt: string;
  verifiedBy: string;
  hours: number;
}

export interface PlatformState {
  users: User[];
  problems: Problem[];
  teams: Team[];
  pledges: Pledge[];
  credentials: Credential[];
  currentUserId: string | null;
}

/** What the server hands the client provider: public state plus the viewer. */
export interface ClientState {
  state: PlatformState;
  currentUser: CurrentUser | null;
}

export const CATEGORIES: Category[] = [
  "Health",
  "Education",
  "Environment",
  "Infrastructure",
  "Technology",
  "Agriculture",
  "Economic Opportunity",
];

export const ORG_TYPES: OrgType[] = ["NGO", "Company", "University", "Government", "Foundation"];

export const ROLE_LABEL: Record<Role, string> = {
  community: "Community member",
  student: "Student",
  organization: "Organization",
  admin: "Administrator",
};

export const STATUS_LABEL: Record<ProblemStatus, string> = {
  open: "Open",
  forming: "Team forming",
  "in-progress": "In progress",
  completed: "Completed",
};

export const REVIEW_LABEL: Record<ReviewStatus, string> = {
  pending: "Under review",
  approved: "Approved",
  rejected: "Not approved",
};

export const PLEDGE_LABEL: Record<PledgeType, string> = {
  funding: "Funding",
  mentorship: "Mentorship",
  resources: "Resources",
};

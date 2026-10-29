"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import type {
  Category,
  Credential,
  PlatformState,
  Pledge,
  PledgeType,
  Problem,
  Role,
  Team,
  Urgency,
  User,
} from "./types";
import { seedState, STORAGE_KEY } from "./seed";
import { credentialId, uid } from "./utils";

/* ----------------------------- Reducer ----------------------------- */

interface StoreState {
  data: PlatformState;
  hydrated: boolean;
}

type Action =
  | { type: "HYDRATE"; state: PlatformState | null }
  | { type: "RESET" }
  | { type: "SET_CURRENT"; userId: string | null }
  | { type: "ADD_USER"; user: User }
  | { type: "ADD_PROBLEM"; problem: Problem }
  | { type: "UPDATE_PROBLEM"; id: string; patch: Partial<Problem> | ((p: Problem) => Partial<Problem>) }
  | { type: "ADD_TEAM"; team: Team }
  | { type: "UPDATE_TEAM"; id: string; patch: Partial<Team> | ((t: Team) => Partial<Team>) }
  | { type: "ADD_PLEDGE"; pledge: Pledge }
  | { type: "ADD_CREDENTIALS"; credentials: Credential[] };

function dataReducer(state: PlatformState, action: Action): PlatformState {
  switch (action.type) {
    case "HYDRATE":
      return action.state ?? state;
    case "RESET":
      return { ...seedState, currentUserId: null };
    case "SET_CURRENT":
      return { ...state, currentUserId: action.userId };
    case "ADD_USER":
      return { ...state, users: [...state.users, action.user] };
    case "ADD_PROBLEM":
      return { ...state, problems: [action.problem, ...state.problems] };
    case "UPDATE_PROBLEM":
      return {
        ...state,
        problems: state.problems.map((p) =>
          p.id === action.id ? { ...p, ...(typeof action.patch === "function" ? action.patch(p) : action.patch) } : p,
        ),
      };
    case "ADD_TEAM":
      return { ...state, teams: [...state.teams, action.team] };
    case "UPDATE_TEAM":
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.id ? { ...t, ...(typeof action.patch === "function" ? action.patch(t) : action.patch) } : t,
        ),
      };
    case "ADD_PLEDGE":
      return { ...state, pledges: [...state.pledges, action.pledge] };
    case "ADD_CREDENTIALS":
      return { ...state, credentials: [...state.credentials, ...action.credentials] };
    default:
      return state;
  }
}

function reducer(state: StoreState, action: Action): StoreState {
  return {
    data: dataReducer(state.data, action),
    hydrated: state.hydrated || action.type === "HYDRATE",
  };
}

/* ----------------------------- Toasts ----------------------------- */

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: "success" | "info" | "error";
}

/* ----------------------------- Context ----------------------------- */

export interface SignInInput {
  name: string;
  role: Role;
  headline?: string;
  location?: string;
  skills?: string[];
  orgType?: User["orgType"];
}

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

interface PlatformContextValue {
  state: PlatformState;
  hydrated: boolean;
  currentUser: User | null;
  toasts: Toast[];
  authOpen: boolean;
  authRole: Role | null;
  openAuth: (role?: Role) => void;
  closeAuth: () => void;
  dismissToast: (id: string) => void;
  notify: (toast: Omit<Toast, "id">) => void;
  signIn: (input: SignInInput) => User;
  signInAs: (userId: string) => void;
  signOut: () => void;
  resetDemo: () => void;
  submitProblem: (input: SubmitProblemInput) => Problem | null;
  toggleUpvote: (problemId: string) => void;
  createTeam: (problemId: string, input: { name: string; pitch: string; openRoles: string[]; myRole: string }) => Team | null;
  joinTeam: (teamId: string, role: string) => void;
  leaveTeam: (teamId: string) => void;
  pledgeSupport: (problemId: string, input: { type: PledgeType; amount?: number; details: string }) => Pledge | null;
  postUpdate: (problemId: string, text: string) => void;
  addMilestone: (problemId: string, title: string) => void;
  toggleMilestone: (problemId: string, milestoneId: string) => void;
  startProject: (problemId: string) => void;
  completeProject: (problemId: string) => void;
  userById: (id: string) => User | undefined;
  problemById: (id: string) => Problem | undefined;
  teamsForProblem: (problemId: string) => Team[];
  pledgesForProblem: (problemId: string) => Pledge[];
  credentialsForUser: (userId: string) => Credential[];
  teamsForUser: (userId: string) => Team[];
  problemsForUser: (userId: string) => Problem[];
  pledgesForOrg: (orgId: string) => Pledge[];
  canAct: (role: Role) => boolean;
  isTeamMember: (problemId: string, userId: string) => boolean;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

function readStorage(): PlatformState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlatformState;
    return parsed && Array.isArray(parsed.problems) ? parsed : null;
  } catch {
    return null;
  }
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [{ data, hydrated }, dispatch] = useReducer(reducer, { data: seedState, hydrated: false });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<Role | null>(null);

  // Persist after hydration. Declared before the hydrate effect so the first
  // run (hydrated === false) never overwrites stored data with the seed.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage may be unavailable */
    }
  }, [data, hydrated]);

  useEffect(() => {
    dispatch({ type: "HYDRATE", state: readStorage() });
  }, []);

  const notify = useCallback((toast: Omit<Toast, "id">) => {
    const id = uid("toast");
    setToasts((t) => [...t, { ...toast, id }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const openAuth = useCallback((role?: Role) => {
    setAuthRole(role ?? null);
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const value = useMemo<PlatformContextValue>(() => {
    const s = data;
    const currentUser = s.users.find((u) => u.id === s.currentUserId) ?? null;

    /* ---------- selectors ---------- */
    const userById = (id: string) => s.users.find((u) => u.id === id);
    const problemById = (id: string) => s.problems.find((p) => p.id === id);
    const teamsForProblem = (problemId: string) => s.teams.filter((t) => t.problemId === problemId);
    const pledgesForProblem = (problemId: string) => s.pledges.filter((p) => p.problemId === problemId);
    const credentialsForUser = (userId: string) => s.credentials.filter((c) => c.userId === userId);
    const teamsForUser = (userId: string) => s.teams.filter((t) => t.memberIds.includes(userId));
    const problemsForUser = (userId: string) => s.problems.filter((p) => p.submittedBy === userId);
    const pledgesForOrg = (orgId: string) => s.pledges.filter((p) => p.orgId === orgId);
    const isTeamMember = (problemId: string, userId: string) =>
      s.teams.some((t) => t.problemId === problemId && t.memberIds.includes(userId));
    const canAct = (role: Role) => !!currentUser && currentUser.role === role;

    const requireUser = (role?: Role): User | null => {
      if (!currentUser) {
        openAuth(role);
        return null;
      }
      if (role && currentUser.role !== role) {
        notify({
          title: `This action is for ${role === "organization" ? "organizations" : role + "s"}`,
          description: `You are signed in as ${currentUser.role === "organization" ? "an organization" : "a " + currentUser.role}. Switch account to continue.`,
          tone: "info",
        });
        return null;
      }
      return currentUser;
    };

    /* ---------- auth ---------- */
    const signIn = (input: SignInInput) => {
      const existing = s.users.find(
        (u) => u.name.trim().toLowerCase() === input.name.trim().toLowerCase() && u.role === input.role,
      );
      if (existing) {
        dispatch({ type: "SET_CURRENT", userId: existing.id });
        setAuthOpen(false);
        notify({ title: `Welcome back, ${existing.name.split(" ")[0]}`, tone: "success" });
        return existing;
      }
      const user: User = {
        id: uid("u"),
        name: input.name.trim(),
        role: input.role,
        headline:
          input.headline?.trim() ||
          (input.role === "community" ? "Community member" : input.role === "student" ? "Student" : "Organization"),
        location: input.location?.trim() || "Remote",
        skills: input.skills ?? [],
        avatarHue: Math.floor(Math.random() * 360),
        orgType: input.role === "organization" ? (input.orgType ?? "NGO") : undefined,
        joinedAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_USER", user });
      dispatch({ type: "SET_CURRENT", userId: user.id });
      setAuthOpen(false);
      notify({ title: `Welcome, ${user.name.split(" ")[0]}`, description: "Your account is ready.", tone: "success" });
      return user;
    };

    const signInAs = (userId: string) => {
      const user = userById(userId);
      if (!user) return;
      dispatch({ type: "SET_CURRENT", userId });
      setAuthOpen(false);
      notify({ title: `Signed in as ${user.name}`, tone: "success" });
    };

    const signOut = () => {
      dispatch({ type: "SET_CURRENT", userId: null });
      notify({ title: "Signed out", tone: "info" });
    };

    const resetDemo = () => {
      dispatch({ type: "RESET" });
      notify({ title: "Demo data reset", tone: "info" });
    };

    /* ---------- problems ---------- */
    const submitProblem = (input: SubmitProblemInput) => {
      const user = requireUser("community");
      if (!user) return null;
      const problem: Problem = {
        id: uid("p"),
        ...input,
        submittedBy: user.id,
        createdAt: new Date().toISOString(),
        status: "open",
        upvotes: [],
        updates: [],
        milestones: [],
      };
      dispatch({ type: "ADD_PROBLEM", problem });
      notify({ title: "Problem published", description: "Students and organizations can now find it.", tone: "success" });
      return problem;
    };

    const toggleUpvote = (problemId: string) => {
      const user = requireUser();
      if (!user) return;
      dispatch({
        type: "UPDATE_PROBLEM",
        id: problemId,
        patch: (p) => ({
          upvotes: p.upvotes.includes(user.id) ? p.upvotes.filter((x) => x !== user.id) : [...p.upvotes, user.id],
        }),
      });
    };

    /* ---------- teams ---------- */
    const createTeam = (problemId: string, input: { name: string; pitch: string; openRoles: string[]; myRole: string }) => {
      const user = requireUser("student");
      if (!user) return null;
      const team: Team = {
        id: uid("t"),
        problemId,
        name: input.name.trim(),
        pitch: input.pitch.trim(),
        leadId: user.id,
        memberIds: [user.id],
        memberRoles: { [user.id]: input.myRole.trim() || "Team lead" },
        openRoles: input.openRoles,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_TEAM", team });
      dispatch({ type: "UPDATE_PROBLEM", id: problemId, patch: (p) => (p.status === "open" ? { status: "forming" } : {}) });
      notify({ title: `${team.name} created`, description: "Open roles are now visible to other students.", tone: "success" });
      return team;
    };

    const joinTeam = (teamId: string, role: string) => {
      const user = requireUser("student");
      if (!user) return;
      const team = s.teams.find((t) => t.id === teamId);
      if (!team || team.memberIds.includes(user.id)) return;
      dispatch({
        type: "UPDATE_TEAM",
        id: teamId,
        patch: (t) => ({
          memberIds: [...t.memberIds, user.id],
          memberRoles: { ...t.memberRoles, [user.id]: role },
          openRoles: t.openRoles.filter((r) => r !== role),
        }),
      });
      notify({ title: `You joined ${team.name}`, description: `Role: ${role}`, tone: "success" });
    };

    const leaveTeam = (teamId: string) => {
      const user = requireUser("student");
      if (!user) return;
      const team = s.teams.find((t) => t.id === teamId);
      if (!team) return;
      if (team.leadId === user.id) {
        notify({ title: "Team leads can't leave", description: "Hand over the lead role first.", tone: "error" });
        return;
      }
      const role = team.memberRoles[user.id];
      dispatch({
        type: "UPDATE_TEAM",
        id: teamId,
        patch: (t) => {
          const roles = { ...t.memberRoles };
          delete roles[user.id];
          return {
            memberIds: t.memberIds.filter((m) => m !== user.id),
            memberRoles: roles,
            openRoles: role ? [...t.openRoles, role] : t.openRoles,
          };
        },
      });
      notify({ title: `You left ${team.name}`, tone: "info" });
    };

    /* ---------- pledges ---------- */
    const pledgeSupport = (problemId: string, input: { type: PledgeType; amount?: number; details: string }) => {
      const user = requireUser("organization");
      if (!user) return null;
      const pledge: Pledge = {
        id: uid("pl"),
        problemId,
        orgId: user.id,
        type: input.type,
        amount: input.type === "funding" ? input.amount : undefined,
        details: input.details.trim(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_PLEDGE", pledge });
      notify({ title: "Support pledged", description: "The team and the community have been notified.", tone: "success" });
      return pledge;
    };

    /* ---------- progress ---------- */
    const postUpdate = (problemId: string, text: string) => {
      const user = requireUser();
      if (!user || !text.trim()) return;
      dispatch({
        type: "UPDATE_PROBLEM",
        id: problemId,
        patch: (p) => ({
          updates: [...p.updates, { id: uid("up"), authorId: user.id, text: text.trim(), createdAt: new Date().toISOString() }],
        }),
      });
      notify({ title: "Update posted", tone: "success" });
    };

    const addMilestone = (problemId: string, title: string) => {
      const user = requireUser();
      if (!user || !title.trim()) return;
      dispatch({
        type: "UPDATE_PROBLEM",
        id: problemId,
        patch: (p) => ({ milestones: [...p.milestones, { id: uid("m"), title: title.trim(), done: false }] }),
      });
    };

    const toggleMilestone = (problemId: string, milestoneId: string) => {
      const user = requireUser();
      if (!user) return;
      dispatch({
        type: "UPDATE_PROBLEM",
        id: problemId,
        patch: (p) => ({ milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m)) }),
      });
    };

    const startProject = (problemId: string) => {
      const user = requireUser("student");
      if (!user) return;
      dispatch({ type: "UPDATE_PROBLEM", id: problemId, patch: { status: "in-progress" } });
      notify({ title: "Project started", description: "Keep the community posted with updates.", tone: "success" });
    };

    const completeProject = (problemId: string) => {
      const user = requireUser();
      if (!user) return;
      const problem = problemById(problemId);
      if (!problem) return;
      const teams = teamsForProblem(problemId);
      const orgs = pledgesForProblem(problemId).map((p) => p.orgId);
      const verifiedBy = orgs[0] ?? (user.role === "organization" ? user.id : "platform");
      const issuedAt = new Date().toISOString();
      const already = new Set(s.credentials.filter((c) => c.problemId === problemId).map((c) => c.userId));
      const credentials: Credential[] = [];
      for (const team of teams) {
        for (const memberId of team.memberIds) {
          if (already.has(memberId)) continue;
          const member = userById(memberId);
          const skills = (member?.skills ?? []).slice(0, 3);
          credentials.push({
            id: credentialId(),
            userId: memberId,
            problemId,
            teamId: team.id,
            role: team.memberRoles[memberId] ?? "Contributor",
            skills: skills.length ? skills : problem.needs.slice(0, 2),
            issuedAt,
            verifiedBy,
            hours: 60 + Math.floor(Math.random() * 90),
          });
        }
      }
      dispatch({
        type: "UPDATE_PROBLEM",
        id: problemId,
        patch: (p) => ({
          status: "completed",
          completedAt: issuedAt,
          milestones: p.milestones.map((m) => ({ ...m, done: true })),
          updates: [
            ...p.updates,
            {
              id: uid("up"),
              authorId: user.id,
              text: `Project marked complete. ${credentials.length} verified credential${credentials.length === 1 ? "" : "s"} issued to contributors.`,
              createdAt: issuedAt,
            },
          ],
        }),
      });
      if (credentials.length) dispatch({ type: "ADD_CREDENTIALS", credentials });
      notify({
        title: "Project completed",
        description: `${credentials.length} verified credential${credentials.length === 1 ? "" : "s"} issued.`,
        tone: "success",
      });
    };

    return {
      state: s,
      hydrated,
      currentUser,
      toasts,
      authOpen,
      authRole,
      openAuth,
      closeAuth,
      dismissToast,
      notify,
      signIn,
      signInAs,
      signOut,
      resetDemo,
      submitProblem,
      toggleUpvote,
      createTeam,
      joinTeam,
      leaveTeam,
      pledgeSupport,
      postUpdate,
      addMilestone,
      toggleMilestone,
      startProject,
      completeProject,
      userById,
      problemById,
      teamsForProblem,
      pledgesForProblem,
      credentialsForUser,
      teamsForUser,
      problemsForUser,
      pledgesForOrg,
      canAct,
      isTeamMember,
    };
  }, [data, hydrated, toasts, authOpen, authRole, openAuth, closeAuth, dismissToast, notify]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}

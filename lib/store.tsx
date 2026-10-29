"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

type Action =
  | { type: "HYDRATE"; state: PlatformState }
  | { type: "RESET" }
  | { type: "SET_CURRENT"; userId: string | null }
  | { type: "ADD_USER"; user: User }
  | { type: "ADD_PROBLEM"; problem: Problem }
  | { type: "UPDATE_PROBLEM"; id: string; patch: Partial<Problem> | ((p: Problem) => Partial<Problem>) }
  | { type: "ADD_TEAM"; team: Team }
  | { type: "UPDATE_TEAM"; id: string; patch: Partial<Team> | ((t: Team) => Partial<Team>) }
  | { type: "ADD_PLEDGE"; pledge: Pledge }
  | { type: "ADD_CREDENTIALS"; credentials: Credential[] };

function reducer(state: PlatformState, action: Action): PlatformState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
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
          p.id === action.id
            ? { ...p, ...(typeof action.patch === "function" ? action.patch(p) : action.patch) }
            : p,
        ),
      };
    case "ADD_TEAM":
      return { ...state, teams: [...state.teams, action.team] };
    case "UPDATE_TEAM":
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.id
            ? { ...t, ...(typeof action.patch === "function" ? action.patch(t) : action.patch) }
            : t,
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
  /* selectors */
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

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, seedState);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<Role | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlatformState;
        if (parsed && Array.isArray(parsed.problems)) {
          dispatch({ type: "HYDRATE", state: parsed });
        }
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable */
    }
  }, [state, hydrated]);

  const notify = useCallback((toast: Omit<Toast, "id">) => {
    const id = uid("toast");
    setToasts((t) => [...t, { ...toast, id }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const openAuth = useCallback((role?: Role) => {
    setAuthRole(role ?? null);
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  /* ---------- selectors ---------- */
  const userById = useCallback((id: string) => stateRef.current.users.find((u) => u.id === id), []);
  const problemById = useCallback((id: string) => stateRef.current.problems.find((p) => p.id === id), []);
  const teamsForProblem = useCallback(
    (problemId: string) => stateRef.current.teams.filter((t) => t.problemId === problemId),
    [],
  );
  const pledgesForProblem = useCallback(
    (problemId: string) => stateRef.current.pledges.filter((p) => p.problemId === problemId),
    [],
  );
  const credentialsForUser = useCallback(
    (userId: string) => stateRef.current.credentials.filter((c) => c.userId === userId),
    [],
  );
  const teamsForUser = useCallback(
    (userId: string) => stateRef.current.teams.filter((t) => t.memberIds.includes(userId)),
    [],
  );
  const problemsForUser = useCallback(
    (userId: string) => stateRef.current.problems.filter((p) => p.submittedBy === userId),
    [],
  );
  const pledgesForOrg = useCallback(
    (orgId: string) => stateRef.current.pledges.filter((p) => p.orgId === orgId),
    [],
  );
  const isTeamMember = useCallback(
    (problemId: string, userId: string) =>
      stateRef.current.teams.some((t) => t.problemId === problemId && t.memberIds.includes(userId)),
    [],
  );

  const requireUser = useCallback(
    (role?: Role): User | null => {
      const user = stateRef.current.users.find((u) => u.id === stateRef.current.currentUserId) ?? null;
      if (!user) {
        openAuth(role);
        return null;
      }
      if (role && user.role !== role) {
        notify({
          title: `This action is for ${role === "organization" ? "organizations" : role + "s"}`,
          description: `You are signed in as a ${user.role === "organization" ? "n organization" : user.role}. Switch account to continue.`,
          tone: "info",
        });
        return null;
      }
      return user;
    },
    [notify, openAuth],
  );

  const canAct = useCallback(
    (role: Role) => {
      const user = stateRef.current.users.find((u) => u.id === stateRef.current.currentUserId);
      return !!user && user.role === role;
    },
    [],
  );

  /* ---------- auth ---------- */
  const signIn = useCallback(
    (input: SignInInput) => {
      const existing = stateRef.current.users.find(
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
          (input.role === "community"
            ? "Community member"
            : input.role === "student"
              ? "Student"
              : "Organization"),
        location: input.location?.trim() || "Remote",
        skills: input.skills ?? [],
        avatarHue: Math.floor(Math.random() * 360),
        orgType: input.role === "organization" ? input.orgType ?? "NGO" : undefined,
        joinedAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_USER", user });
      dispatch({ type: "SET_CURRENT", userId: user.id });
      setAuthOpen(false);
      notify({ title: `Welcome, ${user.name.split(" ")[0]}`, description: "Your account is ready.", tone: "success" });
      return user;
    },
    [notify],
  );

  const signInAs = useCallback(
    (userId: string) => {
      const user = stateRef.current.users.find((u) => u.id === userId);
      if (!user) return;
      dispatch({ type: "SET_CURRENT", userId });
      setAuthOpen(false);
      notify({ title: `Signed in as ${user.name}`, tone: "success" });
    },
    [notify],
  );

  const signOut = useCallback(() => {
    dispatch({ type: "SET_CURRENT", userId: null });
    notify({ title: "Signed out", tone: "info" });
  }, [notify]);

  const resetDemo = useCallback(() => {
    dispatch({ type: "RESET" });
    notify({ title: "Demo data reset", tone: "info" });
  }, [notify]);

  /* ---------- problems ---------- */
  const submitProblem = useCallback(
    (input: SubmitProblemInput) => {
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
    },
    [notify, requireUser],
  );

  const toggleUpvote = useCallback(
    (problemId: string) => {
      const user = requireUser();
      if (!user) return;
      dispatch({
        type: "UPDATE_PROBLEM",
        id: problemId,
        patch: (p) => ({
          upvotes: p.upvotes.includes(user.id) ? p.upvotes.filter((x) => x !== user.id) : [...p.upvotes, user.id],
        }),
      });
    },
    [requireUser],
  );

  /* ---------- teams ---------- */
  const createTeam = useCallback(
    (problemId: string, input: { name: string; pitch: string; openRoles: string[]; myRole: string }) => {
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
      dispatch({
        type: "UPDATE_PROBLEM",
        id: problemId,
        patch: (p) => (p.status === "open" ? { status: "forming" } : {}),
      });
      notify({ title: `${team.name} created`, description: "Open roles are now visible to other students.", tone: "success" });
      return team;
    },
    [notify, requireUser],
  );

  const joinTeam = useCallback(
    (teamId: string, role: string) => {
      const user = requireUser("student");
      if (!user) return;
      const team = stateRef.current.teams.find((t) => t.id === teamId);
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
    },
    [notify, requireUser],
  );

  const leaveTeam = useCallback(
    (teamId: string) => {
      const user = requireUser("student");
      if (!user) return;
      const team = stateRef.current.teams.find((t) => t.id === teamId);
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
    },
    [notify, requireUser],
  );

  /* ---------- pledges ---------- */
  const pledgeSupport = useCallback(
    (problemId: string, input: { type: PledgeType; amount?: number; details: string }) => {
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
    },
    [notify, requireUser],
  );

  /* ---------- progress ---------- */
  const postUpdate = useCallback(
    (problemId: string, text: string) => {
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
    },
    [notify, requireUser],
  );

  const addMilestone = useCallback(
    (problemId: string, title: string) => {
      const user = requireUser();
      if (!user || !title.trim()) return;
      dispatch({
        type: "UPDATE_PROBLEM",
        id: problemId,
        patch: (p) => ({ milestones: [...p.milestones, { id: uid("m"), title: title.trim(), done: false }] }),
      });
    },
    [requireUser],
  );

  const toggleMilestone = useCallback(
    (problemId: string, milestoneId: string) => {
      const user = requireUser();
      if (!user) return;
      dispatch({
        type: "UPDATE_PROBLEM",
        id: problemId,
        patch: (p) => ({
          milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m)),
        }),
      });
    },
    [requireUser],
  );

  const startProject = useCallback(
    (problemId: string) => {
      const user = requireUser("student");
      if (!user) return;
      dispatch({ type: "UPDATE_PROBLEM", id: problemId, patch: { status: "in-progress" } });
      notify({ title: "Project started", description: "Keep the community posted with updates.", tone: "success" });
    },
    [notify, requireUser],
  );

  const completeProject = useCallback(
    (problemId: string) => {
      const user = requireUser();
      if (!user) return;
      const s = stateRef.current;
      const problem = s.problems.find((p) => p.id === problemId);
      if (!problem) return;
      const teams = s.teams.filter((t) => t.problemId === problemId);
      const orgs = s.pledges.filter((p) => p.problemId === problemId).map((p) => p.orgId);
      const verifiedBy = orgs[0] ?? (user.role === "organization" ? user.id : "platform");
      const issuedAt = new Date().toISOString();
      const credentials: Credential[] = [];
      const already = new Set(s.credentials.filter((c) => c.problemId === problemId).map((c) => c.userId));
      for (const team of teams) {
        for (const memberId of team.memberIds) {
          if (already.has(memberId)) continue;
          const member = s.users.find((u) => u.id === memberId);
          credentials.push({
            id: credentialId(),
            userId: memberId,
            problemId,
            teamId: team.id,
            role: team.memberRoles[memberId] ?? "Contributor",
            skills: (member?.skills ?? []).slice(0, 3).length ? (member?.skills ?? []).slice(0, 3) : problem.needs.slice(0, 2),
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
    },
    [notify, requireUser],
  );

  const value = useMemo<PlatformContextValue>(
    () => ({
      state,
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
    }),
    [
      state,
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
    ],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}

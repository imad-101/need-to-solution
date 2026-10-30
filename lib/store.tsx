"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as actions from "@/lib/actions";
import type { ActionResult, SignUpInput, SubmitProblemInput } from "@/lib/actions";
import type { ClientState, Credential, CurrentUser, PlatformState, Pledge, PledgeType, Problem, ReviewStatus, Role, Team, User } from "@/lib/types";
import { uid } from "./utils";

export type { SignUpInput, SubmitProblemInput };

/* ----------------------------- Toasts ----------------------------- */

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: "success" | "info" | "error";
}

/* ----------------------------- Context ----------------------------- */

interface PlatformContextValue {
  state: PlatformState;
  /** Always true now that state arrives from the server; kept so existing screens keep working. */
  hydrated: boolean;
  /** True while a mutation is in flight. */
  busy: boolean;
  currentUser: CurrentUser | null;
  toasts: Toast[];
  authOpen: boolean;
  authRole: Role | null;
  openAuth: (role?: Role) => void;
  closeAuth: () => void;
  dismissToast: (id: string) => void;
  notify: (toast: Omit<Toast, "id">) => void;
  refresh: () => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<CurrentUser | null>;
  signUp: (input: SignUpInput) => Promise<CurrentUser | null>;
  signOut: () => Promise<void>;
  submitProblem: (input: SubmitProblemInput) => Promise<{ id: string; reviewStatus: ReviewStatus } | null>;
  toggleUpvote: (problemId: string) => Promise<void>;
  createTeam: (problemId: string, input: { name: string; pitch: string; openRoles: string[]; myRole: string }) => Promise<Team | null>;
  joinTeam: (teamId: string, role: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  pledgeSupport: (problemId: string, input: { type: PledgeType; amount?: number; details: string }) => Promise<Pledge | null>;
  postUpdate: (problemId: string, text: string) => Promise<void>;
  addMilestone: (problemId: string, title: string) => Promise<void>;
  toggleMilestone: (problemId: string, milestoneId: string) => Promise<void>;
  startProject: (problemId: string) => Promise<void>;
  completeProject: (problemId: string) => Promise<void>;
  reviewProblem: (problemId: string, decision: "approved" | "rejected", note?: string) => Promise<boolean>;
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

export function PlatformProvider({ initial, children }: { initial: ClientState; children: ReactNode }) {
  const [client, setClient] = useState<ClientState>(initial);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<Role | null>(null);
  const [inFlight, setInFlight] = useState(0);
  const lastInitial = useRef(initial);

  // A full server render (reload, router.refresh) hands us fresh state.
  useEffect(() => {
    if (lastInitial.current !== initial) {
      lastInitial.current = initial;
      setClient(initial);
    }
  }, [initial]);

  const notify = useCallback((toast: Omit<Toast, "id">) => {
    const id = uid("toast");
    setToasts((t) => [...t, { ...toast, id }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4600);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const openAuth = useCallback((role?: Role) => {
    setAuthRole(role ?? null);
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const refresh = useCallback(async () => {
    try {
      setClient(await actions.getState());
    } catch {
      /* offline: keep what we have */
    }
  }, []);

  // Pick up changes made elsewhere (another tab, an admin approving something) when the tab regains focus.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  /** Applies an action result: swaps in the new state, or toasts the error. */
  const apply = useCallback(
    async <T,>(promise: Promise<ActionResult<T>>, success?: (data: T, next: ClientState) => Omit<Toast, "id"> | void): Promise<T | null> => {
      setInFlight((n) => n + 1);
      try {
        const result = await promise;
        if (!result.ok) {
          notify({ title: result.error, tone: "error" });
          return null;
        }
        setClient(result.state);
        const toast = success?.(result.data, result.state);
        if (toast) notify(toast);
        return result.data;
      } catch {
        notify({ title: "Could not reach the server", description: "Check your connection and try again.", tone: "error" });
        return null;
      } finally {
        setInFlight((n) => n - 1);
      }
    },
    [notify],
  );

  const value = useMemo<PlatformContextValue>(() => {
    const s = client.state;
    const currentUser = client.currentUser;

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
    const canAct = (role: Role) => !!currentUser && (currentUser.role === role || currentUser.role === "admin");

    /** Client-side gate: opens the sign-in modal or explains the role mismatch before calling the server. */
    const requireUser = (role?: Role): CurrentUser | null => {
      if (!currentUser) {
        openAuth(role);
        return null;
      }
      if (role && currentUser.role !== role && currentUser.role !== "admin") {
        notify({
          title: `This action is for ${role === "organization" ? "organizations" : role + "s"}`,
          description: `You are signed in as ${currentUser.role === "organization" ? "an organization" : "a " + currentUser.role}.`,
          tone: "info",
        });
        return null;
      }
      return currentUser;
    };

    /* ---------- auth ---------- */
    const signIn = async (input: { email: string; password: string }) => {
      const user = await apply(actions.signIn(input), (u) => ({ title: `Welcome back, ${u.name.split(" ")[0]}`, tone: "success" }));
      if (user) setAuthOpen(false);
      return user;
    };

    const signUp = async (input: SignUpInput) => {
      const user = await apply(actions.signUp(input), (u) => ({ title: `Welcome, ${u.name.split(" ")[0]}`, description: "Your account is ready.", tone: "success" }));
      if (user) setAuthOpen(false);
      return user;
    };

    const signOut = async () => {
      await apply(actions.signOut(), () => ({ title: "Signed out", tone: "info" }));
    };

    /* ---------- problems ---------- */
    const submitProblem = async (input: SubmitProblemInput) => {
      if (!requireUser()) return null;
      return apply(actions.submitProblem(input), (r) =>
        r.reviewStatus === "approved"
          ? { title: "Problem published", description: "Students and organizations can now find it.", tone: "success" }
          : { title: "Submitted for review", description: "An administrator will check it before it goes live.", tone: "success" },
      );
    };

    const toggleUpvote = async (problemId: string) => {
      if (!requireUser()) return;
      await apply(actions.toggleUpvote(problemId));
    };

    /* ---------- teams ---------- */
    const createTeam = async (problemId: string, input: { name: string; pitch: string; openRoles: string[]; myRole: string }) => {
      if (!requireUser("student")) return null;
      let created: Team | null = null;
      await apply(actions.createTeam(problemId, input), (r, next) => {
        created = next.state.teams.find((t) => t.id === r.id) ?? null;
        return { title: `${input.name.trim()} created`, description: "Open roles are now visible to other students.", tone: "success" };
      });
      return created;
    };

    const joinTeam = async (teamId: string, role: string) => {
      if (!requireUser("student")) return;
      const team = s.teams.find((t) => t.id === teamId);
      await apply(actions.joinTeam(teamId, role), () => ({ title: `You joined ${team?.name ?? "the team"}`, description: `Role: ${role}`, tone: "success" }));
    };

    const leaveTeam = async (teamId: string) => {
      if (!requireUser("student")) return;
      const team = s.teams.find((t) => t.id === teamId);
      await apply(actions.leaveTeam(teamId), () => ({ title: `You left ${team?.name ?? "the team"}`, tone: "info" }));
    };

    /* ---------- pledges ---------- */
    const pledgeSupport = async (problemId: string, input: { type: PledgeType; amount?: number; details: string }) => {
      if (!requireUser("organization")) return null;
      let created: Pledge | null = null;
      await apply(actions.pledgeSupport(problemId, input), (r, next) => {
        created = next.state.pledges.find((p) => p.id === r.id) ?? null;
        return { title: "Support pledged", description: "The team and the community can see it now.", tone: "success" };
      });
      return created;
    };

    /* ---------- progress ---------- */
    const postUpdate = async (problemId: string, text: string) => {
      if (!requireUser() || !text.trim()) return;
      await apply(actions.postUpdate(problemId, text), () => ({ title: "Update posted", tone: "success" }));
    };

    const addMilestone = async (problemId: string, title: string) => {
      if (!requireUser() || !title.trim()) return;
      await apply(actions.addMilestone(problemId, title));
    };

    const toggleMilestone = async (problemId: string, milestoneId: string) => {
      if (!requireUser()) return;
      await apply(actions.toggleMilestone(problemId, milestoneId));
    };

    const startProject = async (problemId: string) => {
      if (!requireUser("student")) return;
      await apply(actions.startProject(problemId), () => ({ title: "Project started", description: "Keep the community posted with updates.", tone: "success" }));
    };

    const completeProject = async (problemId: string) => {
      if (!requireUser()) return;
      await apply(actions.completeProject(problemId), (r) => ({
        title: "Project completed",
        description: `${r.issued} verified certificate${r.issued === 1 ? "" : "s"} issued.`,
        tone: "success",
      }));
    };

    /* ---------- admin ---------- */
    const reviewProblem = async (problemId: string, decision: "approved" | "rejected", note?: string) => {
      if (!requireUser("admin")) return false;
      const r = await apply(actions.reviewProblem(problemId, decision, note), () => ({
        title: decision === "approved" ? "Problem approved" : "Problem declined",
        description: decision === "approved" ? "It is now public." : "The submitter can see your note on their dashboard.",
        tone: decision === "approved" ? "success" : "info",
      }));
      return r !== null;
    };

    return {
      state: s,
      hydrated: true,
      busy: inFlight > 0,
      currentUser,
      toasts,
      authOpen,
      authRole,
      openAuth,
      closeAuth,
      dismissToast,
      notify,
      refresh,
      signIn,
      signUp,
      signOut,
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
      reviewProblem,
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
  }, [client, inFlight, toasts, authOpen, authRole, openAuth, closeAuth, dismissToast, notify, refresh, apply]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}

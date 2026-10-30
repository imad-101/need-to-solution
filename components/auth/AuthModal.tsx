"use client";

import { useState } from "react";
import { Building2, GraduationCap, KeyRound, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TagInput } from "@/components/ui/Field";
import { usePlatform } from "@/lib/store";
import { ORG_TYPES, ROLE_LABEL, type OrgType, type Role, type SignupRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const roleMeta: Record<SignupRole, { icon: React.ReactNode; blurb: string }> = {
  community: { icon: <Users className="size-4" />, blurb: "Submit problems your community faces." },
  student: { icon: <GraduationCap className="size-4" />, blurb: "Form teams and earn verified experience." },
  organization: { icon: <Building2 className="size-4" />, blurb: "Fund, mentor or resource projects." },
};

const skillSuggestions: Record<SignupRole, string[]> = {
  community: ["Local outreach", "Community organizing", "Translation"],
  student: ["Web development", "Graphic design", "Data science", "Public health", "Engineering", "Research"],
  organization: ["Grant funding", "Mentorship", "Equipment", "Field logistics"],
};

/** Seeded accounts that make it easy to try each perspective. The password is set by `npm run db:seed`. */
const demoAccounts: Array<{ label: string; email: string; role: Role }> = [
  { label: "Dev Patel · student", email: "dev@needtosolution.demo", role: "student" },
  { label: "Amina Yusuf · community", email: "amina@needtosolution.demo", role: "community" },
  { label: "Hope Foundation · organization", email: "hope@needtosolution.demo", role: "organization" },
  { label: "Platform administrator", email: "admin@needtosolution.org", role: "admin" },
];

export function AuthModal() {
  const { authOpen, authRole, closeAuth } = usePlatform();
  return (
    <Modal open={authOpen} onClose={closeAuth} title="Sign in to NeedToSolution" description="Your account keeps your problems, teams and certificates together.">
      <AuthBody key={`${authOpen}-${authRole ?? "any"}`} initialRole={authRole && authRole !== "admin" ? authRole : "student"} />
    </Modal>
  );
}

function AuthBody({ initialRole }: { initialRole: SignupRole }) {
  const { signIn, signUp, busy } = usePlatform();
  const [tab, setTab] = useState<"signin" | "create">("signin");
  const [role, setRole] = useState<SignupRole>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [orgType, setOrgType] = useState<OrgType>("NGO");
  const [showDemo, setShowDemo] = useState(false);

  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    await signIn({ email, password });
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8) return;
    await signUp({ name, email, password, role, headline, location, skills, orgType: role === "organization" ? orgType : undefined });
  };

  return (
    <>
      <div className="mb-5 flex gap-6 border-b border-line text-sm">
        {(["signin", "create"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn("-mb-px border-b-2 pb-2.5 font-medium transition", tab === t ? "border-pine-700 text-ink" : "border-transparent text-ink-3 hover:text-ink")}
          >
            {t === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {tab === "signin" ? (
        <form onSubmit={submitSignIn} className="space-y-4">
          <Field label="Email" required>
            <input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.org" required />
          </Field>
          <Field label="Password" required>
            <input className="field" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-xs text-ink-3">
            New here?{" "}
            <button type="button" onClick={() => setTab("create")} className="font-medium text-pine-700 hover:underline underline-offset-4">
              Create an account
            </button>
          </p>

          <div className="rounded-md border border-dashed border-line bg-canvas p-3">
            <button type="button" onClick={() => setShowDemo((v) => !v)} className="flex w-full items-center gap-2 text-left text-xs font-medium text-ink-2">
              <KeyRound className="size-3.5" /> {showDemo ? "Hide demo accounts" : "Try a demo account"}
            </button>
            {showDemo && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[11px] text-ink-3">Demo password is the one set in DEMO_PASSWORD when the database was seeded (default demo1234). The admin password is ADMIN_PASSWORD.</p>
                {demoAccounts.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => {
                      setEmail(d.email);
                      setPassword(d.role === "admin" ? "" : "demo1234");
                    }}
                    className="flex w-full items-center justify-between rounded-md border border-line bg-surface px-3 py-2 text-left text-xs transition hover:border-ink-3"
                  >
                    <span className="font-medium text-ink">{d.label}</span>
                    <span className="font-mono text-[11px] text-ink-3">{d.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>
      ) : (
        <form onSubmit={submitCreate} className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(roleMeta) as SignupRole[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={cn("rounded-lg border p-3 text-left transition", role === r ? "border-pine-600 bg-pine-50" : "border-line bg-surface hover:border-line-strong")}
              >
                <span className={cn("mb-2 inline-flex rounded-md p-1.5", role === r ? "bg-pine-700 text-white" : "bg-canvas text-ink-2")}>{roleMeta[r].icon}</span>
                <p className="text-sm font-medium text-ink">{ROLE_LABEL[r]}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-3">{roleMeta[r].blurb}</p>
              </button>
            ))}
          </div>

          <Field label={role === "organization" ? "Organization name" : "Full name"} required>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={role === "organization" ? "e.g. Hope Foundation" : "e.g. Dev Patel"} required />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" required>
              <input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.org" required />
            </Field>
            <Field label="Password" required hint="At least 8 characters">
              <input className="field" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={role === "student" ? "Programme" : role === "organization" ? "What you do" : "Headline"}>
              <input
                className="field"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder={role === "student" ? "Computer Science, 3rd year" : role === "organization" ? "Community health NGO" : "Community health volunteer"}
              />
            </Field>
            <Field label="Location">
              <input className="field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
            </Field>
          </div>

          {role === "organization" && (
            <Field label="Organization type">
              <select className="field" value={orgType} onChange={(e) => setOrgType(e.target.value as OrgType)}>
                {ORG_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label={role === "organization" ? "What you can offer" : "Skills"} hint="Enter to add">
            <TagInput value={skills} onChange={setSkills} placeholder="Add a few…" suggestions={skillSuggestions[role]} />
          </Field>

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Creating account…" : `Continue as ${ROLE_LABEL[role].toLowerCase()}`}
          </Button>
        </form>
      )}
    </>
  );
}

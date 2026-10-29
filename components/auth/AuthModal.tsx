"use client";

import { useState } from "react";
import { Building2, GraduationCap, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TagInput } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import { ROLE_LABEL, type Role, type User } from "@/lib/types";
import { cn } from "@/lib/utils";

const roleMeta: Record<Role, { icon: React.ReactNode; blurb: string }> = {
  community: { icon: <Users className="size-4" />, blurb: "Submit problems your community faces." },
  student: { icon: <GraduationCap className="size-4" />, blurb: "Form teams and earn verified experience." },
  organization: { icon: <Building2 className="size-4" />, blurb: "Fund, mentor or resource projects." },
};

const skillSuggestions: Record<Role, string[]> = {
  community: ["Local outreach", "Community organizing", "Translation"],
  student: ["Web development", "Graphic design", "Data science", "Public health", "Engineering", "Research"],
  organization: ["Grant funding", "Mentorship", "Equipment", "Field logistics"],
};

export function AuthModal() {
  const { authOpen, authRole, closeAuth } = usePlatform();
  return (
    <Modal open={authOpen} onClose={closeAuth} title="Sign in to NeedToSolution" description="Choose how you take part. This demo needs no password.">
      <AuthBody key={`${authOpen}-${authRole ?? "any"}`} initialRole={authRole ?? "student"} />
    </Modal>
  );
}

function AuthBody({ initialRole }: { initialRole: Role }) {
  const { signIn, signInAs, state } = usePlatform();
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [orgType, setOrgType] = useState<NonNullable<User["orgType"]>>("NGO");
  const [tab, setTab] = useState<"create" | "demo">("create");

  const demoUsers = state.users.filter((u) => ["u-amina", "u-dev", "u-hope", "u-sara", "u-rahul", "u-civic"].includes(u.id));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    signIn({ name, role, headline, location, skills, orgType: role === "organization" ? orgType : undefined });
  };

  return (
    <>
      <div className="mb-5 flex gap-6 border-b border-line text-sm">
        {(["create", "demo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 pb-2.5 font-medium transition",
              tab === t ? "border-pine-700 text-ink" : "border-transparent text-ink-3 hover:text-ink",
            )}
          >
            {t === "create" ? "Create account" : "Use a demo account"}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(roleMeta) as Role[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-lg border p-3 text-left transition",
                  role === r ? "border-pine-600 bg-pine-50" : "border-line bg-surface hover:border-line-strong",
                )}
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
            <Field label={role === "student" ? "Programme" : role === "organization" ? "What you do" : "Headline"}>
              <input className="field" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={role === "student" ? "Computer Science, 3rd year" : role === "organization" ? "Community health NGO" : "Community health volunteer"} />
            </Field>
            <Field label="Location">
              <input className="field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
            </Field>
          </div>

          {role === "organization" && (
            <Field label="Organization type">
              <select className="field" value={orgType} onChange={(e) => setOrgType(e.target.value as NonNullable<User["orgType"]>)}>
                {["NGO", "Company", "University", "Government", "Foundation"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label={role === "organization" ? "What you can offer" : "Skills"} hint="Enter to add">
            <TagInput value={skills} onChange={setSkills} placeholder="Add a few…" suggestions={skillSuggestions[role]} />
          </Field>

          <Button type="submit" className="w-full" size="lg">
            Continue as {ROLE_LABEL[role].toLowerCase()}
          </Button>
        </form>
      ) : (
        <div className="space-y-2">
          <p className="mb-3 text-xs text-ink-3">Jump into a seeded account to explore each perspective.</p>
          {demoUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => signInAs(u.id)}
              className="card card-hover flex w-full items-center gap-3 p-3 text-left"
            >
              <Avatar user={u} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{u.name}</span>
                <span className="block truncate text-xs text-ink-3">{u.headline}</span>
              </span>
              <span className="rounded-md border border-line px-2 py-0.5 text-[11px] text-ink-3">{ROLE_LABEL[u.role]}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

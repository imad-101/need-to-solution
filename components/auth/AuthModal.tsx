"use client";

import { useEffect, useState } from "react";
import { Building2, GraduationCap, Users, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TagInput } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import { ROLE_LABEL, type Role, type User } from "@/lib/types";
import { cn } from "@/lib/utils";

const roleMeta: Record<Role, { icon: React.ReactNode; blurb: string }> = {
  community: { icon: <Users className="size-5" />, blurb: "Submit problems your community faces." },
  student: { icon: <GraduationCap className="size-5" />, blurb: "Form teams and earn verified experience." },
  organization: { icon: <Building2 className="size-5" />, blurb: "Fund, mentor or resource projects." },
};

const skillSuggestions: Record<Role, string[]> = {
  community: ["Local outreach", "Community organizing", "Translation"],
  student: ["Web development", "Graphic design", "Data science", "Public health", "Engineering", "Research"],
  organization: ["Grant funding", "Mentorship", "Equipment", "Field logistics"],
};

export function AuthModal() {
  const { authOpen, authRole, closeAuth, signIn, signInAs, state } = usePlatform();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [orgType, setOrgType] = useState<NonNullable<User["orgType"]>>("NGO");
  const [tab, setTab] = useState<"create" | "demo">("create");

  useEffect(() => {
    if (authOpen) {
      setRole(authRole ?? "student");
      setTab("create");
    }
  }, [authOpen, authRole]);

  const demoUsers = state.users.filter((u) => ["u-amina", "u-dev", "u-hope", "u-sara", "u-rahul", "u-civic"].includes(u.id));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    signIn({ name, role, headline, location, skills, orgType: role === "organization" ? orgType : undefined });
    setName("");
    setHeadline("");
    setLocation("");
    setSkills([]);
  };

  return (
    <Modal open={authOpen} onClose={closeAuth} title="Join NeedToSolution" description="Choose how you want to take part. No password needed for this demo.">
      <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1 text-sm">
        {(["create", "demo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg py-2 font-medium transition",
              tab === t ? "bg-white/10 text-white shadow" : "text-white/50 hover:text-white",
            )}
          >
            {t === "create" ? "Create account" : "Try a demo account"}
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
                  "relative rounded-2xl border p-3 text-left transition",
                  role === r
                    ? "border-brand-400/60 bg-brand-500/15 ring-glow"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20",
                )}
              >
                <span className={cn("mb-2 inline-flex rounded-lg p-1.5", role === r ? "bg-brand-gradient text-white" : "bg-white/8 text-white/70")}>
                  {roleMeta[r].icon}
                </span>
                <p className="text-sm font-medium text-white">{ROLE_LABEL[r]}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-white/50">{roleMeta[r].blurb}</p>
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
            <Sparkles className="size-4" />
            Continue as {ROLE_LABEL[role].toLowerCase()}
          </Button>
        </form>
      ) : (
        <div className="space-y-2">
          <p className="mb-3 text-xs text-white/45">Jump into a seeded account to explore each perspective.</p>
          {demoUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => signInAs(u.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-brand-400/50 hover:bg-brand-500/10"
            >
              <Avatar user={u} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{u.name}</span>
                <span className="block truncate text-xs text-white/50">{u.headline}</span>
              </span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
                {ROLE_LABEL[u.role]}
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

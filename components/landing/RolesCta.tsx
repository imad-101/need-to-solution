"use client";

import { ArrowRight, Building2, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading, Accent } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { usePlatform } from "@/lib/store";
import type { Role } from "@/lib/types";

const roles: Array<{ role: Role; icon: React.ReactNode; title: string; body: string; cta: string; points: string[] }> = [
  {
    role: "community",
    icon: <Users className="size-5" />,
    title: "I see a problem",
    body: "Describe what your community is facing. You stay in the loop as teams form and work happens.",
    cta: "Submit a problem",
    points: ["Takes 5 minutes", "You approve the direction", "Updates come to you"],
  },
  {
    role: "student",
    icon: <GraduationCap className="size-5" />,
    title: "I want to build",
    body: "Form or join a team around a problem that fits your skills. Ship something that matters.",
    cta: "Find a team",
    points: ["Real stakes, real users", "Mentors from partner orgs", "Verified credential on completion"],
  },
  {
    role: "organization",
    icon: <Building2 className="size-5" />,
    title: "I can support",
    body: "Pledge funding, mentorship or resources directly on a problem page. See exactly where it goes.",
    cta: "Back a project",
    points: ["Named teams, visible plans", "Milestone tracking", "You verify the outcome"],
  },
];

export function RolesCta() {
  const { openAuth, currentUser, state } = usePlatform();
  const sample = state.credentials[0];

  return (
    <>
      <section id="credentials" className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Verified experience"
              title={
                <>
                  Not a certificate of attendance. <Accent>Proof of work.</Accent>
                </>
              }
              description="When a project completes, every contributor receives a credential with a public ID. It names the role, the skills, the hours, the project, and the organization that vouched for it. Anyone can verify it in seconds."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={sample ? `/verify/${sample.id}` : "/verify/NTS-7F3K-9Q2A"} variant="outline">
                Try the verifier <ArrowRight className="size-4" />
              </Button>
              <Button href="/contributors/u-dev" variant="ghost">
                See a contributor profile
              </Button>
            </div>
          </Reveal>
          <Reveal delay={120}>
            {sample && (
              <div className="relative">
                <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-brand-500/25 to-magenta-500/15 blur-3xl" />
                <div className="relative animate-float">
                  <CredentialCard credential={sample} showUser />
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Get started"
              title={
                <>
                  Pick your role. <Accent>The loop starts with you.</Accent>
                </>
              }
            />
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {roles.map((r, i) => (
              <Reveal key={r.role} delay={i * 90}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-brand-400/40">
                  <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-500/0 blur-3xl transition group-hover:bg-brand-500/25" />
                  <span className="relative flex size-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">{r.icon}</span>
                  <h3 className="relative mt-6 text-2xl font-semibold tracking-tight text-white">{r.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/60">{r.body}</p>
                  <ul className="relative mt-5 space-y-2 text-sm text-white/70">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-magenta-400" /> {p}
                      </li>
                    ))}
                  </ul>
                  <div className="relative mt-auto pt-7">
                    {currentUser?.role === r.role ? (
                      <Button href={r.role === "community" ? "/submit" : r.role === "student" ? "/teams" : "/organizations"} className="w-full">
                        {r.cta} <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      <Button onClick={() => openAuth(r.role)} className="w-full">
                        {r.cta} <ArrowRight className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

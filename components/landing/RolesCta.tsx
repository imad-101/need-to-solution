"use client";

import type { CSSProperties } from "react";
import { ArrowRight, HandHeart, Megaphone, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { usePlatform } from "@/lib/store";
import type { Role } from "@/lib/types";

const roles: Array<{ role: Role; title: string; body: string; cta: string; points: string[]; icon: typeof Megaphone }> = [
  {
    role: "community",
    title: "I see a problem",
    body: "Describe what your community is facing. You stay in the loop as teams form and work happens.",
    cta: "Submit a problem",
    points: ["Takes about five minutes", "You approve the direction", "Updates come to you"],
    icon: Megaphone,
  },
  {
    role: "student",
    title: "I want to build",
    body: "Form or join a team around a problem that fits your skills. Ship something that matters.",
    cta: "Find a team",
    points: ["Real stakes, real users", "Mentors from partner organizations", "Verified credential on completion"],
    icon: Wrench,
  },
  {
    role: "organization",
    title: "I can support",
    body: "Pledge funding, mentorship or resources directly on a problem page. See exactly where it goes.",
    cta: "Back a project",
    points: ["Named teams, visible plans", "Milestone tracking", "You verify the outcome"],
    icon: HandHeart,
  },
];

export function RolesCta() {
  const { openAuth, currentUser, state } = usePlatform();
  const sample = state.credentials[0];

  return (
    <>
      <section id="credentials" className="relative overflow-hidden border-t border-line bg-canvas py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-dots absolute inset-0 opacity-70" />
          <div className="animate-drift absolute -bottom-32 right-[5%] size-96 rounded-full bg-pine-100/60 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Verified experience"
              title="Not a certificate of attendance. A record of work."
              description="When a project completes, every contributor receives a credential with a public ID. It names the role, the skills, the hours, the project, and the organization that vouched for it. Anyone can verify it in seconds."
            />
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={sample ? `/verify/${sample.id}` : "/verify/NTS-7F3K-9Q2A"} variant="outline">
                Try the verifier <ArrowRight className="size-4" />
              </Button>
              <Button href="/contributors/u-dev" variant="ghost">
                See a contributor profile
              </Button>
            </div>
          </Reveal>
          <Reveal delay={80}>
            {sample && (
              <div className="animate-float-slow" style={{ "--tilt": "-0.6deg" } as CSSProperties}>
                <CredentialCard credential={sample} showUser className="shadow-[0_30px_70px_-40px_rgba(27,27,25,0.45)]" />
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Get started" title="Pick your role. The loop starts with you." />
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {roles.map((r, i) => {
              const Icon = r.icon;
              const href = r.role === "community" ? "/submit" : r.role === "student" ? "/teams" : "/organizations";
              return (
                <Reveal
                  key={r.role}
                  delay={i * 90}
                  className="card-accent group flex h-full flex-col bg-surface p-7 transition-colors duration-300 hover:bg-pine-50/40"
                >
                  <span className="flex size-10 items-center justify-center rounded-md border border-line bg-canvas text-ink-2 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-pine-200 group-hover:bg-pine-50 group-hover:text-pine-700">
                    <Icon className="size-[18px]" />
                  </span>
                  <h3 className="font-serif-display mt-5 text-2xl text-ink">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{r.body}</p>
                  <ul className="mt-5 space-y-2 text-sm text-ink-2">
                    {r.points.map((p, j) => (
                      <li
                        key={p}
                        className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-0.5"
                        style={{ transitionDelay: `${j * 40}ms` }}
                      >
                        <span className="size-1.5 rounded-full bg-pine-600" /> {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-7">
                    {currentUser?.role === r.role ? (
                      <Button href={href} className="w-full">
                        {r.cta} <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      <Button onClick={() => openAuth(r.role)} className="w-full">
                        {r.cta} <ArrowRight className="size-4" />
                      </Button>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

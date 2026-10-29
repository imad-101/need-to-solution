import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, GraduationCap, Users } from "lucide-react";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Distinctive } from "@/components/landing/Distinctive";
import { Eyebrow, Accent } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "How it works",
  description: "How communities, students and organizations work together on NeedToSolution, and how verified credentials are issued.",
};

const guides = [
  {
    id: "community",
    icon: <Users className="size-5" />,
    title: "For communities",
    lead: "You know the problem better than anyone. Your job is to describe it, not to solve it.",
    steps: [
      "Create a community account and submit the problem: what's happening, who it affects, what kind of help would change it.",
      "Students see it instantly. When a team forms, you'll see their approach and the roles they're recruiting.",
      "Post updates, answer questions, and check off milestones alongside the team.",
      "When the project ships, you can mark it complete. Credentials are issued to every contributor.",
    ],
    cta: { href: "/submit", label: "Submit a problem" },
  },
  {
    id: "students",
    icon: <GraduationCap className="size-5" />,
    title: "For students",
    lead: "Stop applying for experience. Build it on a problem someone actually needs solved.",
    steps: [
      "Browse problems by category, location and the skills they need. Back the ones you care about.",
      "Form a team: name it, describe your approach, list the roles you still need. Or join a team with an open role.",
      "Once the team is ready, the lead starts the project. Track milestones and post updates in public.",
      "On completion you receive a verified credential with a public ID, vouched for by the supporting organization.",
    ],
    cta: { href: "/teams", label: "Find a team" },
  },
  {
    id: "organizations",
    icon: <Building2 className="size-5" />,
    title: "For organizations",
    lead: "Fund outcomes, mentor teams, and verify the work. Your name goes on the credential.",
    steps: [
      "Create an organization account. Browse projects sorted by how much support they still need.",
      "Pledge funding, mentorship or resources directly on a problem page with specific details.",
      "Follow progress through milestones and updates. Mentor where you can.",
      "When the project completes, your organization is recorded as the verifier on each contributor's credential.",
    ],
    cta: { href: "/organizations", label: "Back a project" },
  },
  {
    id: "credentials",
    icon: <BadgeCheck className="size-5" />,
    title: "Verified experience",
    lead: "A credential here is proof of real work, not a participation badge.",
    steps: [
      "Credentials are issued automatically when a project is marked complete by the team lead, submitter or a supporting organization.",
      "Each one records the role, skills, hours, project, team and verifier, with a public ID like NTS-7F3K-9Q2A.",
      "Anyone can confirm a credential at /verify. It links back to the public project record with dated updates.",
      "Contributors collect credentials on their profile. Share it with employers, schools or the next team.",
    ],
    cta: { href: "/verify/NTS-7F3K-9Q2A", label: "Try the verifier" },
  },
];

export default function HowItWorksPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 sm:pt-32">
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            A platform where communities post real problems for <Accent>students and organizations to solve.</Accent>
          </h1>
          <p className="mt-4 text-pretty text-base text-white/55 sm:text-lg">
            Here is the full loop, and what each role does inside it.
          </p>
        </div>
      </div>

      <HowItWorks />

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="space-y-6">
          {guides.map((g, i) => (
            <Reveal key={g.id} delay={i * 60}>
              <article id={g.id} className="glass grid scroll-mt-28 gap-8 rounded-[2rem] p-7 sm:p-10 lg:grid-cols-[320px_1fr]">
                <div>
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">{g.icon}</span>
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">{g.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{g.lead}</p>
                  <Button href={g.cta.href} variant="outline" className="mt-6">
                    {g.cta.label} <ArrowRight className="size-4" />
                  </Button>
                </div>
                <ol className="space-y-4">
                  {g.steps.map((s, j) => (
                    <li key={j} className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/8 font-mono text-xs text-brand-200">{j + 1}</span>
                      <p className="text-sm leading-relaxed text-white/75">{s}</p>
                    </li>
                  ))}
                </ol>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Distinctive />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-400/30 bg-brand-gradient p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
          <h2 className="relative text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ready to start the loop?</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-white/80">Post a problem, join a team, or back a project. Each one creates the next opportunity.</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/problems" variant="secondary" size="lg">
              Browse problems
            </Button>
            <Link href="/submit" className="inline-flex h-13 items-center rounded-2xl border border-white/30 px-7 text-base font-medium text-white transition hover:bg-white/10">
              Submit a problem
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

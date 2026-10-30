import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Distinctive } from "@/components/landing/Distinctive";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "How it works",
  description: "How communities, students and organizations work together on NeedToSolution, and how verified credentials are issued.",
};

const guides = [
  {
    id: "community",
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
    title: "Verified experience",
    lead: "A credential here is a record of real work, not a participation badge.",
    steps: [
      "Credentials are issued automatically when a project is marked complete by the team lead, submitter or a supporting organization.",
      "Each one records the role, skills, hours, project, team and verifier, with a public ID like NTS-7F3K-9Q2A.",
      "Anyone can confirm a credential on the verify page. It links back to the public project record with dated updates.",
      "Contributors collect credentials on their profile. Share it with employers, schools or the next team.",
    ],
    cta: { href: "/verify/NTS-7F3K-9Q2A", label: "Try the verifier" },
  },
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function HowItWorksPage() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="max-w-2xl border-b border-line pb-8">
          <Eyebrow className="enter">How it works</Eyebrow>
          <h1 className="enter font-serif-display mt-3 text-balance text-4xl text-ink sm:text-5xl" style={delay(80)}>
            A platform where communities post real problems for students and organizations to solve.
          </h1>
          <p className="enter mt-4 text-pretty text-base text-ink-2 sm:text-[17px]" style={delay(160)}>
            Here is the full loop, and what each role does inside it.
          </p>
        </div>
      </div>

      <HowItWorks />

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="space-y-6">
          {guides.map((g, i) => (
            <Reveal key={g.id} delay={i * 40}>
              <article id={g.id} className="card card-hover card-accent grid scroll-mt-24 gap-8 p-7 sm:p-9 lg:grid-cols-[300px_1fr]">
                <div>
                  <h2 className="font-serif-display text-2xl text-ink">{g.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{g.lead}</p>
                  <Button href={g.cta.href} variant="outline" className="mt-6">
                    {g.cta.label} <ArrowRight className="size-4" />
                  </Button>
                </div>
                <ol className="divide-y divide-line">
                  {g.steps.map((s, j) => (
                    <li key={j} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-full border border-line-strong text-[11px] font-medium text-ink-2">{j + 1}</span>
                      <p className="text-sm leading-relaxed text-ink-2">{s}</p>
                    </li>
                  ))}
                </ol>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Distinctive />

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="card relative flex flex-col items-start justify-between gap-6 overflow-hidden border-pine-700 bg-pine-700 p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="animate-drift absolute -right-20 -top-24 size-72 rounded-full bg-pine-500/50 blur-3xl" />
            <div
              className="animate-drift absolute -bottom-28 left-1/3 size-64 rounded-full bg-pine-800/80 blur-3xl"
              style={{ animationDirection: "alternate-reverse" }}
            />
          </div>
          <div className="relative">
            <h2 className="font-serif-display text-2xl sm:text-3xl">Ready to start the loop?</h2>
            <p className="mt-2 max-w-lg text-pine-100">Post a problem, join a team, or back a project. Each one creates the next opportunity.</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <Button href="/problems" variant="outline" className="border-transparent bg-white text-pine-800 hover:bg-pine-50">
              Browse problems
            </Button>
            <Button href="/submit" className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10">
              Submit a problem
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { X, Check, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const oldWay = [
  "Scroll job boards for entry-level roles that want three years of experience",
  "Apply to internships with no idea what you would actually build",
  "Pad a résumé with coursework nobody can verify",
  "Communities with real needs never meet the people who could help",
];

const newWay = [
  "A real problem is posted by someone who lives with it",
  "You see exactly what's needed, who's on the team, and who's backing it",
  "You ship something that matters and receive a verifiable credential",
  "Organizations fund outcomes, not applications",
];

const pillars = [
  { k: "Every problem is an opening.", d: "No posting goes unmatched. Each need is a role waiting for a team." },
  { k: "Every team is a portfolio.", d: "Work happens in public, with updates, milestones and backers." },
  { k: "Every result is verified.", d: "Credentials are vouched for by the organizations who saw the work." },
];

export function Distinctive() {
  return (
    <section id="distinctive" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="What's distinctive"
            title="Instead of asking people to search for opportunities, the platform generates opportunities from problems that need solving."
          />
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-2">
          <Reveal className="group bg-surface p-7 sm:p-9">
            <p className="label">The usual way</p>
            <h3 className="font-serif-display mt-2 text-xl text-ink">Search for opportunities</h3>
            <ul className="mt-6 space-y-3.5">
              {oldWay.map((t, i) => (
                <Reveal key={t} as="li" delay={120 + i * 70} className="flex items-start gap-3 text-sm leading-relaxed text-ink-2 transition-colors duration-300 group-hover:text-ink-3">
                  <X className="mt-0.5 size-4 shrink-0 text-ink-4" />
                  <span className="decoration-ink-4 decoration-1 underline-offset-2 transition-all duration-300 group-hover:line-through">{t}</span>
                </Reveal>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80} className="relative overflow-hidden bg-pine-50 p-7 sm:p-9">
            <div aria-hidden className="animate-drift pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-pine-100 blur-3xl" />
            <p className="label relative flex items-center gap-2 text-pine-700">
              <Sparkles className="size-3.5" /> This platform
            </p>
            <h3 className="font-serif-display relative mt-2 text-xl text-ink">Opportunities generated from needs</h3>
            <ul className="relative mt-6 space-y-3.5">
              {newWay.map((t, i) => (
                <Reveal key={t} as="li" delay={200 + i * 70} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-pine-700 text-white">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  {t}
                </Reveal>
              ))}
            </ul>
          </Reveal>
        </div>

        <dl className="mt-6 grid gap-6 sm:grid-cols-3">
          {pillars.map((x, i) => (
            <Reveal key={x.k} delay={120 + i * 80} className="group border-t border-line pt-4 transition-colors duration-300 hover:border-pine-600">
              <dt className="font-serif-display text-lg text-ink transition-colors group-hover:text-pine-700">{x.k}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-2">{x.d}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

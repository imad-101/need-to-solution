import { Search, Sparkles, X, Check } from "lucide-react";
import { SectionHeading, Accent } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const oldWay = [
  "Scroll job boards for 'entry-level' roles that want 3 years of experience",
  "Apply to internships with no idea what you'd actually build",
  "Pad a résumé with coursework nobody can verify",
  "Communities with real needs never meet the people who could help",
];

const newWay = [
  "A real problem is posted by someone who lives with it",
  "You see exactly what's needed, who's on the team, and who's backing it",
  "You ship something that matters and get a verifiable credential",
  "Organizations fund outcomes, not applications",
];

export function Distinctive() {
  return (
    <section id="distinctive" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="What's distinctive"
            title={
              <>
                Instead of asking people to search for opportunities, the platform{" "}
                <Accent>generates opportunities from problems that need solving.</Accent>
              </>
            }
          />
        </Reveal>

        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02] p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50">
                  <Search className="size-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">The old way</p>
                  <h3 className="text-lg font-semibold text-white/80">Search for opportunities</h3>
                </div>
              </div>
              <ul className="mt-7 space-y-3.5">
                {oldWay.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm leading-relaxed text-white/50">
                    <X className="mt-0.5 size-4 shrink-0 text-rose-300/70" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/60 to-transparent" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative h-full overflow-hidden rounded-3xl border border-brand-400/40 bg-gradient-to-br from-brand-600/25 via-ink-3/40 to-magenta-600/15 p-7 ring-glow sm:p-9">
              <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-magenta-500/25 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-200">This platform</p>
                  <h3 className="text-lg font-semibold text-white">Opportunities generated from needs</h3>
                </div>
              </div>
              <ul className="relative mt-7 space-y-3.5">
                {newWay.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm leading-relaxed text-white/85">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { k: "Every problem", v: "is an opening", d: "No posting goes unmatched. Each need is a role waiting for a team." },
              { k: "Every team", v: "is a portfolio", d: "Work happens in public, with updates, milestones and backers." },
              { k: "Every result", v: "is verified", d: "Credentials are vouched for by the organizations who saw the work." },
            ].map((x) => (
              <div key={x.k} className="glass rounded-2xl p-5">
                <p className="text-sm text-white/50">{x.k}</p>
                <p className="text-xl font-semibold tracking-tight text-white">{x.v}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{x.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

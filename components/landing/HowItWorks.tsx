import { ArrowRight, BadgeCheck, HandCoins, Megaphone, Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    who: "Community members",
    title: "submit problems.",
    body: "A nurse, a principal, a farmer. Anyone who sees a need describes it plainly: what is happening, who it affects, what help would change it.",
    icon: Megaphone,
  },
  {
    who: "Students",
    title: "form teams around real challenges.",
    body: "Medicine, design, engineering, data. Students pick a problem, form a team, define the roles they still need, and recruit the rest.",
    icon: Users,
  },
  {
    who: "Organizations",
    title: "provide funding, mentorship, or resources.",
    body: "NGOs, companies and universities pledge directly on a problem page. Support goes to a named team and a visible plan.",
    icon: HandCoins,
  },
  {
    who: "Contributors",
    title: "earn verified project experience.",
    body: "When the project ships, every contributor receives a public, verifiable credential tied to the real work and vouched for by the supporting organization.",
    icon: BadgeCheck,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Four roles, one loop."
            description="Each step creates the conditions for the next. A problem becomes a team, a team attracts support, support produces results, results become proof."
          />
        </Reveal>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal
                key={s.who}
                as="li"
                delay={i * 90}
                className="card-accent group flex flex-col bg-surface p-6 transition-colors duration-300 hover:bg-pine-50/40 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-md border border-line bg-canvas text-ink-2 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-pine-200 group-hover:bg-pine-50 group-hover:text-pine-700">
                    <Icon className="size-4" />
                  </span>
                  <span className="tabular font-mono text-xs text-ink-3 transition-colors group-hover:text-pine-700">0{i + 1}</span>
                </div>
                <h3 className="font-serif-display mt-5 text-xl leading-snug text-ink">
                  <span className="text-pine-700">{s.who}</span> {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{s.body}</p>
                {i < steps.length - 1 && (
                  <span className="mt-auto flex items-center gap-1.5 pt-6 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-4 transition-colors group-hover:text-pine-700">
                    Next
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
                {i === steps.length - 1 && (
                  <span className="mt-auto flex items-center gap-1.5 pt-6 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-4 transition-colors group-hover:text-pine-700">
                    Back to the start
                  </span>
                )}
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

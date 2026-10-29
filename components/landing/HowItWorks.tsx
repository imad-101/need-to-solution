import { BadgeCheck, Building2, GraduationCap, MessageSquareText } from "lucide-react";
import { SectionHeading, Accent } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    icon: <MessageSquareText className="size-5" />,
    title: "Community members submit problems.",
    body: "A nurse, a principal, a farmer. Anyone who sees a need describes it plainly: what is happening, who it affects, what help would change it.",
    tag: "Need",
    accent: "from-emerald-400/30 to-emerald-400/0",
  },
  {
    icon: <GraduationCap className="size-5" />,
    title: "Students form teams around real challenges.",
    body: "Medicine, design, engineering, data. Students pick a problem, form a team, define the roles they still need, and recruit the rest.",
    tag: "Team",
    accent: "from-sky-400/30 to-sky-400/0",
  },
  {
    icon: <Building2 className="size-5" />,
    title: "Organizations provide funding, mentorship, or resources.",
    body: "NGOs, companies and universities pledge directly on a problem page. Support goes to a named team and a visible plan.",
    tag: "Support",
    accent: "from-amber-400/30 to-amber-400/0",
  },
  {
    icon: <BadgeCheck className="size-5" />,
    title: "Contributors earn verified project experience.",
    body: "When the project ships, every contributor receives a public, verifiable credential tied to the real work and vouched for by the supporting organization.",
    tag: "Proof",
    accent: "from-fuchsia-400/30 to-fuchsia-400/0",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                Four roles. One loop. <Accent>No searching required.</Accent>
              </>
            }
            description="Each step creates the conditions for the next. A problem becomes a team, a team attracts support, support produces results, results become proof."
          />
        </Reveal>

        <div className="relative mt-16">
          <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />
          <div className="grid gap-5 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-white/20">
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${s.accent} opacity-60 transition group-hover:opacity-100`} />
                  <div className="relative flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-ink/70 text-white shadow-lg">
                      {s.icon}
                    </span>
                    <span className="font-mono text-xs text-white/35">0{i + 1}</span>
                  </div>
                  <p className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{s.tag}</p>
                  <h3 className="relative mt-2 text-lg font-semibold leading-snug tracking-tight text-white">{s.title}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-white/58">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

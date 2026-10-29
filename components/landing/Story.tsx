"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Code2, Stethoscope, Megaphone, CheckCircle2 } from "lucide-react";
import { SectionHeading, Accent } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const chapters = [
  {
    key: "need",
    icon: <Megaphone className="size-5" />,
    who: "The community",
    title: "A village lacks health awareness.",
    body: "Amina, a volunteer at the dispensary, posts the problem: preventable illness, no reliable health information, 2,400 people affected across six villages.",
    output: "Problem published",
    color: "emerald",
  },
  {
    key: "med",
    icon: <Stethoscope className="size-5" />,
    who: "Medical students",
    title: "Medical students create an educational campaign.",
    body: "Sara and Tomás write a hygiene and nutrition curriculum, test it with mothers' groups, and rewrite what doesn't land.",
    output: "Curriculum in Swahili and Luo",
    color: "sky",
  },
  {
    key: "cs",
    icon: <Code2 className="size-5" />,
    who: "Computer science students",
    title: "Computer science students build its website.",
    body: "Dev ships a site that loads in two seconds on 2G and works offline. Priya designs leaflets the dispensary can print locally.",
    output: "Website + print materials",
    color: "violet",
  },
  {
    key: "ngo",
    icon: <Building2 className="size-5" />,
    who: "An NGO",
    title: "An NGO provides support.",
    body: "Hope Foundation funds printing and volunteer stipends and sends a field officer two days a week. When the project completes, they verify every contributor's credential.",
    output: "$4,000 + field support",
    color: "amber",
  },
];

const colors: Record<string, { ring: string; bg: string; text: string; bar: string }> = {
  emerald: { ring: "border-emerald-400/50", bg: "bg-emerald-400/10", text: "text-emerald-200", bar: "bg-emerald-400" },
  sky: { ring: "border-sky-400/50", bg: "bg-sky-400/10", text: "text-sky-200", bar: "bg-sky-400" },
  violet: { ring: "border-brand-400/60", bg: "bg-brand-500/15", text: "text-brand-100", bar: "bg-brand-400" },
  amber: { ring: "border-amber-400/50", bg: "bg-amber-400/10", text: "text-amber-200", bar: "bg-amber-400" },
};

export function Story() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % chapters.length), 4200);
    return () => window.clearInterval(t);
  }, [paused]);

  const c = chapters[active];
  const col = colors[c.color];

  return (
    <section id="example" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[600px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(217,70,239,0.12),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Example"
            title={
              <>
                One problem. <Accent>Three kinds of talent.</Accent> A result nobody could ship alone.
              </>
            }
            description="This is a real project on the platform right now. Follow how a single post turned into a campaign, a website, and funded field work."
          />
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-[400px_1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <Reveal className="space-y-2">
            {chapters.map((ch, i) => {
              const cc = colors[ch.color];
              const isActive = i === active;
              return (
                <button
                  key={ch.key}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all",
                    isActive ? cn("bg-white/[0.05]", cc.ring) : "border-white/8 hover:border-white/20 hover:bg-white/[0.03]",
                  )}
                >
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl border", isActive ? cn(cc.bg, cc.text, cc.ring) : "border-white/10 bg-white/5 text-white/60")}>
                    {ch.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[11px] font-semibold uppercase tracking-[0.16em]", isActive ? cc.text : "text-white/40")}>{ch.who}</span>
                    <span className={cn("mt-0.5 block text-sm font-medium leading-snug", isActive ? "text-white" : "text-white/65")}>{ch.title}</span>
                  </span>
                  {isActive && !paused && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
                      <span className={cn("block h-full animate-[progress_4.2s_linear]", cc.bar)} style={{ animationName: "story-progress" }} />
                    </span>
                  )}
                </button>
              );
            })}
          </Reveal>

          <Reveal delay={100}>
            <div className="glass-strong relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[2rem] p-8 sm:p-10">
              <div className={cn("pointer-events-none absolute -right-24 -top-24 size-80 rounded-full blur-3xl transition-colors duration-700", col.bg)} />
              <div className="pointer-events-none absolute inset-0 bg-dots opacity-20 mask-fade-b" />

              <div key={c.key} className="relative flex flex-1 flex-col animate-fade-up">
                <span className={cn("inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", col.ring, col.bg, col.text)}>
                  {c.icon} Chapter {active + 1} · {c.who}
                </span>
                <h3 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">{c.title}</h3>
                <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">{c.body}</p>

                <div className="mt-auto pt-10">
                  <div className="flex flex-wrap items-center gap-3">
                    {chapters.slice(0, active + 1).map((ch) => (
                      <span key={ch.key} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/80">
                        <CheckCircle2 className={cn("size-3.5", colors[ch.color].text)} /> {ch.output}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button href="/problems/p-health-awareness">
                      See the live project <ArrowRight className="size-4" />
                    </Button>
                    <Link href="/problems" className="text-sm text-white/55 hover:text-white">
                      Or find one that needs you →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <style>{`@keyframes story-progress { from { width: 0% } to { width: 100% } }`}</style>
    </section>
  );
}

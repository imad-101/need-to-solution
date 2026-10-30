"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Pause, Play } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { AvatarStack } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import { cn } from "@/lib/utils";

const AUTO_MS = 7000;

const chapters = [
  {
    key: "need",
    who: "The community",
    title: "A village lacks health awareness.",
    body: "Amina, a volunteer at the dispensary, posts the problem: preventable illness, no reliable health information, 2,400 people affected across six villages.",
    output: "Problem published",
    people: ["u-amina"],
  },
  {
    key: "med",
    who: "Medical students",
    title: "Medical students create an educational campaign.",
    body: "Sara and Tomás write a hygiene and nutrition curriculum, test it with mothers' groups, and rewrite what doesn't land.",
    output: "Curriculum in Swahili and Luo",
    people: ["u-sara", "u-tomas"],
  },
  {
    key: "cs",
    who: "Computer science students",
    title: "Computer science students build its website.",
    body: "Dev ships a site that loads in two seconds on 2G and works offline. Priya designs leaflets the dispensary can print locally.",
    output: "Website and print materials",
    people: ["u-dev", "u-priya"],
  },
  {
    key: "ngo",
    who: "An NGO",
    title: "An NGO provides support.",
    body: "Hope Foundation funds printing and volunteer stipends and sends a field officer two days a week. When the project completes, they verify every contributor's credential.",
    output: "$4,000 and field support",
    people: ["u-hope"],
  },
];

export function Story() {
  const { userById } = usePlatform();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Only advance while the section is on screen, not hovered, and the reader hasn't taken over.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = playing && inView && !hovered;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % chapters.length), AUTO_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const pick = (i: number) => {
    setActive(i);
    setPlaying(false);
  };

  const c = chapters[active];
  const people = c.people.map(userById).filter((u): u is NonNullable<typeof u> => !!u);

  return (
    <section id="example" ref={sectionRef} className="border-y border-line bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Example"
            title="One problem, three kinds of talent, a result nobody could ship alone."
            description="This is a real project on the platform right now. Follow how a single post turned into a campaign, a website, and funded field work."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[380px_1fr]" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <Reveal>
            <ol className="card divide-y divide-line overflow-hidden">
              {chapters.map((ch, i) => {
                const isActive = i === active;
                return (
                  <li key={ch.key} className="relative">
                    <button
                      onClick={() => pick(i)}
                      className={cn("flex w-full items-start gap-4 px-5 py-4 text-left transition-colors duration-300", isActive ? "bg-pine-50" : "hover:bg-canvas")}
                    >
                      <span
                        className={cn(
                          "tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium transition-all duration-300",
                          isActive ? "scale-110 border-pine-700 bg-pine-700 text-white" : "border-line-strong text-ink-3",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("label block transition-colors", isActive && "text-pine-700")}>{ch.who}</span>
                        <span className={cn("mt-0.5 block text-sm leading-snug transition-colors", isActive ? "font-medium text-ink" : "text-ink-2")}>
                          {ch.title}
                        </span>
                      </span>
                    </button>
                    {isActive && playing && (
                      <span
                        key={active}
                        className="animate-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-pine-600"
                        style={{ animationDuration: `${AUTO_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                      />
                    )}
                  </li>
                );
              })}
              <li className="flex items-center justify-between bg-canvas px-5 py-2.5">
                <span className="text-[11px] text-ink-3">{playing ? "Playing through the story" : "Paused"}</span>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-medium text-ink-2 transition hover:border-ink-3 hover:text-ink"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
                  {playing ? "Pause" : "Play"}
                </button>
              </li>
            </ol>
          </Reveal>

          <Reveal delay={80}>
            <div className="card flex h-full min-h-[380px] flex-col p-7 sm:p-10">
              <div key={c.key} className="flex flex-1 flex-col">
                <span className="label animate-slide-in">
                  Chapter {active + 1} · {c.who}
                </span>
                <h3 className="font-serif-display animate-rise mt-4 text-balance text-2xl leading-snug text-ink sm:text-3xl" style={{ animationDelay: "60ms" }}>
                  {c.title}
                </h3>
                <p className="animate-rise mt-4 max-w-xl text-pretty text-base leading-relaxed text-ink-2" style={{ animationDelay: "140ms" }}>
                  {c.body}
                </p>
                {people.length > 0 && (
                  <div className="animate-rise mt-5 flex items-center gap-2.5" style={{ animationDelay: "220ms" }}>
                    <AvatarStack users={people} size="sm" />
                    <span className="text-xs text-ink-3">{people.map((p) => p.name).join(" and ")}</span>
                  </div>
                )}

                <div className="mt-auto pt-8">
                  <div className="flex flex-wrap items-center gap-2">
                    {chapters.slice(0, active + 1).map((ch, i) => (
                      <span
                        key={ch.key}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
                          i === active ? "animate-pop border-pine-200 bg-pine-50 text-pine-800" : "border-line bg-canvas text-ink-2",
                        )}
                      >
                        <CheckCircle2 className="size-3.5 text-pine-600" /> {ch.output}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Button href="/problems/p-health-awareness">
                      See the live project <ArrowRight className="size-4" />
                    </Button>
                    <Link href="/problems" className="link-underline text-sm text-ink-2 hover:text-ink">
                      Or find one that needs you
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

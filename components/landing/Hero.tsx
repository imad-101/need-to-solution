"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, BadgeCheck, HandCoins, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { CountUp } from "@/components/ui/CountUp";
import { usePlatform } from "@/lib/store";
import { PLEDGE_LABEL, STATUS_LABEL } from "@/lib/types";
import { cn, formatMoney, statusDot, statusStyles } from "@/lib/utils";

const ROTATE_MS = 4200;

const headline: Array<{ text: string; accent?: boolean }> = [
  { text: "Communities post" },
  { text: "real problems.", accent: true },
  { text: "Students and organizations solve them." },
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Hero() {
  const { state, openAuth, userById, problemById } = usePlatform();

  const active = state.problems.filter((p) => p.status !== "completed");
  const recent = [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const openRoles = state.teams.reduce((n, t) => n + t.openRoles.length, 0);
  const students = state.users.filter((u) => u.role === "student");
  const orgs = state.users.filter((u) => u.role === "organization");

  const latestPledge = [...state.pledges].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const pledgeOrg = latestPledge ? userById(latestPledge.orgId) : undefined;
  const pledgeProblem = latestPledge ? problemById(latestPledge.problemId) : undefined;
  const latestCred = [...state.credentials].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))[0];
  const credHolder = latestCred ? userById(latestCred.userId) : undefined;

  const stats = [
    { label: "Active problems", value: active.length },
    { label: "Student teams", value: state.teams.length },
    { label: "Open roles", value: openRoles },
    { label: "Credentials issued", value: state.credentials.length },
  ];

  // The "happening now" list walks through recent problems on its own; hovering pauses it.
  const [highlight, setHighlight] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || recent.length < 2) return;
    const id = window.setInterval(() => setHighlight((h) => (h + 1) % recent.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, recent.length]);

  const words = headline.flatMap((seg) => seg.text.split(" ").map((w) => ({ w, accent: !!seg.accent })));

  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Background: dot grid, two slow drifting colour fields, paper grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-dots absolute inset-0" />
        <div className="animate-drift absolute -top-40 right-[-12%] size-[520px] rounded-full bg-pine-100/70 blur-3xl" />
        <div
          className="animate-drift absolute -bottom-48 left-[-10%] size-[460px] rounded-full bg-amber-50 blur-3xl"
          style={{ animationDelay: "-9s", animationDirection: "alternate-reverse" }}
        />
        <div className="grain absolute inset-0" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28">
        {/* Copy */}
        <div className="max-w-xl">
          <div
            className="enter inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/80 py-1 pl-3 pr-3.5 text-xs text-ink-2 backdrop-blur-sm"
            style={delay(0)}
          >
            <span className="live-dot" />
            <span>
              <span className="tabular font-medium text-ink">{active.length}</span> problems open ·{" "}
              <span className="tabular font-medium text-ink">{openRoles}</span> roles waiting
            </span>
          </div>

          <h1 className="font-serif-display mt-6 text-balance text-[2.6rem] leading-[1.06] text-ink sm:text-5xl lg:text-[3.7rem]">
            {words.map((t, i) => (
              <span key={i}>
                <span className={cn("enter inline-block", t.accent && "italic text-pine-700")} style={delay(90 + i * 45)}>
                  {t.w}
                </span>
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>

          <p className="enter mt-6 text-pretty text-[17px] leading-relaxed text-ink-2" style={delay(420)}>
            Students form teams around challenges that matter, organizations provide funding, mentorship or resources, and every
            contributor earns verified project experience.
          </p>

          <div className="enter mt-8 flex flex-wrap items-center gap-3" style={delay(520)}>
            <Button size="lg" href="/problems">
              Browse open problems <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => openAuth("community")}>
              Submit a problem
            </Button>
          </div>

          <div className="enter mt-9 flex items-center gap-3.5" style={delay(620)}>
            <AvatarStack users={[...students.slice(0, 3), ...orgs.slice(0, 1)]} max={4} size="sm" />
            <p className="text-sm leading-snug text-ink-3">
              <span className="font-medium text-ink-2">{students.length} students</span> and{" "}
              <span className="font-medium text-ink-2">{orgs.length} organizations</span> are already in the loop.
            </p>
          </div>
        </div>

        {/* Live panel with two floating notes */}
        <div className="enter relative self-start sm:pt-7" style={delay(300)}>
          {latestPledge && pledgeOrg && (
            <div
              className="animate-float absolute -top-5 left-2 z-10 hidden max-w-[300px] items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5 shadow-[0_14px_32px_-18px_rgba(27,27,25,0.35)] sm:flex lg:-left-5"
              style={{ "--tilt": "-1.5deg" } as CSSProperties}
            >
              <Avatar user={pledgeOrg} size="sm" />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-xs font-medium text-ink">
                  {pledgeOrg.name} pledged{" "}
                  {latestPledge.amount ? formatMoney(latestPledge.amount) : PLEDGE_LABEL[latestPledge.type].toLowerCase()}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ink-3">
                  <HandCoins className="size-3 shrink-0 text-pine-600" /> {pledgeProblem?.title ?? "a community project"}
                </p>
              </div>
            </div>
          )}

          <div
            className="card overflow-hidden shadow-[0_30px_70px_-40px_rgba(27,27,25,0.4)]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="flex items-center justify-between border-b border-line bg-canvas px-5 py-3">
              <p className="label flex items-center gap-2">
                <span className="live-dot" /> Happening now
              </p>
              <Link href="/problems" className="link-underline inline-flex items-center gap-1 text-xs font-medium text-pine-700">
                All problems <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="h-0.5 bg-line">
              <div
                key={highlight}
                className="animate-progress h-full origin-left bg-pine-600"
                style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
              />
            </div>
            <ul className="divide-y divide-line">
              {recent.map((p, i) => {
                const teams = state.teams.filter((t) => t.problemId === p.id);
                const roles = teams.reduce((n, t) => n + t.openRoles.length, 0);
                const on = i === highlight;
                return (
                  <li key={p.id} className={cn("relative transition-colors duration-500", on && "bg-pine-50/60")}>
                    <span
                      className={cn("absolute inset-y-0 left-0 w-0.5 bg-pine-600 transition-opacity duration-500", on ? "opacity-100" : "opacity-0")}
                    />
                    <Link href={`/problems/${p.id}`} className="group block px-5 py-4 transition hover:bg-canvas">
                      <div className="flex items-center gap-2">
                        <Badge className={statusStyles[p.status]} dot={statusDot[p.status]}>
                          {STATUS_LABEL[p.status]}
                        </Badge>
                        <span className="text-xs text-ink-3">{p.category}</span>
                      </div>
                      <p className="font-serif-display mt-2 flex items-start justify-between gap-3 text-[17px] leading-snug text-ink">
                        <span>{p.title}</span>
                        <ArrowUpRight className="mt-1 size-4 shrink-0 text-ink-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-3">
                        <MapPin className="size-3" /> {p.location} · {p.impact}
                        {roles > 0 && (
                          <span className="text-blue-700">
                            {" "}
                            · {roles} open role{roles > 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {latestCred && credHolder && (
            <div
              className="animate-float-slow absolute -bottom-7 right-2 z-10 hidden items-center gap-3 rounded-lg border border-pine-100 bg-surface px-3.5 py-2.5 shadow-[0_14px_32px_-18px_rgba(27,27,25,0.35)] sm:flex lg:-right-5"
              style={{ "--tilt": "1.5deg", animationDelay: "-3.5s" } as CSSProperties}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-pine-50 text-pine-700">
                <BadgeCheck className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-medium text-ink">Credential issued to {credHolder.name.split(" ")[0]}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-3">{latestCred.id}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticker of everything on the board */}
      <div className="marquee relative border-t border-line bg-surface/70 py-3 backdrop-blur-sm">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-10 pr-10">
              {state.problems.map((p) => (
                <li key={p.id} className="flex items-center gap-2 whitespace-nowrap text-xs text-ink-3">
                  <span className={cn("size-1.5 rounded-full", statusDot[p.status])} />
                  <Link
                    href={`/problems/${p.id}`}
                    tabIndex={copy === 1 ? -1 : 0}
                    className="font-medium text-ink-2 transition hover:text-pine-700"
                  >
                    {p.title}
                  </Link>
                  <span>· {p.location}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="relative border-t border-line bg-canvas">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-4 sm:px-6 md:grid-cols-4 md:divide-x">
          {stats.map((s, i) => (
            <div key={s.label} className="enter py-5 md:px-6 md:first:pl-0 md:last:pr-0" style={delay(600 + i * 90)}>
              <dt className="label">{s.label}</dt>
              <dd className="tabular mt-1 text-2xl font-medium text-ink">
                <CountUp value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

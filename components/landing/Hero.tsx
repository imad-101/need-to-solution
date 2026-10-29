"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, HandCoins, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Accent } from "@/components/ui/SectionHeading";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { usePlatform } from "@/lib/store";
import { STATUS_LABEL } from "@/lib/types";
import { statusDot, statusStyles } from "@/lib/utils";

export function Hero() {
  const { state, openAuth } = usePlatform();
  const featured = state.problems.find((p) => p.id === "p-health-awareness") ?? state.problems[0];
  const team = state.teams.find((t) => t.problemId === featured?.id);
  const members = team ? team.memberIds.map((id) => state.users.find((u) => u.id === id)).filter((u): u is NonNullable<typeof u> => !!u) : [];
  const pledge = state.pledges.find((p) => p.problemId === featured?.id && p.type === "funding");
  const org = pledge && state.users.find((u) => u.id === pledge.orgId);
  const author = featured && state.users.find((u) => u.id === featured.submittedBy);

  const students = state.users.filter((u) => u.role === "student").length;
  const orgs = state.users.filter((u) => u.role === "organization").length;

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 mask-fade-b" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.35),transparent_60%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 -z-0 size-[720px] -translate-x-1/2 rounded-full border border-white/5 animate-spin-slow [mask-image:linear-gradient(to_bottom,black,transparent_70%)]">
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-magenta-400 shadow-[0_0_18px_4px_rgba(232,121,249,0.6)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Eyebrow className="animate-fade-up">Problems in · Opportunities out</Eyebrow>
          <h1 className="mt-6 text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-white animate-fade-up [animation-delay:80ms] sm:text-6xl lg:text-[4.4rem]">
            Real problems, solved by the people <Accent>ready to grow</Accent>.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/60 animate-fade-up [animation-delay:160ms]">
            A platform where communities post real problems for students and organizations to solve. Students form teams
            around them, organizations back them, and every contributor walks away with verified project experience.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up [animation-delay:240ms]">
            <Button size="lg" href="/problems">
              Explore open problems <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => openAuth("community")}>
              Submit a problem
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white/55 animate-fade-up [animation-delay:320ms]">
            <div className="flex items-center gap-3">
              <AvatarStack users={state.users.filter((u) => u.role === "student").slice(0, 4)} size="sm" />
              <span>
                <span className="font-semibold text-white">{students} students</span> already on teams
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HandCoins className="size-4 text-emerald-300" />
              <span>
                <span className="font-semibold text-white">{orgs} organizations</span> backing projects
              </span>
            </div>
          </div>
        </div>

        {/* Live problem card */}
        {featured && (
          <div className="relative animate-fade-up [animation-delay:200ms]">
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-500/30 via-transparent to-magenta-500/20 blur-2xl" />
            <div className="relative animate-float-slow">
              <Link href={`/problems/${featured.id}`} className="glass-strong group relative block overflow-hidden rounded-[1.75rem] p-6 ring-glow transition hover:-translate-y-1 sm:p-7">
                <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-magenta-500/20 blur-3xl" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={statusStyles[featured.status]} dot={statusDot[featured.status]}>
                      {STATUS_LABEL[featured.status]}
                    </Badge>
                    <Badge>{featured.category}</Badge>
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/8 text-white/70 transition group-hover:bg-white group-hover:text-ink">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
                <h3 className="relative mt-5 text-balance text-2xl font-semibold leading-tight tracking-tight text-white">{featured.title}</h3>
                <p className="relative mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">{featured.summary}</p>

                <div className="relative mt-6 space-y-3">
                  {author && (
                    <Row icon={<Avatar user={author} size="xs" />} label="Submitted by" value={author.name} meta={featured.location} />
                  )}
                  {team && (
                    <Row
                      icon={<Users className="size-4 text-sky-300" />}
                      label="Team formed"
                      value={team.name}
                      meta={`${members.length} students`}
                      extra={<AvatarStack users={members} max={4} size="xs" />}
                    />
                  )}
                  {org && pledge && (
                    <Row icon={<HandCoins className="size-4 text-emerald-300" />} label="Backed by" value={org.name} meta={`$${pledge.amount?.toLocaleString()} + field support`} />
                  )}
                  <Row icon={<BadgeCheck className="size-4 text-brand-300" />} label="On completion" value="Verified credentials issued" meta="to every contributor" />
                </div>
              </Link>

              <div className="glass absolute -bottom-6 -left-4 hidden items-center gap-2.5 rounded-2xl px-4 py-3 shadow-brand sm:flex animate-float [animation-delay:1.2s]">
                <span className="flex size-8 items-center justify-center rounded-xl bg-brand-gradient">
                  <Sparkles className="size-4 text-white" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs text-white/50">New opportunity</p>
                  <p className="text-sm font-medium text-white">Swahili translator needed</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Row({ icon, label, value, meta, extra }: { icon: React.ReactNode; label: string; value: string; meta?: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center">{icon}</span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[11px] uppercase tracking-wider text-white/40">{label}</p>
        <p className="truncate text-sm font-medium text-white">
          {value} {meta && <span className="font-normal text-white/45">· {meta}</span>}
        </p>
      </div>
      {extra}
    </div>
  );
}

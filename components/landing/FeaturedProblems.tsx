"use client";

import { ArrowRight } from "lucide-react";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { usePlatform } from "@/lib/store";

export function FeaturedProblems() {
  const { state } = usePlatform();
  const featured = [...state.problems]
    .filter((p) => p.status !== "completed")
    .sort((a, b) => b.upvotes.length - a.upvotes.length)
    .slice(0, 6);

  const openCount = state.problems.filter((p) => p.status !== "completed").length;
  const openRoles = state.teams.reduce((n, t) => n + t.openRoles.length, 0);

  return (
    <section className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Open now"
            title="Problems waiting for the right people."
            description={`${openCount} active problems and ${openRoles} open team roles across health, education, infrastructure and more.`}
          />
          <Button href="/problems" variant="outline" className="w-fit">
            Browse all problems <ArrowRight className="size-4" />
          </Button>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 60}>
              <ProblemCard problem={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

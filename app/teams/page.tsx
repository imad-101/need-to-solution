import type { Metadata } from "next";
import { TeamsBrowser } from "@/components/problems/TeamsBrowser";
import { Eyebrow, Accent } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Teams",
  description: "Student teams forming around real community problems. Find an open role or start your own team.",
};

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <Eyebrow>Teams</Eyebrow>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Join a team that&apos;s <Accent>already moving.</Accent>
          </h1>
          <p className="mt-4 text-pretty text-base text-white/55 sm:text-lg">
            Teams list the exact roles they still need. Pick one that fits your skills, or start a team on any open problem.
          </p>
        </div>
        <Button href="/problems?status=open" size="lg" variant="outline" className="w-fit">
          <Sparkles className="size-4" /> Start a team
        </Button>
      </div>
      <div className="mt-10">
        <TeamsBrowser />
      </div>
    </div>
  );
}

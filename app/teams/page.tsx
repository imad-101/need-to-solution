import type { Metadata } from "next";
import { TeamsBrowser } from "@/components/problems/TeamsBrowser";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Teams",
  description: "Student teams forming around real community problems. Find an open role or start your own team.",
};

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <Eyebrow>Teams</Eyebrow>
          <h1 className="font-serif-display mt-3 text-balance text-4xl text-ink sm:text-5xl">Join a team that&apos;s already moving.</h1>
          <p className="mt-4 text-pretty text-base text-ink-2 sm:text-[17px]">
            Teams list the exact roles they still need. Pick one that fits your skills, or start a team on any open problem.
          </p>
        </div>
        <Button href="/problems?status=open" size="lg" variant="outline" className="w-fit">
          Start a team
        </Button>
      </div>
      <div className="mt-8">
        <TeamsBrowser />
      </div>
    </div>
  );
}

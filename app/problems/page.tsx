import type { Metadata } from "next";
import { Suspense } from "react";
import { ProblemsBrowser } from "@/components/problems/ProblemsBrowser";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import type { ProblemStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Browse problems",
  description: "Real problems posted by communities, waiting for student teams and organizational support.",
};

const statuses: ProblemStatus[] = ["open", "forming", "in-progress", "completed"];

export default function ProblemsPage({ searchParams }: PageProps<"/problems">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <Eyebrow>Problems</Eyebrow>
          <h1 className="font-serif-display mt-3 text-balance text-4xl text-ink sm:text-5xl">Every problem here is an opportunity with a name on it.</h1>
          <p className="mt-4 text-pretty text-base text-ink-2 sm:text-[17px]">
            Posted by the people who live with them. Filter by what you can do, where you want to help, and how urgent it is.
          </p>
        </div>
        <Button href="/submit" size="lg" className="w-fit">
          Submit a problem
        </Button>
      </div>

      <div className="mt-8">
        <Suspense fallback={<ProblemsBrowser />}>
          {searchParams.then((sp) => {
            const raw = typeof sp.status === "string" ? sp.status : undefined;
            const initial = raw && (statuses as string[]).includes(raw) ? (raw as ProblemStatus) : undefined;
            return <ProblemsBrowser initialStatus={initial} />;
          })}
        </Suspense>
      </div>
    </div>
  );
}

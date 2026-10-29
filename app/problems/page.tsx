import type { Metadata } from "next";
import { Suspense } from "react";
import { ProblemsBrowser } from "@/components/problems/ProblemsBrowser";
import { Eyebrow, Accent } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import type { ProblemStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Browse problems",
  description: "Real problems posted by communities, waiting for student teams and organizational support.",
};

const statuses: ProblemStatus[] = ["open", "forming", "in-progress", "completed"];

export default function ProblemsPage({ searchParams }: PageProps<"/problems">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <Eyebrow>Problems</Eyebrow>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Every problem here is <Accent>an opportunity</Accent> with a name on it.
          </h1>
          <p className="mt-4 text-pretty text-base text-white/55 sm:text-lg">
            Posted by the people who live with them. Filter by what you can do, where you want to help, and how urgent it is.
          </p>
        </div>
        <Button href="/submit" size="lg" className="w-fit">
          <Plus className="size-4" /> Submit a problem
        </Button>
      </div>

      <div className="mt-10">
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

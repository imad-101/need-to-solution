import type { Metadata } from "next";
import { Suspense } from "react";
import { ProblemDetail } from "@/components/problems/ProblemDetail";

export const metadata: Metadata = {
  title: "Problem",
};

function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="h-4 w-24 rounded bg-canvas" />
      <div className="mt-6 h-48 animate-pulse rounded-lg bg-canvas" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="h-96 animate-pulse rounded-lg bg-canvas" />
        <div className="h-64 animate-pulse rounded-lg bg-canvas" />
      </div>
    </div>
  );
}

export default function ProblemPage({ params }: PageProps<"/problems/[id]">) {
  return (
    <Suspense fallback={<Skeleton />}>
      {params.then(({ id }) => (
        <ProblemDetail id={id} />
      ))}
    </Suspense>
  );
}

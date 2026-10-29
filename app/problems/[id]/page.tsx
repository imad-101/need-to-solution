import type { Metadata } from "next";
import { Suspense } from "react";
import { ProblemDetail } from "@/components/problems/ProblemDetail";

export const metadata: Metadata = {
  title: "Problem",
};

function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32">
      <div className="h-4 w-24 rounded bg-white/5" />
      <div className="mt-6 h-72 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.03]" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="h-96 animate-pulse rounded-3xl bg-white/[0.03]" />
        <div className="h-64 animate-pulse rounded-3xl bg-white/[0.03]" />
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

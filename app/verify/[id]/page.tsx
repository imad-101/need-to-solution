import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyCredential } from "@/components/credentials/VerifyCredential";

export const metadata: Metadata = {
  title: "Verify credential",
  description: "Confirm the authenticity of a NeedToSolution verified project experience credential.",
};

export default function VerifyPage({ params }: PageProps<"/verify/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 pt-32 pb-24 sm:px-6"><div className="h-64 animate-pulse rounded-3xl bg-white/[0.03]" /></div>}>
      {params.then(({ id }) => (
        <VerifyCredential id={id} />
      ))}
    </Suspense>
  );
}

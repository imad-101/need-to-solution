import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyCredential } from "@/components/credentials/VerifyCredential";

export const metadata: Metadata = {
  title: "Verify credential",
  description: "Confirm the authenticity of a NeedToSolution verified project experience credential.",
};

export default function VerifyPage({ params }: PageProps<"/verify/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="h-48 animate-pulse rounded-lg bg-canvas" />
        </div>
      }
    >
      {params.then(({ id }) => (
        <VerifyCredential id={id} />
      ))}
    </Suspense>
  );
}

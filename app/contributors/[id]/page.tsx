import type { Metadata } from "next";
import { Suspense } from "react";
import { ContributorProfile } from "@/components/contributors/ContributorProfile";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ContributorPage({ params }: PageProps<"/contributors/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="h-48 animate-pulse rounded-lg bg-canvas" />
        </div>
      }
    >
      {params.then(({ id }) => (
        <ContributorProfile id={id} />
      ))}
    </Suspense>
  );
}

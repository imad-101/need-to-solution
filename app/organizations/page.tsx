import type { Metadata } from "next";
import { OrgHub } from "@/components/organizations/OrgHub";
import { Eyebrow } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Organizations",
  description: "Fund, mentor or resource student teams solving real community problems. See exactly where your support goes.",
};

export default function OrganizationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-2xl border-b border-line pb-8">
        <Eyebrow>For organizations</Eyebrow>
        <h1 className="font-serif-display mt-3 text-balance text-4xl text-ink sm:text-5xl">Back outcomes, not applications.</h1>
        <p className="mt-4 text-pretty text-base text-ink-2 sm:text-[17px]">
          Pledge directly on a problem page. Your support reaches a named team with a visible plan, and you verify the result when it ships.
        </p>
      </div>
      <div className="mt-10">
        <OrgHub />
      </div>
    </div>
  );
}

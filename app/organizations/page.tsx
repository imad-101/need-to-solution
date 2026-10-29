import type { Metadata } from "next";
import { OrgHub } from "@/components/organizations/OrgHub";
import { Eyebrow, Accent } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Organizations",
  description: "Fund, mentor or resource student teams solving real community problems. See exactly where your support goes.",
};

export default function OrganizationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32">
      <div className="max-w-2xl">
        <Eyebrow>For organizations</Eyebrow>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
          Back outcomes, <Accent>not applications.</Accent>
        </h1>
        <p className="mt-4 text-pretty text-base text-white/55 sm:text-lg">
          Pledge directly on a problem page. Your support reaches a named team with a visible plan, and you verify the result when it ships.
        </p>
      </div>
      <div className="mt-12">
        <OrgHub />
      </div>
    </div>
  );
}

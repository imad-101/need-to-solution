import type { Metadata } from "next";
import { SubmitProblemForm } from "@/components/forms/SubmitProblemForm";
import { Eyebrow, Accent } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Submit a problem",
  description: "Describe a problem your community faces and let students and organizations form around it.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32">
      <div className="max-w-2xl">
        <Eyebrow>Submit a problem</Eyebrow>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
          Describe the need. <Accent>We&apos;ll generate the opportunity.</Accent>
        </h1>
        <p className="mt-4 text-pretty text-base text-white/55 sm:text-lg">
          You don&apos;t need a plan or a budget. You need to explain what&apos;s happening clearly enough that a team can start.
        </p>
      </div>
      <div className="mt-10">
        <SubmitProblemForm />
      </div>
    </div>
  );
}

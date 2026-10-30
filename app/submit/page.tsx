import type { Metadata } from "next";
import { SubmitProblemForm } from "@/components/forms/SubmitProblemForm";
import { Eyebrow } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Submit a problem",
  description: "Describe a problem your community faces and let students and organizations form around it.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-2xl border-b border-line pb-8">
        <Eyebrow>Submit a problem</Eyebrow>
        <h1 className="font-serif-display mt-3 text-balance text-4xl text-ink sm:text-5xl">Describe the need. The platform generates the opportunity.</h1>
        <p className="mt-4 text-pretty text-base text-ink-2 sm:text-[17px]">
          You don&apos;t need a plan or a budget. You need to explain what&apos;s happening clearly enough that a team can start.
        </p>
      </div>
      <div className="mt-8">
        <SubmitProblemForm />
      </div>
    </div>
  );
}

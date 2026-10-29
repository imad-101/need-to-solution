import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("label block", className)}>{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="font-serif-display text-balance text-3xl leading-[1.12] text-ink sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-pretty text-base leading-relaxed text-ink-2 sm:text-[17px]">{description}</p>}
    </div>
  );
}

export function Accent({ children }: { children: ReactNode }) {
  return <em className="italic text-pine-700">{children}</em>;
}

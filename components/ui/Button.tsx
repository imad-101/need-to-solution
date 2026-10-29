import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-pine-700 text-white hover:bg-pine-800 border border-pine-700 hover:border-pine-800",
  secondary: "bg-ink text-paper hover:bg-ink-2 border border-ink hover:border-ink-2",
  outline: "bg-surface text-ink border border-line-strong hover:border-ink-3 hover:bg-canvas",
  ghost: "text-ink-2 hover:text-ink hover:bg-canvas border border-transparent",
  danger: "text-red-600 border border-red-600/30 hover:bg-red-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-lg",
};

const base =
  "inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", href, className, children, ...rest }: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

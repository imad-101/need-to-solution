import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-brand hover:brightness-110 hover:-translate-y-px active:translate-y-0 border border-white/10",
  secondary:
    "bg-white text-ink hover:bg-brand-50 border border-white/80 shadow-[0_8px_30px_-12px_rgba(255,255,255,0.45)]",
  ghost: "text-white/80 hover:text-white hover:bg-white/5 border border-transparent",
  outline: "text-white border border-white/15 hover:border-brand-400/60 hover:bg-white/5",
  danger: "text-rose-200 border border-rose-400/30 hover:bg-rose-400/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-13 px-7 text-base gap-2.5 rounded-2xl",
};

const base =
  "inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none";

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

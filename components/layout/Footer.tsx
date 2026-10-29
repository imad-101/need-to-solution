import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/problems", label: "Browse problems" },
      { href: "/teams", label: "Find a team" },
      { href: "/organizations", label: "Support a project" },
      { href: "/submit", label: "Submit a problem" },
    ],
  },
  {
    title: "For",
    links: [
      { href: "/how-it-works#community", label: "Communities" },
      { href: "/how-it-works#students", label: "Students" },
      { href: "/how-it-works#organizations", label: "Organizations" },
      { href: "/how-it-works#credentials", label: "Verified experience" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/#example", label: "Example project" },
      { href: "/#distinctive", label: "Why it's different" },
      { href: "/dashboard", label: "Your dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/8">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
              A platform where communities post real problems for students and organizations to solve. Opportunities
              are generated from needs, not searched for.
            </p>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-white/65 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/8 pt-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>© 2026 NeedToSolution. Built for people who would rather solve than scroll.</p>
          <p className="font-mono">Problems in → opportunities out</p>
        </div>
      </div>
    </footer>
  );
}

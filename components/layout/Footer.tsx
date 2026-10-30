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
    <footer className="mt-24 border-t border-line bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-3">
              A platform where communities post real problems for students and organizations to solve. Opportunities are
              generated from needs, not searched for.
            </p>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="label">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="link-underline text-sm text-ink-2 transition hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-ink-3 sm:flex-row sm:items-center">
          <p>© 2026 NeedToSolution. A community project platform.</p>
          <p className="flex items-center gap-2">
            <span className="live-dot" /> Problems in, opportunities out.
          </p>
        </div>
      </div>
    </footer>
  );
}

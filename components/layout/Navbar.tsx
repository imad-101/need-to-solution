"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Plus, RefreshCcw, UserRound, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/types";

const links = [
  { href: "/problems", label: "Problems" },
  { href: "/teams", label: "Teams" },
  { href: "/organizations", label: "Organizations" },
  { href: "/how-it-works", label: "How it works" },
];

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, openAuth, signOut, resetDemo, hydrated } = usePlatform();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userOpen) return;
    const onDown = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [userOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl px-3 py-2 transition-all duration-300 sm:px-4",
            scrolled || menuOpen ? "glass-strong shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]" : "border border-transparent",
          )}
        >
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                      active ? "text-white" : "text-white/60 hover:text-white",
                    )}
                  >
                    {l.label}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-magenta-400 to-transparent" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Button href="/submit" size="sm" variant="outline" className="hidden sm:inline-flex">
              <Plus className="size-4" />
              Submit a problem
            </Button>

            {hydrated && currentUser ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2 transition hover:border-white/20"
                >
                  <Avatar user={currentUser} size="sm" />
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-white md:block">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className={cn("size-3.5 text-white/50 transition", userOpen && "rotate-180")} />
                </button>
                {userOpen && (
                  <div className="glass-strong absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl p-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] animate-fade-up">
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
                      <p className="text-xs text-white/50">{ROLE_LABEL[currentUser.role]}</p>
                    </div>
                    <div className="my-1 h-px bg-white/8" />
                    <MenuItem href="/dashboard" icon={<LayoutDashboard className="size-4" />}>
                      Dashboard
                    </MenuItem>
                    <MenuItem href={`/contributors/${currentUser.id}`} icon={<UserRound className="size-4" />}>
                      My profile
                    </MenuItem>
                    <MenuItem onClick={() => openAuth()} icon={<RefreshCcw className="size-4" />}>
                      Switch account
                    </MenuItem>
                    <div className="my-1 h-px bg-white/8" />
                    <MenuItem onClick={signOut} icon={<LogOut className="size-4" />}>
                      Sign out
                    </MenuItem>
                    <MenuItem onClick={resetDemo} icon={<RefreshCcw className="size-4" />} subtle>
                      Reset demo data
                    </MenuItem>
                  </div>
                )}
              </div>
            ) : (
              <Button size="sm" onClick={() => openAuth()} className="hidden sm:inline-flex">
                Sign in
              </Button>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-2 text-white/70 hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="glass-strong mt-2 rounded-2xl p-2 animate-fade-up lg:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 p-2">
              <Button href="/submit" size="sm" variant="outline" className="flex-1">
                <Plus className="size-4" />
                Submit a problem
              </Button>
              {!currentUser && (
                <Button size="sm" className="flex-1" onClick={() => openAuth()}>
                  Sign in
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({
  href,
  onClick,
  icon,
  children,
  subtle,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  const cls = cn(
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/6",
    subtle ? "text-white/45 hover:text-white/80" : "text-white/80 hover:text-white",
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {icon}
        {children}
      </Link>
    );
  return (
    <button onClick={onClick} className={cls}>
      {icon}
      {children}
    </button>
  );
}

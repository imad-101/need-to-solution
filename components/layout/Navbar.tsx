"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, RefreshCcw, UserRound, X } from "lucide-react";
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
  const { currentUser, openAuth, signOut, resetDemo, hydrated } = usePlatform();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userOpen) return;
    const onDown = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [userOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setUserOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <ul className="hidden items-center gap-7 lg:flex">
            <Suspense fallback={<NavLinks pathname={null} onNavigate={closeAll} />}>
              <ActiveNavLinks onNavigate={closeAll} />
            </Suspense>
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <Button href="/submit" size="sm" variant="outline">
              Submit a problem
            </Button>
          </span>

          {hydrated && currentUser ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition hover:bg-canvas"
              >
                <Avatar user={currentUser} size="sm" />
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-ink md:block">{currentUser.name.split(" ")[0]}</span>
                <ChevronDown className={cn("size-3.5 text-ink-3 transition", userOpen && "rotate-180")} />
              </button>
              {userOpen && (
                <div className="card absolute right-0 mt-2 w-64 overflow-hidden p-1.5 shadow-[0_16px_40px_-16px_rgba(27,27,25,0.3)] animate-fade-in">
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-ink">{currentUser.name}</p>
                    <p className="text-xs text-ink-3">{ROLE_LABEL[currentUser.role]}</p>
                  </div>
                  <div className="my-1 h-px bg-line" />
                  <MenuItem href="/dashboard" onClick={closeAll} icon={<LayoutDashboard className="size-4" />}>
                    Dashboard
                  </MenuItem>
                  <MenuItem href={`/contributors/${currentUser.id}`} onClick={closeAll} icon={<UserRound className="size-4" />}>
                    My profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      closeAll();
                      openAuth();
                    }}
                    icon={<RefreshCcw className="size-4" />}
                  >
                    Switch account
                  </MenuItem>
                  <div className="my-1 h-px bg-line" />
                  <MenuItem
                    onClick={() => {
                      closeAll();
                      signOut();
                    }}
                    icon={<LogOut className="size-4" />}
                  >
                    Sign out
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      closeAll();
                      resetDemo();
                    }}
                    icon={<RefreshCcw className="size-4" />}
                    subtle
                  >
                    Reset demo data
                  </MenuItem>
                </div>
              )}
            </div>
          ) : (
            <span className="hidden sm:block">
              <Button size="sm" onClick={() => openAuth()}>
                Sign in
              </Button>
            </span>
          )}

          <button onClick={() => setMenuOpen((v) => !v)} className="rounded-md p-2 text-ink-2 hover:bg-canvas lg:hidden" aria-label="Toggle menu">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-surface px-4 py-3 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={closeAll} className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas">
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-2 border-t border-line pt-3">
            <Link href="/submit" onClick={closeAll} className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-line-strong text-sm font-medium text-ink">
              Submit a problem
            </Link>
            {!currentUser && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  closeAll();
                  openAuth();
                }}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function ActiveNavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return <NavLinks pathname={pathname} onNavigate={onNavigate} />;
}

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate: () => void }) {
  return (
    <>
      {links.map((l) => {
        const active = !!pathname && (pathname === l.href || pathname.startsWith(l.href + "/"));
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              onClick={onNavigate}
              className={cn(
                "relative py-1 text-sm transition-colors",
                active ? "font-medium text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              {l.label}
              {active && <span className="absolute inset-x-0 -bottom-[21px] h-0.5 bg-pine-700" />}
            </Link>
          </li>
        );
      })}
    </>
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
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition hover:bg-canvas",
    subtle ? "text-ink-3 hover:text-ink-2" : "text-ink-2 hover:text-ink",
  );
  if (href)
    return (
      <Link href={href} className={cls} onClick={onClick}>
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

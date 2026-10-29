"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Inbox } from "lucide-react";
import { ProblemCard } from "./ProblemCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { usePlatform } from "@/lib/store";
import { CATEGORIES, STATUS_LABEL, type ProblemStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Sort = "trending" | "newest" | "urgent" | "open-roles";

export function ProblemsBrowser({ initialStatus }: { initialStatus?: ProblemStatus | "all" }) {
  const { state } = usePlatform();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<ProblemStatus | "all">(initialStatus ?? "all");
  const [sort, setSort] = useState<Sort>("trending");
  const [onlyOpenRoles, setOnlyOpenRoles] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const openRolesFor = (id: string) =>
      state.teams.filter((t) => t.problemId === id).reduce((n, t) => n + t.openRoles.length, 0);
    const urgencyRank = { high: 0, medium: 1, low: 2 } as const;

    return state.problems
      .filter((p) => (category === "all" ? true : p.category === category))
      .filter((p) => (status === "all" ? true : p.status === status))
      .filter((p) => (onlyOpenRoles ? openRolesFor(p.id) > 0 : true))
      .filter((p) =>
        q
          ? [p.title, p.summary, p.location, p.category, ...p.needs].join(" ").toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => {
        switch (sort) {
          case "newest":
            return b.createdAt.localeCompare(a.createdAt);
          case "urgent":
            return urgencyRank[a.urgency] - urgencyRank[b.urgency] || b.upvotes.length - a.upvotes.length;
          case "open-roles":
            return openRolesFor(b.id) - openRolesFor(a.id);
          default:
            return b.upvotes.length - a.upvotes.length || b.createdAt.localeCompare(a.createdAt);
        }
      });
  }, [state.problems, state.teams, query, category, status, sort, onlyOpenRoles]);

  const activeFilters = (category !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0) + (onlyOpenRoles ? 1 : 0);

  const reset = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setOnlyOpenRoles(false);
    setSort("trending");
  };

  return (
    <div>
      <div className="glass sticky top-[76px] z-30 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problems, skills, places…"
              className="field pl-10"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white" aria-label="Clear search">
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="field w-auto min-w-[150px]" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select className="field w-auto min-w-[140px]" value={status} onChange={(e) => setStatus(e.target.value as ProblemStatus | "all")}>
              <option value="all">Any status</option>
              {(Object.keys(STATUS_LABEL) as ProblemStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <select className="field w-auto min-w-[140px]" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
              <option value="urgent">Most urgent</option>
              <option value="open-roles">Open roles</option>
            </select>
            <button
              onClick={() => setOnlyOpenRoles((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3.5 text-sm transition",
                onlyOpenRoles
                  ? "border-sky-400/50 bg-sky-400/15 text-sky-100"
                  : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25",
              )}
            >
              <SlidersHorizontal className="size-4" />
              Open roles
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-white/50">
        <p>
          <span className="font-medium text-white">{results.length}</span> {results.length === 1 ? "problem" : "problems"}
          {activeFilters > 0 && ` · ${activeFilters} filter${activeFilters > 1 ? "s" : ""} active`}
        </p>
        {(activeFilters > 0 || query) && (
          <button onClick={reset} className="text-brand-200 hover:text-white">
            Clear all
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Inbox className="size-5" />}
          title="No problems match"
          description="Try a different search or loosen the filters. Or be the first to post this kind of problem."
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                Clear filters
              </Button>
              <Button size="sm" href="/submit">
                Submit a problem
              </Button>
            </div>
          }
        />
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}

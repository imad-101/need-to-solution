"use client";

import { useMemo, useState } from "react";
import { Search, X, Inbox } from "lucide-react";
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
    const openRolesFor = (id: string) => state.teams.filter((t) => t.problemId === id).reduce((n, t) => n + t.openRoles.length, 0);
    const urgencyRank = { high: 0, medium: 1, low: 2 } as const;

    return state.problems
      .filter((p) => (category === "all" ? true : p.category === category))
      .filter((p) => (status === "all" ? true : p.status === status))
      .filter((p) => (onlyOpenRoles ? openRolesFor(p.id) > 0 : true))
      .filter((p) => (q ? [p.title, p.summary, p.location, p.category, ...p.needs].join(" ").toLowerCase().includes(q) : true))
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

  const statusTabs: Array<{ key: ProblemStatus | "all"; label: string }> = [
    { key: "all", label: "All" },
    ...(Object.keys(STATUS_LABEL) as ProblemStatus[]).map((s) => ({ key: s, label: STATUS_LABEL[s] })),
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-line">
        {statusTabs.map((t) => {
          const count = t.key === "all" ? state.problems.length : state.problems.filter((p) => p.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition",
                status === t.key ? "border-pine-700 font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink",
              )}
            >
              {t.label}
              <span className="tabular rounded-md bg-canvas px-1.5 py-0.5 text-[11px] text-ink-3">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search problems, skills, places" className="field pl-9" />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink" aria-label="Clear search">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="field w-auto min-w-[160px]" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select className="field w-auto min-w-[150px]" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="trending">Sort: Trending</option>
            <option value="newest">Sort: Newest</option>
            <option value="urgent">Sort: Most urgent</option>
            <option value="open-roles">Sort: Open roles</option>
          </select>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-sm text-ink-2">
            <input type="checkbox" checked={onlyOpenRoles} onChange={(e) => setOnlyOpenRoles(e.target.checked)} className="accent-pine-700" />
            Open roles only
          </label>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-ink-3">
        <p>
          <span className="font-medium text-ink">{results.length}</span> {results.length === 1 ? "problem" : "problems"}
          {activeFilters > 0 && ` · ${activeFilters} filter${activeFilters > 1 ? "s" : ""} active`}
        </p>
        {(activeFilters > 0 || query) && (
          <button onClick={reset} className="text-pine-700 hover:underline underline-offset-4">
            Clear all
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          className="mt-5"
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
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}

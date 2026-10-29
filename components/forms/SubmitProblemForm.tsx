"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Lightbulb, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, TagInput } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import { CATEGORIES, type Category, type Urgency } from "@/lib/types";
import { cn } from "@/lib/utils";

const needSuggestions = [
  "Web development",
  "Graphic design",
  "Health education",
  "Data science",
  "Engineering",
  "Fundraising",
  "Translation",
  "Research",
  "Logistics",
  "Legal advice",
];

export function SubmitProblemForm() {
  const router = useRouter();
  const { currentUser, submitProblem, openAuth, hydrated } = usePlatform();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Health");
  const [location, setLocation] = useState("");
  const [impact, setImpact] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [needs, setNeeds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isCommunity = currentUser?.role === "community";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 10) return setError("Give the problem a clear title (at least 10 characters).");
    if (summary.trim().length < 30) return setError("The summary should be at least a sentence or two.");
    if (description.trim().length < 80) return setError("Describe the situation in more detail so a team can scope it.");
    if (!location.trim()) return setError("Where is this problem?");
    if (needs.length === 0) return setError("Add at least one kind of help you need.");
    const problem = submitProblem({
      title,
      summary,
      description,
      category,
      location,
      impact: impact.trim() || "Community-wide",
      urgency,
      needs,
    });
    if (problem) router.push(`/problems/${problem.id}`);
  };

  const steps = [
    { done: title.trim().length >= 10, label: "Title" },
    { done: summary.trim().length >= 30 && description.trim().length >= 80, label: "Story" },
    { done: !!location.trim(), label: "Where & who" },
    { done: needs.length > 0, label: "What you need" },
  ];
  const completion = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={handleSubmit} className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-brand-500/15 blur-3xl" />

        {hydrated && !isCommunity && (
          <div className="relative mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Problems are submitted by community members</p>
              <p className="mt-0.5 text-amber-100/70">
                {currentUser
                  ? `You are signed in as a ${currentUser.role}. Switch to a community account to publish.`
                  : "Sign in as a community member to publish this problem. You can still draft it now."}
              </p>
            </div>
            <Button size="sm" variant="secondary" type="button" onClick={() => openAuth("community")}>
              {currentUser ? "Switch" : "Sign in"}
            </Button>
          </div>
        )}

        <div className="relative space-y-6">
          <Field label="Problem title" required hint={`${title.length}/90`}>
            <input
              className="field text-base"
              maxLength={90}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our village has no health awareness programme"
            />
          </Field>

          <Field label="One-paragraph summary" required hint="What's happening and who it affects">
            <textarea
              className="field min-h-[88px] resize-y"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Preventable illnesses keep spreading because households do not know basic hygiene…"
            />
          </Field>

          <Field label="Full description" required hint="Context, constraints, what has been tried">
            <textarea
              className="field min-h-[160px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Our village of about 2,400 people sits 40 km from the nearest hospital…"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" required>
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Location" required>
              <input className="field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Town, Region, Country" />
            </Field>
            <Field label="Who is affected" hint="A number helps">
              <input className="field" value={impact} onChange={(e) => setImpact(e.target.value)} placeholder="e.g. 2,400 residents across 6 villages" />
            </Field>
            <Field label="Urgency">
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                {(["low", "medium", "high"] as Urgency[]).map((u) => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => setUrgency(u)}
                    className={cn(
                      "rounded-lg py-2 text-sm capitalize transition",
                      urgency === u
                        ? u === "high"
                          ? "bg-rose-400/20 text-rose-100"
                          : u === "medium"
                            ? "bg-amber-400/20 text-amber-100"
                            : "bg-white/10 text-white"
                        : "text-white/50 hover:text-white",
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="What kind of help do you need?" required hint="Skills, resources, expertise">
            <TagInput value={needs} onChange={setNeeds} placeholder="Add a need and press Enter" suggestions={needSuggestions} />
          </Field>

          {error && <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p>}

          <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/45">
              Publishing makes this visible to students and organizations worldwide.
            </p>
            {isCommunity ? (
              <Button type="submit" size="lg">
                Publish problem <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={() => openAuth("community")}>
                Sign in to publish <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </form>

      <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        <div className="glass rounded-3xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Readiness</p>
            <span className="font-mono text-xs text-brand-200">{completion}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-brand-gradient transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
          <ul className="mt-4 space-y-2">
            {steps.map((s) => (
              <li key={s.label} className={cn("flex items-center gap-2 text-sm", s.done ? "text-white" : "text-white/40")}>
                <CheckCircle2 className={cn("size-4", s.done ? "text-emerald-300" : "text-white/20")} />
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-3xl p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <Lightbulb className="size-4 text-amber-300" /> Problems that attract teams
          </div>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li>Say what the community has already tried.</li>
            <li>Name a local contact who can answer questions.</li>
            <li>List skills, not job titles. “Swahili translation” beats “marketing person”.</li>
            <li>Be honest about constraints: budget, connectivity, time.</li>
          </ul>
        </div>

        {currentUser && (
          <div className="glass flex items-center gap-3 rounded-3xl p-4">
            <Avatar user={currentUser} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">Posting as {currentUser.name}</p>
              <p className="truncate text-xs text-white/50">{currentUser.headline}</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, TagInput } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import { CATEGORIES, type Category, type Urgency } from "@/lib/types";
import { cn } from "@/lib/utils";

const needSuggestions = ["Web development", "Graphic design", "Health education", "Data science", "Engineering", "Fundraising", "Translation", "Research", "Logistics", "Legal advice"];

export function SubmitProblemForm() {
  const router = useRouter();
  const { currentUser, submitProblem, openAuth, busy } = usePlatform();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Health");
  const [location, setLocation] = useState("");
  const [impact, setImpact] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [needs, setNeeds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 10) return setError("Give the problem a clear title (at least 10 characters).");
    if (summary.trim().length < 30) return setError("The summary should be at least a sentence or two.");
    if (description.trim().length < 80) return setError("Describe the situation in more detail so a team can scope it.");
    if (!location.trim()) return setError("Where is this problem?");
    if (needs.length === 0) return setError("Add at least one kind of help you need.");
    const result = await submitProblem({ title, summary, description, category, location, impact: impact.trim() || "Community-wide", urgency, needs });
    if (result) router.push(`/problems/${result.id}`);
  };

  const steps = [
    { done: title.trim().length >= 10, label: "Title" },
    { done: summary.trim().length >= 30 && description.trim().length >= 80, label: "Story" },
    { done: !!location.trim(), label: "Where and who" },
    { done: needs.length > 0, label: "What you need" },
  ];
  const completion = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
        {!currentUser && (
          <div className="mb-6 flex items-start gap-3 rounded-md border border-amber-600/30 bg-amber-50 p-4 text-sm text-amber-700">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Sign in to submit</p>
              <p className="mt-0.5 text-amber-700/80">Any account can submit a problem. You can draft it now and sign in when you are ready to send it for review.</p>
            </div>
            <Button size="sm" variant="outline" type="button" onClick={() => openAuth("community")}>
              Sign in
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <Field label="Problem title" required hint={`${title.length}/90`}>
            <input className="field text-base" maxLength={90} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Our village has no health awareness programme" />
          </Field>

          <Field label="One-paragraph summary" required hint="What's happening and who it affects">
            <textarea className="field min-h-[88px] resize-y" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Preventable illnesses keep spreading because households do not know basic hygiene…" />
          </Field>

          <Field label="Full description" required hint="Context, constraints, what has been tried">
            <textarea className="field min-h-[160px] resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Our village of about 2,400 people sits 40 km from the nearest hospital…" />
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
              <div className="grid grid-cols-3 gap-1 rounded-md border border-line-strong bg-surface p-1">
                {(["low", "medium", "high"] as Urgency[]).map((u) => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => setUrgency(u)}
                    className={cn(
                      "rounded py-1.5 text-sm capitalize transition",
                      urgency === u ? (u === "high" ? "bg-red-50 text-red-600" : u === "medium" ? "bg-amber-50 text-amber-700" : "bg-canvas text-ink") : "text-ink-3 hover:text-ink",
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

          {error && <p className="rounded-md border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-3">
              {isAdmin ? "As an administrator your problem is published immediately." : "An administrator reviews every submission before it goes public."}
            </p>
            {currentUser ? (
              <Button type="submit" size="lg" disabled={busy}>
                {busy ? "Submitting…" : isAdmin ? "Publish problem" : "Submit for review"} <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={() => openAuth("community")}>
                Sign in to submit <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </form>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Readiness</p>
            <span className="tabular text-xs text-ink-3">{completion}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
            <div className="h-full rounded-full bg-pine-600 transition-all duration-300" style={{ width: `${completion}%` }} />
          </div>
          <ul className="mt-4 space-y-2">
            {steps.map((s) => (
              <li key={s.label} className={cn("flex items-center gap-2 text-sm", s.done ? "text-ink" : "text-ink-3")}>
                <CheckCircle2 className={cn("size-4", s.done ? "text-pine-600" : "text-line-strong")} />
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <ShieldCheck className="size-4 text-pine-600" /> What happens next
          </p>
          <ol className="mt-3 space-y-2 text-sm text-ink-2">
            <li className="flex gap-2">
              <span className="tabular text-ink-4">1.</span> Your problem lands in the review queue.
            </li>
            <li className="flex gap-2">
              <span className="tabular text-ink-4">2.</span> An administrator checks it is clear, real and safe to publish.
            </li>
            <li className="flex gap-2">
              <span className="tabular text-ink-4">3.</span> Once approved, students can form teams and organizations can pledge.
            </li>
            <li className="flex gap-2">
              <span className="tabular text-ink-4">4.</span> You follow its status from your dashboard.
            </li>
          </ol>
        </div>

        <div className="card p-5">
          <p className="text-sm font-medium text-ink">Problems that attract teams</p>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-ink-2">
            <li>Say what the community has already tried.</li>
            <li>Name a local contact who can answer questions.</li>
            <li>List skills, not job titles. “Swahili translation” beats “marketing person”.</li>
            <li>Be honest about constraints: budget, connectivity, time.</li>
          </ul>
        </div>

        {currentUser && (
          <div className="card flex items-center gap-3 p-4">
            <Avatar user={currentUser} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">Posting as {currentUser.name}</p>
              <p className="truncate text-xs text-ink-3">{currentUser.headline}</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

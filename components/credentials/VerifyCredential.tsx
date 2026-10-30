"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Printer, Search, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export function VerifyCredential({ id }: { id: string }) {
  const router = useRouter();
  const { state } = usePlatform();
  const [query, setQuery] = useState("");
  const wanted = decodeURIComponent(id).trim().toUpperCase();
  const credential = state.credentials.find((c) => c.id.toUpperCase() === wanted);
  const holder = credential && state.users.find((u) => u.id === credential.userId);
  const verifier = credential && credential.verifiedBy !== "platform" ? state.users.find((u) => u.id === credential.verifiedBy) : null;
  const problem = credential && state.problems.find((p) => p.id === credential.problemId);
  const team = credential && state.teams.find((t) => t.id === credential.teamId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-2xl">
        <span className="label inline-flex items-center gap-2">
          <ShieldCheck className="size-3.5" /> Certificate verification
        </span>
        <h1 className="font-serif-display mt-4 text-3xl text-ink sm:text-4xl">Verify a certificate</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Every certificate issued on NeedToSolution carries a serial number. Employers and schools can confirm who did what, on which project, and who vouched for it.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) router.push(`/verify/${encodeURIComponent(query.trim().toUpperCase())}`);
        }}
        className="mt-6 flex max-w-xl gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Serial number, e.g. NTS-7F3K-9Q2A" className="field pl-9 font-mono text-sm uppercase" />
        </div>
        <Button type="submit">Verify</Button>
      </form>

      <div className="mt-10">
        {!credential ? (
          <div className="card max-w-xl border-red-600/30 p-8">
            <ShieldX className="size-7 text-red-600" />
            <h2 className="mt-3 text-lg font-medium text-ink">No certificate found</h2>
            <p className="mt-1 text-sm text-ink-2">
              <span className="font-mono text-ink">{wanted || "(empty)"}</span> does not match any issued certificate. Check the serial number and try again.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-pine-700">
                <BadgeCheck className="size-5" />
                <p className="font-medium">Authentic certificate</p>
                <span className="text-sm text-ink-3">· issued {formatDate(credential.issuedAt)}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="size-4" /> Print certificate
              </Button>
            </div>

            {/* The printable certificate */}
            <article className="certificate card relative overflow-hidden p-8 sm:p-12">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="bg-dots absolute inset-0 opacity-60" />
                <div className="absolute -right-24 -top-24 size-72 rounded-full bg-pine-50 blur-3xl" />
              </div>
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <LogoMark />
                    <div className="leading-tight">
                      <p className="font-serif-display text-[17px] text-ink">NeedToSolution</p>
                      <p className="label">Certificate of verified project experience</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="label">Serial number</p>
                    <p className="font-mono text-lg text-ink">{credential.id}</p>
                  </div>
                </div>

                <p className="mt-10 text-sm text-ink-3">This certifies that</p>
                <p className="font-serif-display mt-2 text-3xl text-ink sm:text-4xl">{holder?.name ?? "A contributor"}</p>
                <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-2">
                  served as <span className="font-medium text-ink">{credential.role}</span>
                  {team && (
                    <>
                      {" "}
                      on the team <span className="font-medium text-ink">{team.name}</span>
                    </>
                  )}
                  {problem && (
                    <>
                      {" "}
                      for the community project <span className="font-medium text-ink">“{problem.title}”</span> in {problem.location}
                    </>
                  )}
                  , contributing <span className="font-medium text-ink">{credential.hours} verified hours</span> of work.
                </p>

                {credential.skills.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {credential.skills.map((s) => (
                      <span key={s} className="rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] text-ink-2">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
                  <div>
                    <p className="label">Issued</p>
                    <p className="mt-1 text-sm text-ink">{formatDate(credential.issuedAt)}</p>
                  </div>
                  <div>
                    <p className="label">Verified by</p>
                    <p className="mt-1 text-sm text-ink">
                      {verifier ? verifier.name : "NeedToSolution platform"}
                      {verifier?.orgType && <span className="text-ink-3"> ({verifier.orgType})</span>}
                    </p>
                  </div>
                  <div>
                    <p className="label">Verify online</p>
                    <p className="mt-1 font-mono text-xs text-ink-2">
                      /verify/<span className="whitespace-nowrap">{credential.id}</span>
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div className="card p-6">
              <p className="label">Record details</p>
              <dl className="mt-4 divide-y divide-line text-sm">
                <Row label="Issued to">
                  {holder && (
                    <Link href={`/contributors/${holder.id}`} className="inline-flex items-center gap-2 text-ink hover:underline underline-offset-4">
                      <Avatar user={holder} size="xs" /> {holder.name}
                    </Link>
                  )}
                </Row>
                <Row label="Role">{credential.role}</Row>
                <Row label="Project">
                  {problem && (
                    <Link href={`/problems/${problem.id}`} className="text-ink hover:underline underline-offset-4">
                      {problem.title}
                    </Link>
                  )}
                </Row>
                <Row label="Team">{team?.name}</Row>
                <Row label="Location">{problem?.location}</Row>
                <Row label="Project completed">{problem?.completedAt ? formatDate(problem.completedAt) : "—"}</Row>
                <Row label="Verified hours">{credential.hours}</Row>
                <Row label="Verified by">
                  {verifier ? (
                    <Link href={`/contributors/${verifier.id}`} className="inline-flex items-center gap-2 text-ink hover:underline underline-offset-4">
                      <Avatar user={verifier} size="xs" /> {verifier.name}
                    </Link>
                  ) : (
                    "NeedToSolution platform"
                  )}
                </Row>
              </dl>
              <p className="mt-5 text-xs leading-relaxed text-ink-3">
                Certificates are issued only when a project is marked complete by its team lead, the community submitter or a supporting organization, and are tied to a public project record with dated updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-ink-3">{label}</dt>
      <dd className="text-right text-ink">{children ?? "—"}</dd>
    </div>
  );
}

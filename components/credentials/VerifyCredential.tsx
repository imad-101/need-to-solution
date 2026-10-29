"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Search, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CredentialCard } from "./CredentialCard";
import { Avatar } from "@/components/ui/Avatar";
import { usePlatform } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export function VerifyCredential({ id }: { id: string }) {
  const router = useRouter();
  const { state, hydrated } = usePlatform();
  const [query, setQuery] = useState("");
  const credential = state.credentials.find((c) => c.id.toLowerCase() === decodeURIComponent(id).toLowerCase());
  const holder = credential && state.users.find((u) => u.id === credential.userId);
  const verifier = credential && credential.verifiedBy !== "platform" ? state.users.find((u) => u.id === credential.verifiedBy) : null;
  const problem = credential && state.problems.find((p) => p.id === credential.problemId);
  const team = credential && state.teams.find((t) => t.id === credential.teamId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-2xl">
        <span className="label inline-flex items-center gap-2">
          <ShieldCheck className="size-3.5" /> Credential verification
        </span>
        <h1 className="font-serif-display mt-4 text-3xl text-ink sm:text-4xl">Verify project experience</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Every credential issued on NeedToSolution has a public ID. Employers and schools can confirm who did what, on which project, and who vouched for it.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) router.push(`/verify/${encodeURIComponent(query.trim())}`);
        }}
        className="mt-6 flex max-w-xl gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Credential ID, e.g. NTS-7F3K-9Q2A" className="field pl-9 font-mono text-sm uppercase" />
        </div>
        <Button type="submit">Verify</Button>
      </form>

      {hydrated && (
        <div className="mt-10">
          {!credential ? (
            <div className="card max-w-xl border-red-600/30 p-8">
              <ShieldX className="size-7 text-red-600" />
              <h2 className="mt-3 text-lg font-medium text-ink">No credential found</h2>
              <p className="mt-1 text-sm text-ink-2">
                <span className="font-mono text-ink">{decodeURIComponent(id)}</span> does not match any issued credential. Check the ID and try again.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <CredentialCard credential={credential} showUser />
              <div className="card p-6">
                <div className="flex items-center gap-2 text-pine-700">
                  <BadgeCheck className="size-5" />
                  <p className="font-medium">Authentic credential</p>
                </div>
                <dl className="mt-5 divide-y divide-line text-sm">
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
                  <Row label="Verified hours">{credential.hours}</Row>
                  <Row label="Issued">{formatDate(credential.issuedAt)}</Row>
                  <Row label="Verified by">
                    {verifier ? (
                      <Link href={`/contributors/${verifier.id}`} className="inline-flex items-center gap-2 text-ink hover:underline underline-offset-4">
                        <Avatar user={verifier} size="xs" /> {verifier.name}
                        {verifier.orgType && <span className="text-ink-3">({verifier.orgType})</span>}
                      </Link>
                    ) : (
                      "NeedToSolution platform"
                    )}
                  </Row>
                </dl>
                <p className="mt-5 text-xs leading-relaxed text-ink-3">
                  Credentials are issued only when a project is marked complete by its team lead, the community submitter or a supporting organization, and are tied to a public project record with dated updates.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
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

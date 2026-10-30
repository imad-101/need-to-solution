import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-4 py-24 sm:px-6">
      <p className="enter label">404</p>
      <h1 className="enter font-serif-display mt-3 text-3xl text-ink sm:text-4xl" style={delay(80)}>
        This page isn&apos;t a problem we can solve.
      </h1>
      <p className="enter mt-3 text-ink-2" style={delay(160)}>
        The link may be broken or the page moved. Plenty of real problems are waiting though.
      </p>
      <div className="enter mt-7 flex gap-3" style={delay(240)}>
        <Button href="/problems">Browse problems</Button>
        <Button href="/" variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}

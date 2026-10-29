import { Button } from "@/components/ui/Button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pt-32 pb-24 text-center sm:px-6">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-200">
        <Compass className="size-6" />
      </span>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-white/40">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">This page isn&apos;t a problem we can solve.</h1>
      <p className="mt-3 text-white/55">The link may be broken or the page moved. Plenty of real problems are waiting though.</p>
      <div className="mt-7 flex gap-3">
        <Button href="/problems">Browse problems</Button>
        <Button href="/" variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}

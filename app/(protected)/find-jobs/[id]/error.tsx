"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function JobDetailsError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[JobDetailsError] Job details render failed", error);
  }, [error]);

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1024px] place-items-center px-5 py-12 sm:px-8">
      <section className="w-full rounded-xl border border-error bg-surface px-6 py-16 text-center shadow-sm sm:px-10">
        <h1 className="text-2xl font-bold text-text-primary">We could not load this job</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">Try loading it again. If the problem continues, return to your saved jobs.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Try Again</button>
          <Link href="/find-jobs" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Back to Jobs</Link>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProtectedError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[ProtectedError]", error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col items-start gap-4 px-5 py-16 sm:px-8">
      <h1 className="text-2xl font-semibold text-text-primary">
        Something went wrong
      </h1>
      <p className="max-w-xl text-sm text-text-secondary">
        We could not load this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Try again
      </button>
    </main>
  );
}

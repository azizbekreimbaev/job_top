import Link from "next/link";

export default function JobNotFound() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1024px] place-items-center px-5 py-12 sm:px-8">
      <section className="w-full rounded-xl border border-border bg-surface px-6 py-16 text-center shadow-sm sm:px-10">
        <h1 className="text-2xl font-bold text-text-primary">Job not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">This job may have been removed, or it is not available in your saved jobs.</p>
        <Link href="/find-jobs" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Back to Jobs</Link>
      </section>
    </main>
  );
}

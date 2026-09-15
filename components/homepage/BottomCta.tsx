import Link from "next/link";

export function BottomCta() {
  return (
    <section className="px-4 sm:px-8">
      <div className="marketing-glow mx-auto max-w-[1280px] border border-border px-6 py-16 text-center sm:px-10 sm:py-20">
        <h2 className="mx-auto max-w-4xl text-3xl leading-[1.08] font-semibold tracking-[-0.04em] text-text-slate sm:text-5xl lg:text-6xl">
          Your next job search can feel a<br className="hidden sm:block" /> lot less overwhelming
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 font-normal text-text-secondary sm:text-lg">
          Set up your profile, upload your resume, and start finding matches in minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-md bg-overlay px-5 py-3 text-base font-medium text-accent-foreground transition-colors hover:bg-text-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Get Started <span aria-hidden="true" className="text-text-muted">▶</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex min-w-52 items-center justify-center rounded-md border border-border-muted bg-surface/70 px-5 py-3 text-base font-medium text-text-slate transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
      <div className="marketing-grid mx-auto h-20 max-w-[1280px] border-x border-border" aria-hidden="true" />
    </section>
  );
}

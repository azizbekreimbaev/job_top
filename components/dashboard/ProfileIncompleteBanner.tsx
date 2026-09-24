import Link from "next/link";

export function ProfileIncompleteBanner() {
  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-warning/30 bg-surface px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span aria-hidden="true" className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent-muted text-accent">
          <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></svg>
        </span>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Complete your profile</h2>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Add your experience and preferences to unlock better job matches and company research.</p>
        </div>
      </div>
      <Link href="/profile" className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        Complete Profile
      </Link>
    </aside>
  );
}

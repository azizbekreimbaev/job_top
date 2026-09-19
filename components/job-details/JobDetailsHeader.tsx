import Link from "next/link";

import type { JobDetails } from "@/types/jobs";

type Props = {
  job: JobDetails;
};

export function JobDetailsHeader({ job }: Props) {
  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-5">
        <span className="grid size-16 shrink-0 place-items-center rounded-xl border border-border bg-surface-secondary text-text-muted">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 20V7.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V20" />
            <path d="M14 10.5h3a1 1 0 0 1 1 1V20M3 20h17" />
            <path d="M8 10h3M8 13.5h3M8 17h3M15.5 14h.5M15.5 17h.5" />
          </svg>
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-[-0.025em] text-text-primary sm:text-[28px]">
            {job.title}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-text-secondary">
            <span>{job.company}</span>
            <span aria-hidden="true">•</span>
            <span className="rounded-full bg-success-lightest px-3 py-1 text-sm font-medium text-success-dark">
              {job.matchScore}% Match Score
            </span>
          </div>
        </div>
      </div>
      <Link
        href={job.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 5h5v5M19 5l-8 8" />
          <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
        View Job Post
        <span className="sr-only"> (opens in a new tab)</span>
      </Link>
    </section>
  );
}

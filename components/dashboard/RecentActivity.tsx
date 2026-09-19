import Link from "next/link";

import type { DashboardActivityItem } from "@/lib/dashboard";

type Props = {
  items: DashboardActivityItem[];
};

export function RecentActivity({ items }: Props) {
  return (
    <section
      aria-label="Recent activity"
      className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-text-primary">
          Recent activity
        </h2>
        <Link
          href="/find-jobs"
          className="text-sm font-medium text-accent transition-colors hover:text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          View all jobs
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-text-secondary">
          No jobs yet. Start a search to discover roles matched to your profile.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {item.title}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {item.company} · {item.dateFound}
                </p>
              </div>
              {item.matchScore === null ? null : (
                <span className="shrink-0 text-sm font-semibold text-text-dark">
                  {item.matchScore}%
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

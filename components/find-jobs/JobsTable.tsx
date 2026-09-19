import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import { MatchScore } from "@/components/find-jobs/MatchScore";
import type { JobListItem } from "@/types/jobs";
import type { JobsQuery } from "@/types/jobs";

type Props = {
  jobs: JobListItem[];
  totalResults: number;
  filters: JobsQuery;
};

export function JobsTable({ jobs, totalResults, filters }: Props) {
  const hasActiveFilters = Boolean(
    filters.search || filters.match !== "all",
  );
  return (
    <section aria-label="Job search results" className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="bg-surface-secondary">
            <tr className="border-b border-border">
              <th className="w-[22%] px-6 py-5 text-xs font-semibold uppercase tracking-wide text-text-secondary">Company</th>
              <th className="w-[30%] px-6 py-5 text-xs font-semibold uppercase tracking-wide text-text-secondary">Role</th>
              <th className="w-[18%] px-6 py-5 text-xs font-semibold uppercase tracking-wide text-text-secondary">Match Score</th>
              <th className="w-[18%] px-6 py-5 text-xs font-semibold uppercase tracking-wide text-text-secondary">Salary Est.</th>
              <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wide text-text-secondary">Date Found</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? jobs.map((job) => (
              <tr key={job.id} className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-secondary">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-surface-tertiary text-text-secondary">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 20V7.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V20" /><path d="M14 10.5h3a1 1 0 0 1 1 1V20M3 20h17" /><path d="M8 10h3M8 13.5h3M8 17h3M15.5 14h.5M15.5 17h.5" /></svg>
                    </span>
                    <span className="text-sm font-semibold text-text-primary">{job.company}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-text-dark">{job.role}</td>
                <td className="px-6 py-4"><MatchScore score={job.matchScore} /></td>
                <td className="px-6 py-4 text-sm text-text-dark">{job.salary ?? "Not listed"}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">{job.dateFound}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm text-text-muted">
                  {hasActiveFilters
                    ? "No saved jobs match these filters. Try a broader search or another match range."
                    : "No saved jobs yet. Search above to find your first matches."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <JobsPagination
        shownResults={jobs.length}
        totalResults={totalResults}
        filters={filters}
      />
    </section>
  );
}

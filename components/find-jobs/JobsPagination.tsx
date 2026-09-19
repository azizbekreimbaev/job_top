import Link from "next/link";

import {
  createJobsUrl,
  getPaginationItems,
  JOBS_PAGE_SIZE,
} from "@/lib/job-filters";
import type { JobsQuery } from "@/types/jobs";

type Props = {
  shownResults: number;
  totalResults: number;
  filters: JobsQuery;
};

export function JobsPagination({ shownResults, totalResults, filters }: Props) {
  const firstResult = shownResults > 0 ? (filters.page - 1) * JOBS_PAGE_SIZE + 1 : 0;
  const lastResult = shownResults > 0 ? firstResult + shownResults - 1 : 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / JOBS_PAGE_SIZE));
  const pages = getPaginationItems(filters.page, totalPages);
  const linkClassName = "grid h-10 place-items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:border-accent-light hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const disabledClassName = "grid h-10 cursor-not-allowed place-items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-text-muted shadow-sm opacity-60";

  return (
    <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-text-secondary">
        Showing <strong className="font-medium text-text-dark">{firstResult}</strong> to <strong className="font-medium text-text-dark">{lastResult}</strong> of <strong className="font-semibold text-text-primary">{totalResults}</strong> results
      </p>
      <nav aria-label="Jobs pagination" className="flex items-center gap-2">
        {filters.page > 1 ? <Link href={createJobsUrl({ ...filters, page: filters.page - 1 })} scroll={false} className={linkClassName}>Previous</Link> : <span aria-disabled="true" className={disabledClassName}>Previous</span>}
        {pages.map((item, index) => item === "ellipsis" ? <span key={`ellipsis-${index}`} className="px-1 text-text-muted" aria-hidden="true">...</span> : item === filters.page ? <span key={item} aria-current="page" className="grid size-10 place-items-center rounded-md border border-accent-light bg-accent-muted text-sm font-medium text-accent shadow-sm">{item}</span> : <Link key={item} href={createJobsUrl({ ...filters, page: item })} scroll={false} className={`${linkClassName} size-10 px-0`}>{item}</Link>)}
        {filters.page < totalPages ? <Link href={createJobsUrl({ ...filters, page: filters.page + 1 })} scroll={false} className={linkClassName}>Next</Link> : <span aria-disabled="true" className={disabledClassName}>Next</span>}
      </nav>
    </div>
  );
}

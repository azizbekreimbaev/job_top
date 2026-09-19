import { redirect } from "next/navigation";

import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  applyMatchFilter,
  createJobsUrl,
  createJobTextFilter,
  JOBS_PAGE_SIZE,
  parseJobsQuery,
} from "@/lib/job-filters";
import { normalizeJobListItems } from "@/lib/job-discovery";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FindJobsPage({ searchParams }: Props) {
  const filters = parseJobsQuery(await searchParams);
  const insforge = await createInsforgeServer();
  const { data: authData } = await insforge.auth.getCurrentUser();
  const userId = authData?.user?.id;
  const from = (filters.page - 1) * JOBS_PAGE_SIZE;
  const to = from + JOBS_PAGE_SIZE - 1;
  let result: { data: unknown; error: unknown; count: number | null } = {
    data: null,
    error: null,
    count: 0,
  };

  if (userId) {
    let query = insforge.database
      .from("jobs")
      .select("id, company, title, match_score, salary, found_at", {
        count: "exact",
      })
      .eq("user_id", userId);

    query = applyMatchFilter(query, filters.match);
    if (filters.search) query = query.or(createJobTextFilter(filters.search));

    if (filters.sort === "newest") {
      query = query.order("found_at", { ascending: false });
    } else if (filters.sort === "oldest") {
      query = query.order("found_at", { ascending: true });
    } else {
      query = query
        .order("match_score", { ascending: false })
        .order("found_at", { ascending: false });
    }
    result = await query.order("id", { ascending: false }).range(from, to);
  }

  if (result.error) {
    console.error("[FindJobsPage] Jobs lookup failed", result.error);
  }
  const jobs = normalizeJobListItems(result.data);
  const totalResults = result.count ?? jobs.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / JOBS_PAGE_SIZE));
  if (!result.error && filters.page > totalPages) {
    redirect(createJobsUrl({ ...filters, page: totalPages }));
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] space-y-6 px-5 py-8 sm:px-8 sm:py-10">
      <SearchControls />
      <JobFilters key={createJobsUrl(filters)} filters={filters} />
      {result.error ? (
        <p role="alert" className="rounded-md border border-error bg-surface px-4 py-3 text-sm text-error">
          We could not load your saved jobs. Refresh the page to try again.
        </p>
      ) : null}
      <JobsTable
        jobs={jobs}
        totalResults={totalResults}
        filters={filters}
      />
    </main>
  );
}

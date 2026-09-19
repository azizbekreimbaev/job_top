import { MATCH_THRESHOLD } from "./utils.ts";
import type { JobMatchFilter, JobsQuery, JobSort } from "../types/jobs.ts";

export const JOBS_PAGE_SIZE = 10;
export const MAX_JOB_FILTER_LENGTH = 100;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function isJobMatchFilter(value: string): value is JobMatchFilter {
  return value === "all" || value === "high" || value === "low";
}

function isJobSort(value: string): value is JobSort {
  return value === "score" || value === "newest" || value === "oldest";
}

export function sanitizeJobFilter(value: string): string {
  return value
    .slice(0, MAX_JOB_FILTER_LENGTH)
    .replace(/[(),\\"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseJobsQuery(
  params: Record<string, string | string[] | undefined>,
): JobsQuery {
  const rawMatch = firstValue(params.match);
  const rawSort = firstValue(params.sort);
  const rawPage = Number.parseInt(firstValue(params.page), 10);

  return {
    search: sanitizeJobFilter(firstValue(params.q)),
    match: isJobMatchFilter(rawMatch) ? rawMatch : "all",
    sort: isJobSort(rawSort) ? rawSort : "score",
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
  };
}

export function createJobsUrl(query: JobsQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.match !== "all") params.set("match", query.match);
  if (query.sort !== "score") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const queryString = params.toString();
  return queryString ? `/find-jobs?${queryString}` : "/find-jobs";
}

export function createJobTextFilter(search: string): string {
  const pattern = `%${search.replace(/[%_]/g, "\\$&")}%`;
  return `company.ilike.${pattern},title.ilike.${pattern}`;
}

export function applyMatchFilter<T extends {
  gte(column: string, value: number): T;
  lt(column: string, value: number): T;
}>(query: T, match: JobMatchFilter): T {
  if (match === "high") return query.gte("match_score", MATCH_THRESHOLD);
  if (match === "low") return query.lt("match_score", MATCH_THRESHOLD);
  return query;
}

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const visiblePages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  for (const page of visiblePages) {
    const previous = items.at(-1);
    if (typeof previous === "number" && page - previous > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  }
  return items;
}

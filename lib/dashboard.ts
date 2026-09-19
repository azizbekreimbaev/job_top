import { formatRelativeDate } from "./job-discovery.ts";
import { isRecord } from "./profile.ts";

export type DashboardStats = {
  totalJobs: number;
  averageMatchScore: number | null;
  companiesResearched: number;
  jobsThisWeek: number;
};

export type DashboardActivityItem = {
  id: string;
  title: string;
  company: string;
  matchScore: number | null;
  dateFound: string;
};

export type DashboardJob = {
  id: string;
  title: string;
  company: string;
  matchScore: number | null;
  foundAt: string | null;
  hasCompanyResearch: boolean;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const DASHBOARD_ACTIVITY_LIMIT = 5;

export function normalizeDashboardJobs(value: unknown): DashboardJob[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((candidate) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== "string" ||
      typeof candidate.title !== "string" ||
      typeof candidate.company !== "string"
    ) {
      return [];
    }

    return [
      {
        id: candidate.id,
        title: candidate.title,
        company: candidate.company,
        matchScore:
          typeof candidate.match_score === "number"
            ? candidate.match_score
            : null,
        foundAt:
          typeof candidate.found_at === "string" ? candidate.found_at : null,
        hasCompanyResearch:
          candidate.company_research !== null &&
          candidate.company_research !== undefined,
      },
    ];
  });
}

export function calculateDashboardStats(
  jobs: readonly DashboardJob[],
  now: Date = new Date(),
): DashboardStats {
  const weekAgo = now.getTime() - WEEK_MS;
  let scoreSum = 0;
  let scoreCount = 0;
  let companiesResearched = 0;
  let jobsThisWeek = 0;

  for (const job of jobs) {
    if (job.matchScore !== null) {
      scoreSum += job.matchScore;
      scoreCount += 1;
    }
    if (job.hasCompanyResearch) {
      companiesResearched += 1;
    }
    if (job.foundAt) {
      const time = new Date(job.foundAt).getTime();
      if (Number.isFinite(time) && time >= weekAgo) {
        jobsThisWeek += 1;
      }
    }
  }

  return {
    totalJobs: jobs.length,
    averageMatchScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null,
    companiesResearched,
    jobsThisWeek,
  };
}

export function toDashboardActivity(
  jobs: readonly DashboardJob[],
  now: Date = new Date(),
  limit: number = DASHBOARD_ACTIVITY_LIMIT,
): DashboardActivityItem[] {
  return jobs.slice(0, limit).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    matchScore: job.matchScore,
    dateFound: formatRelativeDate(job.foundAt, now),
  }));
}

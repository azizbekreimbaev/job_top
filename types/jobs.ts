export type AdzunaCountry = "us" | "gb" | "ca" | "au";

export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: "0" | "1" | 0 | 1;
  contract_type?: string;
  contract_time?: string;
  created: string;
  category: { tag: string; label: string };
};

export type JobMatch = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

export type JobListItem = {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  salary: string | null;
  dateFound: string;
};

export type JobMatchFilter = "all" | "high" | "low";

export type JobSort = "score" | "newest" | "oldest";

export type JobsQuery = {
  search: string;
  match: JobMatchFilter;
  sort: JobSort;
  page: number;
};

export type FindJobsSuccess = {
  success: true;
  data: {
    runId: string;
    jobsFound: number;
    strongMatches: number;
    skippedJobs: number;
    partial: boolean;
    message: string;
  };
};

export type FindJobsFailure = {
  success: false;
  error: string;
  profileRequired?: boolean;
};

export type FindJobsResponse = FindJobsSuccess | FindJobsFailure;

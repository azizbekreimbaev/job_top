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

export type JobProvider = "searchapi" | "adzuna";

export type DiscoveredJob = {
  externalId: string;
  provider: JobProvider;
  title: string;
  company: string;
  location: string | null;
  description: string;
  sourceUrl: string;
  applyUrl: string;
  salary: string | null;
  jobType: "fulltime" | "parttime" | "contract" | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
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

export type JobDetails = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  jobType: "fulltime" | "parttime" | "contract" | null;
  aboutRole: string | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  sourceUrl: string;
  applyUrl: string;
  dateFound: string;
  descriptionIsComplete: boolean;
  companyResearch: CompanyResearch | null;
};

export type CompanyResearch = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

export type CompanyResearchProvenance = "website" | "fallback";

export type CompanyResearchResponse =
  | {
      success: true;
      data: {
        dossier: CompanyResearch;
        provenance: CompanyResearchProvenance;
        message: string;
      };
    }
  | {
      success: false;
      error: string;
      profileRequired?: boolean;
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

import "server-only";

import { searchAdzunaJobs } from "@/lib/adzuna";
import {
  detectAdzunaCountry,
  formatAdzunaSalary,
  normalizeJobType,
} from "@/lib/job-discovery";
import { searchGoogleJobs, SearchApiQuotaError } from "@/lib/searchapi";
import type { AdzunaJob, DiscoveredJob, JobProvider } from "@/types/jobs";

export type ProviderSearchResult = {
  jobs: DiscoveredJob[];
  provider: JobProvider;
  fellBack: boolean;
};

function normalizeAdzunaJob(
  job: AdzunaJob,
  country: ReturnType<typeof detectAdzunaCountry>,
): DiscoveredJob {
  return {
    externalId: job.id,
    provider: "adzuna",
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name || null,
    description: job.description,
    sourceUrl: job.redirect_url,
    applyUrl: job.redirect_url,
    salary: formatAdzunaSalary(job, country),
    jobType: normalizeJobType(job),
    responsibilities: [],
    requirements: [],
    niceToHave: [],
    benefits: [],
  };
}

export async function searchJobsWithFallback(
  jobTitle: string,
  location: string,
): Promise<ProviderSearchResult> {
  try {
    return {
      jobs: await searchGoogleJobs(jobTitle, location),
      provider: "searchapi",
      fellBack: false,
    };
  } catch (error) {
    if (!(error instanceof SearchApiQuotaError)) throw error;
  }

  const country = detectAdzunaCountry(location);
  const jobs = await searchAdzunaJobs(jobTitle, location, country);
  return {
    jobs: jobs.map((job) => normalizeAdzunaJob(job, country)),
    provider: "adzuna",
    fellBack: true,
  };
}

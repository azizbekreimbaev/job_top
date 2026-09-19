import "server-only";

import {
  createAdzunaSearchUrl,
  normalizeAdzunaJobs,
} from "@/lib/job-discovery";
import type { AdzunaCountry, AdzunaJob } from "@/types/jobs";

export class AdzunaConfigurationError extends Error {}
export class AdzunaResponseError extends Error {}

export async function searchAdzunaJobs(
  jobTitle: string,
  location: string,
  country: AdzunaCountry,
): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new AdzunaConfigurationError("Adzuna credentials are not configured.");
  }

  const response = await fetch(
    createAdzunaSearchUrl(jobTitle, location, country, { appId, appKey }),
    { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20_000) },
  );
  if (!response.ok) {
    throw new AdzunaResponseError(`Adzuna returned status ${response.status}.`);
  }

  const jobs = normalizeAdzunaJobs(await response.json());
  if (!jobs) {
    throw new AdzunaResponseError("Adzuna returned an invalid response.");
  }
  return jobs;
}

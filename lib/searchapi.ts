import "server-only";

import {
  isSearchApiCredentialStatus,
  isSearchApiQuotaStatus,
  normalizeSearchApiJobs,
} from "@/lib/searchapi-normalization";
import type { DiscoveredJob } from "@/types/jobs";

const SEARCHAPI_ENDPOINT = "https://www.searchapi.io/api/v1/search";

export class SearchApiConfigurationError extends Error {}
export class SearchApiQuotaError extends Error {}
export class SearchApiResponseError extends Error {}

export async function searchGoogleJobs(
  jobTitle: string,
  location: string,
): Promise<DiscoveredJob[]> {
  const apiKey = process.env.SEARCHAPI_API_KEY?.trim();
  if (!apiKey || /^https?:\/\//i.test(apiKey)) {
    throw new SearchApiConfigurationError(
      "SearchAPI credentials are not configured.",
    );
  }

  const url = new URL(SEARCHAPI_ENDPOINT);
  url.searchParams.set("engine", "google_jobs");
  url.searchParams.set("q", jobTitle);
  if (location) url.searchParams.set("location", location);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (isSearchApiQuotaStatus(response.status)) {
    throw new SearchApiQuotaError("SearchAPI quota is exhausted.");
  }
  if (isSearchApiCredentialStatus(response.status)) {
    throw new SearchApiConfigurationError(
      "SearchAPI credentials were rejected.",
    );
  }
  if (!response.ok) {
    throw new SearchApiResponseError(
      `SearchAPI returned status ${response.status}.`,
    );
  }

  const jobs = normalizeSearchApiJobs(await response.json());
  if (!jobs) {
    throw new SearchApiResponseError("SearchAPI returned an invalid response.");
  }
  return jobs;
}

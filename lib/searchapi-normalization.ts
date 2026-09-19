import { createHash } from "node:crypto";

import type { DiscoveredJob } from "../types/jobs.ts";

const MAX_RESULTS = 10;
const MAX_SECTION_ITEMS = 30;

export function isSearchApiQuotaStatus(status: number): boolean {
  return status === 429;
}

export function isSearchApiCredentialStatus(status: number): boolean {
  return status === 401;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function httpUrl(value: unknown): string | null {
  const candidate = optionalString(value);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:"
      ? candidate
      : null;
  } catch {
    return null;
  }
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_SECTION_ITEMS).flatMap((item) => {
    const normalized = optionalString(item);
    return normalized ? [normalized] : [];
  });
}

function normalizeHighlights(value: unknown): {
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
} {
  const result = {
    responsibilities: [] as string[],
    requirements: [] as string[],
    niceToHave: [] as string[],
    benefits: [] as string[],
  };
  if (!Array.isArray(value)) return result;

  for (const section of value) {
    if (!isRecord(section)) continue;
    const title = optionalString(section.title)?.toLowerCase() ?? "";
    const items = stringList(section.items);
    if (title.includes("responsib")) result.responsibilities.push(...items);
    else if (title.includes("qualification") || title.includes("requirement")) {
      result.requirements.push(...items);
    } else if (title.includes("preferred") || title.includes("nice")) {
      result.niceToHave.push(...items);
    } else if (title.includes("benefit")) result.benefits.push(...items);
  }
  return result;
}

function normalizeSchedule(value: unknown): DiscoveredJob["jobType"] {
  const schedule = optionalString(value)?.toLowerCase() ?? "";
  if (schedule.includes("part")) return "parttime";
  if (schedule.includes("contract") || schedule.includes("temporary")) {
    return "contract";
  }
  return schedule.includes("full") ? "fulltime" : null;
}

export function createSearchApiExternalId(
  sharingLink: string,
  applyLink: string,
): string {
  const fingerprint = createHash("sha256")
    .update(`${sharingLink}\n${applyLink}`)
    .digest("hex")
    .slice(0, 32);
  return `searchapi:${fingerprint}`;
}

export function normalizeSearchApiJobs(value: unknown): DiscoveredJob[] | null {
  if (!isRecord(value) || !Array.isArray(value.jobs)) return null;

  return value.jobs.slice(0, MAX_RESULTS).flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    const title = optionalString(candidate.title);
    const company = optionalString(candidate.company_name);
    const description = optionalString(candidate.description);
    const applyLinks = Array.isArray(candidate.apply_links)
      ? candidate.apply_links
      : [];
    const firstApplyUrl = applyLinks.find(
      (item) => isRecord(item) && httpUrl(item.link),
    );
    const applyUrl =
      httpUrl(candidate.apply_link) ??
      (isRecord(firstApplyUrl) ? httpUrl(firstApplyUrl.link) : null);
    const sourceUrl = httpUrl(candidate.sharing_link) ?? applyUrl;
    if (!title || !company || !description || !applyUrl || !sourceUrl) return [];

    const detected = isRecord(candidate.detected_extensions)
      ? candidate.detected_extensions
      : {};
    const highlights = normalizeHighlights(candidate.job_highlights);
    return [{
      externalId: createSearchApiExternalId(sourceUrl, applyUrl),
      provider: "searchapi" as const,
      title,
      company,
      location: optionalString(candidate.location),
      description,
      sourceUrl,
      applyUrl,
      salary: optionalString(detected.salary),
      jobType: normalizeSchedule(detected.schedule),
      ...highlights,
    }];
  });
}

export function createNormalizedJobIdentity(
  title: string,
  company: string,
): string {
  const normalize = (value: string): string =>
    value
      .normalize("NFKC")
      .toLocaleLowerCase("en")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  return `${normalize(company)}\u0000${normalize(title)}`;
}

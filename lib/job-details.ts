import { formatRelativeDate } from "./job-discovery.ts";
import type { CompanyResearch, JobDetails } from "../types/jobs.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const items = value.flatMap((item) =>
    typeof item === "string" && item.trim() ? [item.trim()] : [],
  );
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeCompanyResearch(
  value: unknown,
  trustedSources?: readonly string[],
): CompanyResearch | null {
  if (!isRecord(value)) return null;

  const stringFields = ["companyOverview", "whyThisRole"] as const;
  const listFields = [
    "techStack",
    "culture",
    "yourEdge",
    "gapsToAddress",
    "smartQuestions",
    "interviewPrep",
  ] as const;

  const strings = Object.fromEntries(
    stringFields.map((field) => [
      field,
      typeof value[field] === "string" ? value[field].trim() : "",
    ]),
  ) as Record<(typeof stringFields)[number], string>;
  if (stringFields.some((field) => !strings[field])) return null;
  if (listFields.some((field) => !Array.isArray(value[field]))) return null;

  const lists = Object.fromEntries(
    listFields.map((field) => [field, normalizeStringList(value[field])]),
  ) as Record<(typeof listFields)[number], string[]>;
  const rawSources = trustedSources ?? value.sources;
  if (!Array.isArray(rawSources)) return null;
  const sources = normalizeStringList(rawSources).filter(isHttpUrl);

  return { ...strings, ...lists, sources };
}

function normalizeJobType(
  value: unknown,
): JobDetails["jobType"] {
  return value === "fulltime" || value === "parttime" || value === "contract"
    ? value
    : null;
}

export function formatJobType(value: JobDetails["jobType"]): string {
  if (value === "fulltime") return "Full-time";
  if (value === "parttime") return "Part-time";
  if (value === "contract") return "Contract";
  return "—";
}

export function isJobId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function normalizeJobDetails(
  value: unknown,
  now = new Date(),
): JobDetails | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.company !== "string" ||
    typeof value.match_score !== "number" ||
    !Number.isFinite(value.match_score) ||
    value.match_score < 0 ||
    value.match_score > 100 ||
    typeof value.match_reason !== "string" ||
    !isHttpUrl(value.source_url) ||
    !isHttpUrl(value.external_apply_url)
  ) {
    return null;
  }

  const title = value.title.trim();
  const company = value.company.trim();
  const matchReason = value.match_reason.trim();
  if (!title || !company || !matchReason) return null;

  return {
    id: value.id,
    title,
    company,
    location:
      typeof value.location === "string" && value.location.trim()
        ? value.location.trim()
        : null,
    salary:
      typeof value.salary === "string" && value.salary.trim()
        ? value.salary.trim()
        : null,
    jobType: normalizeJobType(value.job_type),
    aboutRole:
      typeof value.about_role === "string" && value.about_role.trim()
        ? value.about_role.trim()
        : null,
    responsibilities: normalizeStringList(value.responsibilities),
    requirements: normalizeStringList(value.requirements),
    niceToHave: normalizeStringList(value.nice_to_have),
    benefits: normalizeStringList(value.benefits),
    matchScore: Math.round(value.match_score),
    matchReason,
    matchedSkills: normalizeStringList(value.matched_skills),
    missingSkills: normalizeStringList(value.missing_skills),
    sourceUrl: value.source_url,
    applyUrl: value.external_apply_url,
    dateFound: formatRelativeDate(value.found_at, now),
    descriptionIsComplete:
      value.source === "url" ||
      (typeof value.external_job_id === "string" &&
        value.external_job_id.startsWith("searchapi:")),
    companyResearch: normalizeCompanyResearch(value.company_research),
  };
}

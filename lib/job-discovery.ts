import type {
  AdzunaCountry,
  AdzunaJob,
  JobListItem,
  JobMatch,
} from "../types/jobs.ts";
import type { ProfileFormValues } from "../types/profile.ts";

const COUNTRY_CURRENCIES: Record<AdzunaCountry, string> = {
  us: "USD",
  gb: "GBP",
  ca: "CAD",
  au: "AUD",
};

const COUNTRY_LOCALES: Record<AdzunaCountry, string> = {
  us: "en-US",
  gb: "en-GB",
  ca: "en-CA",
  au: "en-AU",
};

const MAX_MATCH_SKILLS = 12;
const MAX_MATCH_REASON_CHARACTERS = 800;

export type FindJobsInput = {
  jobTitle: string;
  location: string;
};

export type FindJobsInputResult =
  | { valid: true; input: FindJobsInput }
  | { valid: false; error: string };

export type ProcessingStatus =
  | "saved"
  | "savedStrong"
  | "duplicate"
  | "failed";

function containsCountryTerm(location: string, terms: readonly string[]): boolean {
  return terms.some((term) =>
    new RegExp(`(?:^|[,\\s])${term}(?:$|[,\\s])`, "i").test(location),
  );
}

export function detectAdzunaCountry(location: string): AdzunaCountry {
  const normalized = location.trim();

  if (
    containsCountryTerm(normalized, [
      "united kingdom",
      "great britain",
      "uk",
      "gb",
      "england",
      "scotland",
      "wales",
      "northern ireland",
    ])
  ) {
    return "gb";
  }
  if (/\bcanada\b/i.test(normalized)) {
    return "ca";
  }
  if (/\baustralia\b/i.test(normalized)) {
    return "au";
  }
  return "us";
}

export function createAdzunaSearchUrl(
  jobTitle: string,
  location: string,
  country: AdzunaCountry,
  credentials: { appId: string; appKey: string },
): string {
  const params = new URLSearchParams({
    app_id: credentials.appId,
    app_key: credentials.appKey,
    what: jobTitle,
    category: "it-jobs",
    results_per_page: "10",
    "content-type": "application/json",
  });
  if (location) params.set("where", location);
  return `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseFindJobsInput(value: unknown): FindJobsInputResult {
  if (!isRecord(value)) {
    return { valid: false, error: "Enter a job title to start searching." };
  }
  const jobTitle = typeof value.jobTitle === "string" ? value.jobTitle.trim() : "";
  const location = typeof value.location === "string" ? value.location.trim() : "";
  if (!jobTitle) return { valid: false, error: "Job title is required." };
  if (jobTitle.length > 100) {
    return { valid: false, error: "Job title must be 100 characters or fewer." };
  }
  if (location.length > 120) {
    return { valid: false, error: "Location must be 120 characters or fewer." };
  }
  return { valid: true, input: { jobTitle, location } };
}

function optionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeAdzunaJobs(value: unknown): AdzunaJob[] | null {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    return null;
  }

  return value.results.slice(0, 10).flatMap((candidate) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== "string" ||
      typeof candidate.title !== "string" ||
      !isRecord(candidate.company) ||
      typeof candidate.company.display_name !== "string" ||
      !isRecord(candidate.location) ||
      typeof candidate.location.display_name !== "string" ||
      typeof candidate.description !== "string" ||
      typeof candidate.redirect_url !== "string" ||
      typeof candidate.created !== "string" ||
      !isRecord(candidate.category) ||
      typeof candidate.category.tag !== "string" ||
      typeof candidate.category.label !== "string"
    ) {
      return [];
    }

    const job: AdzunaJob = {
      id: candidate.id.trim(),
      title: candidate.title.trim(),
      company: { display_name: candidate.company.display_name.trim() },
      location: { display_name: candidate.location.display_name.trim() },
      description: candidate.description.trim(),
      redirect_url: candidate.redirect_url,
      created: candidate.created,
      category: {
        tag: candidate.category.tag,
        label: candidate.category.label,
      },
    };
    const salaryMin = optionalFiniteNumber(candidate.salary_min);
    const salaryMax = optionalFiniteNumber(candidate.salary_max);
    if (salaryMin !== undefined) job.salary_min = salaryMin;
    if (salaryMax !== undefined) job.salary_max = salaryMax;
    if (typeof candidate.contract_type === "string") {
      job.contract_type = candidate.contract_type;
    }
    if (typeof candidate.contract_time === "string") {
      job.contract_time = candidate.contract_time;
    }

    return job.id &&
      job.title &&
      job.company.display_name &&
      isHttpUrl(job.redirect_url)
      ? [job]
      : [];
  });
}

function formatCompactCurrency(
  value: number,
  country: AdzunaCountry,
): string {
  return new Intl.NumberFormat(COUNTRY_LOCALES[country], {
    style: "currency",
    currency: COUNTRY_CURRENCIES[country],
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAdzunaSalary(
  job: AdzunaJob,
  country: AdzunaCountry,
): string | null {
  if (job.salary_min !== undefined && job.salary_max !== undefined) {
    return `${formatCompactCurrency(job.salary_min, country)} - ${formatCompactCurrency(job.salary_max, country)}`;
  }
  if (job.salary_min !== undefined) {
    return `From ${formatCompactCurrency(job.salary_min, country)}`;
  }
  if (job.salary_max !== undefined) {
    return `Up to ${formatCompactCurrency(job.salary_max, country)}`;
  }
  return null;
}

export function normalizeJobType(
  job: Pick<AdzunaJob, "contract_time" | "contract_type">,
): "fulltime" | "parttime" | "contract" {
  const contractTime = job.contract_time?.toLowerCase() ?? "";
  const contractType = job.contract_type?.toLowerCase() ?? "";
  if (contractTime.includes("part")) return "parttime";
  if (contractType.includes("contract")) return "contract";
  return "fulltime";
}

function normalizeSkillList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }
  const seen = new Set<string>();
  return value.slice(0, MAX_MATCH_SKILLS).flatMap((item) => {
    const skill = item.trim();
    const key = skill.toLowerCase();
    if (!skill || seen.has(key)) return [];
    seen.add(key);
    return [skill];
  });
}

export function normalizeJobMatch(
  value: unknown,
  profileSkills: readonly string[],
): JobMatch | null {
  if (!isRecord(value)) return null;
  const matchedSkills = normalizeSkillList(value.matchedSkills);
  const missingSkills = normalizeSkillList(value.missingSkills);
  const matchReason =
    typeof value.matchReason === "string"
      ? value.matchReason.trim().replace(/\s+/g, " ")
      : "";
  if (
    !Number.isInteger(value.matchScore) ||
    typeof value.matchScore !== "number" ||
    value.matchScore < 0 ||
    value.matchScore > 100 ||
    !matchReason ||
    matchReason.length > MAX_MATCH_REASON_CHARACTERS ||
    !matchedSkills ||
    !missingSkills
  ) {
    return null;
  }

  const profileSkillMap = new Map(
    profileSkills.map((skill) => [skill.toLowerCase(), skill]),
  );
  const verifiedMatchedSkills = matchedSkills.flatMap((skill) => {
    const profileSkill = profileSkillMap.get(skill.toLowerCase());
    return profileSkill ? [profileSkill] : [];
  });

  return {
    matchScore: value.matchScore,
    matchReason,
    matchedSkills: verifiedMatchedSkills,
    missingSkills: missingSkills.filter(
      (skill) => !profileSkillMap.has(skill.toLowerCase()),
    ),
  };
}

export function createMatchingProfileFacts(
  profile: ProfileFormValues,
): Record<string, unknown> {
  return {
    currentTitle: profile.currentTitle,
    experienceLevel: profile.experienceLevel,
    yearsExperience: profile.yearsExperience || null,
    skills: profile.skills.slice(0, 30),
    industries: profile.industries.slice(0, 12),
    workExperience: profile.workExperience.map((role) => ({
      title: role.title,
      company: role.company,
      responsibilities: role.responsibilities,
    })),
    jobTitlesSeeking: profile.jobTitlesSeeking.slice(0, 10),
    remotePreference: profile.remotePreference || null,
    preferredLocations: profile.preferredLocations.slice(0, 10),
  };
}

export async function mapWithConcurrency<T, R>(
  values: readonly T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }

  const workerCount = Math.min(Math.max(1, concurrency), values.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

export function summarizeProcessingStatuses(
  statuses: readonly ProcessingStatus[],
  previouslySaved: number,
): {
  jobsFound: number;
  strongMatches: number;
  skippedJobs: number;
  failedJobs: number;
  partial: boolean;
} {
  const jobsFound = statuses.filter(
    (status) => status === "saved" || status === "savedStrong",
  ).length;
  const strongMatches = statuses.filter(
    (status) => status === "savedStrong",
  ).length;
  const failedJobs = statuses.filter((status) => status === "failed").length;
  const racedDuplicates = statuses.filter(
    (status) => status === "duplicate",
  ).length;
  return {
    jobsFound,
    strongMatches,
    skippedJobs: previouslySaved + failedJobs + racedDuplicates,
    failedJobs,
    partial: failedJobs > 0,
  };
}

export function formatRelativeDate(
  value: unknown,
  now = new Date(),
): string {
  if (typeof value !== "string") return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const elapsedMs = Math.max(0, now.getTime() - date.getTime());
  const elapsedHours = Math.floor(elapsedMs / 3_600_000);
  if (elapsedHours < 1) return "Just now";
  if (elapsedHours < 24) {
    return `${elapsedHours} ${elapsedHours === 1 ? "hour" : "hours"} ago`;
  }
  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays === 1) return "Yesterday";
  if (elapsedDays < 30) return `${elapsedDays} days ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);
}

export function normalizeJobListItems(
  value: unknown,
  now = new Date(),
): JobListItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== "string" ||
      typeof candidate.company !== "string" ||
      typeof candidate.title !== "string" ||
      typeof candidate.match_score !== "number"
    ) {
      return [];
    }
    return [
      {
        id: candidate.id,
        company: candidate.company,
        role: candidate.title,
        matchScore: candidate.match_score,
        salary: typeof candidate.salary === "string" ? candidate.salary : null,
        dateFound: formatRelativeDate(candidate.found_at, now),
      },
    ];
  });
}

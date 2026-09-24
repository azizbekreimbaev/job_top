import { normalizeCompanyResearch } from "./job-details.ts";
import type { CompanyResearch } from "../types/jobs.ts";
import type { ProfileFormValues } from "../types/profile.ts";

export type ResearchJob = {
  id: string;
  title: string;
  company: string;
  aboutRole: string | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  matchedSkills: string[];
  missingSkills: string[];
  sourceUrl: string;
  applyUrl: string;
};

export type ResearchPageLink = {
  url: string;
  kind: "about" | "blog" | "engineering" | "product" | "team" | "careers" | "other";
};

export type ResearchEvidence = {
  url: string;
  oneLiner: string;
  productSummary: string;
  signals: string[];
};

const BLOCKED_ORIGINS = [
  "adzuna.com",
  "searchapi.io",
  "google.com",
  "linkedin.com",
  "indeed.com",
  "glassdoor.com",
  "greenhouse.io",
  "lever.co",
  "workday.com",
  "myworkdayjobs.com",
  "ashbyhq.com",
  "smartrecruiters.com",
  "jobvite.com",
];

const RECRUITMENT_PREFIXES = ["jobs.", "careers.", "apply.", "recruiting.", "job."];
const PAGE_PRIORITY: Record<ResearchPageLink["kind"], number> = {
  about: 0,
  blog: 1,
  engineering: 2,
  product: 3,
  team: 4,
  careers: 5,
  other: 6,
};

export function parseCompanyResearchInput(
  value: unknown,
): { valid: true; jobId: string } | { valid: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, error: "Choose a saved job to research." };
  }
  const jobId = "jobId" in value && typeof value.jobId === "string"
    ? value.jobId.trim()
    : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId)) {
    return { valid: false, error: "Choose a valid saved job to research." };
  }
  return { valid: true, jobId };
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return BLOCKED_ORIGINS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

function isUnsafeIp(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "::" || host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return parts[0] === 0 || parts[0] === 10 || parts[0] === 127 || parts[0] >= 224 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127);
}

export function isSafeResearchUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username && !url.password && Boolean(hostname) &&
      hostname !== "localhost" && !hostname.endsWith(".localhost") &&
      !hostname.endsWith(".local") && !hostname.endsWith(".internal") &&
      !hostname.endsWith(".test") && hostname !== "metadata.google.internal" &&
      !isUnsafeIp(hostname) && !isBlockedHostname(hostname);
  } catch {
    return false;
  }
}

export function normalizeCompanyOrigin(value: string): string | null {
  if (!isSafeResearchUrl(value)) return null;
  const url = new URL(value);
  let hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  for (const prefix of RECRUITMENT_PREFIXES) {
    if (hostname.startsWith(prefix) && hostname.slice(prefix.length).includes(".")) {
      hostname = hostname.slice(prefix.length);
      break;
    }
  }
  const origin = `https://${hostname}${url.port ? `:${url.port}` : ""}`;
  return isSafeResearchUrl(origin) ? origin : null;
}

export function createCompanyDotComCandidate(company: string): string | null {
  const slug = company
    .replace(/\b(incorporated|inc|llc|limited|ltd|corporation|corp|company|co)\b\.?/gi, " ")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();
  if (!slug) return null;
  const candidate = `https://www.${slug}.com`;
  return isSafeResearchUrl(candidate) ? candidate : null;
}

function comparableHost(hostname: string): string {
  let host = hostname.toLowerCase().replace(/^www\./, "");
  for (const prefix of RECRUITMENT_PREFIXES) {
    if (host.startsWith(prefix)) host = host.slice(prefix.length);
  }
  return host;
}

export function selectResearchPageLinks(
  links: readonly ResearchPageLink[],
  companyOrigin: string,
): ResearchPageLink[] {
  const companyHost = comparableHost(new URL(companyOrigin).hostname);
  const seen = new Set<string>();
  return links
    .flatMap((link, index) => {
      try {
        const url = new URL(link.url, companyOrigin);
        url.hash = "";
        const host = comparableHost(url.hostname);
        const sameCompany = host === companyHost;
        if (!sameCompany || !isSafeResearchUrl(url.href)) return [];
        const key = url.href.replace(/\/$/, "");
        if (seen.has(key)) return [];
        seen.add(key);
        return [{ url: url.href, kind: link.kind, index }];
      } catch {
        return [];
      }
    })
    .sort((a, b) => PAGE_PRIORITY[a.kind] - PAGE_PRIORITY[b.kind] || a.index - b.index)
    .slice(0, 3)
    .map(({ url, kind }) => ({ url, kind }));
}

function normalizePageLines(text: string): string[] {
  const ignored = /^(menu|home|sign in|log in|contact|privacy|terms|cookie|accept|reject|skip to|copyright|©)/i;
  const seen = new Set<string>();
  return text
    .slice(0, 60_000)
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 20 && line.length <= 500 && !ignored.test(line))
    .filter((line) => {
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function decodeHref(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function classifyPageLink(value: string): ResearchPageLink["kind"] {
  const normalized = value.toLowerCase();
  if (/\babout|company|mission\b/.test(normalized)) return "about";
  if (/\bblog|news|insights|stories\b/.test(normalized)) return "blog";
  if (/\bengineering|developer|technology|tech\b/.test(normalized)) return "engineering";
  if (/\bproduct|platform|solutions|services\b/.test(normalized)) return "product";
  if (/\bteam|people|leadership\b/.test(normalized)) return "team";
  if (/\bcareer|jobs|join-us|work-with-us\b/.test(normalized)) return "careers";
  return "other";
}

export function extractRenderedResearchPage(
  text: string,
  html: string,
  pageUrl: string,
  includeLinks: boolean,
): ResearchEvidence & { pageLinks: ResearchPageLink[] } {
  const lines = normalizePageLines(text);
  const oneLiner = lines.find((line) => line.length <= 240) ?? lines[0] ?? "";
  const summaryLines = lines.filter((line) => line !== oneLiner).slice(0, 3);
  const productSummary = summaryLines.join(" ").slice(0, 800);
  const signalPattern = /\b(engineer|technology|platform|product|customer|mission|team|remote|hybrid|value|culture|launch|growth|global|security|data|cloud|software|service)\b/i;
  const signals = lines.filter((line) => signalPattern.test(line)).slice(0, 12);
  const pageLinks: ResearchPageLink[] = [];

  if (includeLinks) {
    const hrefPattern = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
    for (const match of html.slice(0, 250_000).matchAll(hrefPattern)) {
      const href = decodeHref(match[1] ?? match[2] ?? match[3] ?? "").trim();
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      try {
        const url = new URL(href, pageUrl);
        pageLinks.push({ url: url.href, kind: classifyPageLink(`${url.pathname} ${url.search}`) });
      } catch {
        // Ignore malformed page-authored links.
      }
      if (pageLinks.length >= 100) break;
    }
  }

  return { url: pageUrl, oneLiner, productSummary, signals, pageLinks };
}

const TECHNOLOGIES = [
  "AWS", "Azure", "GCP", "React", "Next.js", "Vue", "Angular", "TypeScript",
  "JavaScript", "Node.js", "Python", "Java", "Go", "Ruby", "C#", ".NET",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "Docker", "Kubernetes",
  "Terraform", "Snowflake", "Datadog", "Kafka", "GitHub", "GitLab",
] as const;

function unique(values: readonly string[], limit = 8): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function detectedTechnologies(text: string): string[] {
  return TECHNOLOGIES.filter((technology) => {
    const escaped = technology.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
  });
}

function detectedCulture(text: string): string[] {
  const signals: Array<[RegExp, string]> = [
    [/\bremote|distributed\b/i, "Remote or distributed work"],
    [/\bhybrid\b/i, "Hybrid working environment"],
    [/\bcollaborat|teamwork|cross-functional\b/i, "Collaborative, cross-functional work"],
    [/\bownership|autonomy|empower\b/i, "Ownership and autonomy"],
    [/\bcustomer|client[- ]focused\b/i, "Customer-focused work"],
    [/\blearn|growth|develop|mentor\b/i, "Learning and professional growth"],
    [/\binclus|divers|belong\b/i, "Inclusion and belonging"],
    [/\bmission[- ]driven|purpose\b/i, "Mission-driven work"],
    [/\bfast[- ]paced|move fast|agile\b/i, "Fast-paced delivery"],
  ];
  return signals.flatMap(([pattern, label]) => pattern.test(text) ? [label] : []);
}

function lowerFirst(value: string): string {
  return value ? value[0].toLowerCase() + value.slice(1) : value;
}

export function createDeterministicCompanyResearch(
  job: ResearchJob,
  profile: ProfileFormValues,
  evidence: readonly ResearchEvidence[],
  trustedSources: readonly string[],
): CompanyResearch {
  const websiteText = evidence.flatMap((page) => [page.oneLiner, page.productSummary, ...page.signals]).join(" ");
  const jobText = [job.aboutRole, ...job.responsibilities, ...job.requirements, ...job.niceToHave].filter(Boolean).join(" ");
  const overviewEvidence = evidence.flatMap((page) => [page.oneLiner, page.productSummary]).filter(Boolean);
  const companyOverview = overviewEvidence.length > 0
    ? unique(overviewEvidence, 3).join(" ").slice(0, 1_200)
    : `Based on the saved posting, ${job.company} is hiring a ${job.title}. Company-site details were unavailable, so no additional company claims are included.`;
  const responsibility = job.responsibilities[0] ?? job.aboutRole ?? `contribute as a ${job.title}`;
  const requirements = unique(job.requirements, 4);
  const whyThisRole = `${job.company} is hiring a ${job.title} to ${lowerFirst(responsibility).replace(/[.!?]+$/, "")}.${requirements.length ? ` The posting emphasizes ${requirements.join(", ")}.` : ""}`;
  const techStack = unique([
    ...detectedTechnologies(websiteText),
    ...detectedTechnologies(jobText),
    ...job.matchedSkills,
    ...job.missingSkills,
  ]);
  const culture = unique(detectedCulture(`${websiteText} ${job.benefits.join(" ")}`));
  const yourEdge = job.matchedSkills.length > 0
    ? unique(job.matchedSkills.map((skill) => `Your ${skill} experience directly matches the saved role requirements.`), 6)
    : [`Your experience as ${profile.currentTitle || "a candidate in this field"}${profile.yearsExperience ? ` with ${profile.yearsExperience} years of experience` : ""} provides a relevant foundation for this role.`];
  const gapsToAddress = job.missingSkills.length > 0
    ? unique(job.missingSkills.map((skill) => `Prepare an honest explanation of your current ${skill} exposure and connect it to the closest relevant experience you do have.`), 6)
    : ["No explicit skill gaps were identified in the saved match; prepare evidence that demonstrates depth in the strongest matched skills."];
  const smartQuestions = unique([
    `What outcomes would define success for the ${job.title} in the first 90 days?`,
    techStack.length ? `How does the team use ${techStack.slice(0, 3).join(", ")} in its current architecture and roadmap?` : "What tools and technical practices are most important for this team?",
    culture.length ? `How does ${culture[0].toLowerCase()} show up in the team's day-to-day decisions?` : "How would you describe the team's working style and decision-making process?",
    `What company or product priorities are creating the need for this ${job.title} role now?`,
  ], 4);
  const interviewPrep = unique([
    ...requirements.map((requirement) => `Prepare a concrete example demonstrating ${requirement}.`),
    ...job.responsibilities.slice(0, 3).map((item) => `Prepare a STAR story showing how you have handled work related to: ${item}`),
    ...job.matchedSkills.slice(0, 2).map((skill) => `Review a measurable accomplishment where you applied ${skill}.`),
  ], 8);
  if (interviewPrep.length === 0) interviewPrep.push(`Prepare two measurable examples relevant to the ${job.title} role.`);

  const dossier = normalizeCompanyResearch({
    companyOverview,
    techStack,
    culture,
    whyThisRole,
    yourEdge,
    gapsToAddress,
    smartQuestions,
    interviewPrep,
    sources: trustedSources,
  }, trustedSources);
  if (!dossier) throw new Error("Deterministic company research normalization failed.");
  return dossier;
}

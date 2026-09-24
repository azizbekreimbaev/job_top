import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { browserbase } from "@browserbasehq/stagehand";
import type { PostHog } from "posthog-node";

import {
  createDeterministicCompanyResearch,
  createCompanyDotComCandidate,
  isSafeResearchUrl,
  normalizeCompanyOrigin,
  extractRenderedResearchPage,
  type ResearchJob,
} from "@/lib/company-research";
import {
  runCompanyResearchWithDependencies,
  type CompanyResearchRunResult,
  type ResearchBrowser,
} from "@/lib/company-research-runner";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";
import type { CompanyResearch } from "@/types/jobs";
import type { ProfileFormValues } from "@/types/profile";

function unsafeAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) {
    return unsafeAddress(normalized.slice(7));
  }
  return normalized === "::" || normalized === "::1" || normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") || normalized.startsWith("fd");
}

export async function assertPublicResearchUrl(value: string): Promise<void> {
  if (!isSafeResearchUrl(value)) throw new Error("Unsafe research URL.");
  const url = new URL(value);
  const records = await lookup(url.hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => unsafeAddress(record.address))) {
    throw new Error("Research URL resolved to a non-public address.");
  }
}

async function followSafeRedirects(value: string): Promise<string | null> {
  let current = value;
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    await assertPublicResearchUrl(current);
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      headers: { "user-agent": "JobPilot company research/1.0" },
    });
    await response.body?.cancel().catch(() => undefined);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 5) return null;
      current = new URL(location, current).href;
      continue;
    }
    return response.ok ? current : null;
  }
  return null;
}

export async function discoverCompanyOrigin(job: ResearchJob): Promise<string | null> {
  const savedCandidates = [job.applyUrl, job.sourceUrl];
  for (const candidate of savedCandidates) {
    if (!isSafeResearchUrl(candidate)) continue;
    try {
      const resolved = await followSafeRedirects(candidate);
      const origin = resolved ? normalizeCompanyOrigin(resolved) : null;
      if (origin) return origin;
    } catch {
      // Saved job-board URLs commonly fail or refuse redirect probing.
    }
  }

  const guessed = createCompanyDotComCandidate(job.company);
  if (!guessed) return null;
  try {
    const resolved = await followSafeRedirects(guessed);
    return resolved ? normalizeCompanyOrigin(resolved) : null;
  } catch {
    return null;
  }
}

async function createResearchBrowser(): Promise<ResearchBrowser | null> {
  const browserbaseApiKey = process.env.BROWSERBASE_API_KEY;
  if (!browserbaseApiKey) return null;

  const browser = await browserbase.launch({ apiKey: browserbaseApiKey, api_timeout: 120 });
  try {
    const activePage = await browser.context.activePage();
    if (!activePage) throw new Error("Browserbase did not provide an active page.");
    const page = activePage;

    async function extract(includeLinks: boolean) {
      const body = page.locator("body");
      const [text, html, pageUrl] = await Promise.all([
        body.innerText(),
        includeLinks ? body.innerHtml() : Promise.resolve(""),
        page.url(),
      ]);
      return extractRenderedResearchPage(text, html, pageUrl, includeLinks);
    }

    return {
      navigate: (url) => page.goto(url).then(() => undefined),
      extractHomepage: () => extract(true),
      async extractPage() {
        const content = await extract(false);
        return {
          oneLiner: content.oneLiner,
          productSummary: content.productSummary,
          signals: content.signals,
        };
      },
      closeBrowser: () => browser.close(),
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function logResearch(userId: string, jobId: string, message: string, level: "info" | "success" | "warning" | "error") {
  const insforge = await createInsforgeServer();
  const { error } = await insforge.database.from("agent_logs").insert([{
    run_id: null,
    user_id: userId,
    job_id: jobId,
    message,
    level,
  }]);
  if (error) throw new Error("Research log insert failed.", { cause: error });
}

function captureResearch(posthog: PostHog | null, userId: string, job: ResearchJob, provenance: "website" | "fallback") {
  posthog?.capture({
    distinctId: userId,
    event: "company_researched",
    properties: { userId, jobId: job.id, company: job.company, provenance },
  });
}

export async function researchCompany(
  userId: string,
  job: ResearchJob,
  profile: ProfileFormValues,
): Promise<CompanyResearchRunResult> {
  const posthog = createPostHogServer();
  try {
    return await runCompanyResearchWithDependencies(job, profile, {
      resolveOrigin: process.env.BROWSERBASE_API_KEY
        ? discoverCompanyOrigin
        : async () => null,
      createBrowser: createResearchBrowser,
      validateNavigation: assertPublicResearchUrl,
      generate: async (savedJob, savedProfile, evidence, sources) =>
        createDeterministicCompanyResearch(savedJob, savedProfile, evidence, sources),
      async persist(dossier: CompanyResearch) {
        const insforge = await createInsforgeServer();
        const { data, error } = await insforge.database
          .from("jobs")
          .update({ company_research: dossier })
          .eq("id", job.id)
          .eq("user_id", userId)
          .select("id")
          .maybeSingle();
        if (error || !data) throw new Error("Company research could not be saved.", { cause: error });
      },
      log: (message, level) => logResearch(userId, job.id, message, level),
      capture: (provenance) => captureResearch(posthog, userId, job, provenance),
    });
  } finally {
    try {
      await posthog?.shutdown();
    } catch (error) {
      console.error("[company-research] PostHog shutdown failed", error);
    }
  }
}

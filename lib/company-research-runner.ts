import type { CompanyResearch, CompanyResearchProvenance } from "../types/jobs.ts";
import type { ProfileFormValues } from "../types/profile.ts";
import {
  selectResearchPageLinks,
  type ResearchEvidence,
  type ResearchJob,
  type ResearchPageLink,
} from "./company-research.ts";

export type ExtractedResearchPage = Omit<ResearchEvidence, "url"> & {
  pageLinks: ResearchPageLink[];
};

export type ResearchBrowser = {
  navigate(url: string): Promise<void>;
  extractHomepage(): Promise<ExtractedResearchPage>;
  extractPage(kind: ResearchPageLink["kind"]): Promise<Omit<ExtractedResearchPage, "pageLinks">>;
  closeBrowser(): Promise<void>;
};

export type CompanyResearchRunnerDependencies = {
  resolveOrigin(job: ResearchJob): Promise<string | null>;
  createBrowser(): Promise<ResearchBrowser | null>;
  validateNavigation(url: string): Promise<void>;
  generate(
    job: ResearchJob,
    profile: ProfileFormValues,
    evidence: readonly ResearchEvidence[],
    sources: readonly string[],
  ): Promise<CompanyResearch>;
  persist(dossier: CompanyResearch): Promise<void>;
  log(message: string, level: "info" | "success" | "warning" | "error"): Promise<void>;
  capture(provenance: CompanyResearchProvenance): Promise<void> | void;
};

export type CompanyResearchRunResult = {
  dossier: CompanyResearch;
  provenance: CompanyResearchProvenance;
  message: string;
};

function useful(page: Pick<ResearchEvidence, "oneLiner" | "productSummary" | "signals">): boolean {
  return Boolean(page.oneLiner.trim() || page.productSummary.trim() || page.signals.length);
}

async function safeLog(
  deps: CompanyResearchRunnerDependencies,
  message: string,
  level: "info" | "success" | "warning" | "error",
): Promise<void> {
  try {
    await deps.log(message, level);
  } catch {
    // Research remains usable even when diagnostic logging is unavailable.
  }
}

export async function runCompanyResearchWithDependencies(
  job: ResearchJob,
  profile: ProfileFormValues,
  deps: CompanyResearchRunnerDependencies,
): Promise<CompanyResearchRunResult> {
  const evidence: ResearchEvidence[] = [];
  const sources: string[] = [];
  let browser: ResearchBrowser | null = null;

  try {
    let origin: string | null = null;
    try {
      origin = await deps.resolveOrigin(job);
    } catch (error) {
      await safeLog(deps, "The company site could not be resolved; using the saved job and profile.", "warning");
      console.error("[company-research] Company origin resolution failed", error);
    }
    if (origin) {
      try {
        browser = await deps.createBrowser();
      } catch (error) {
        await safeLog(deps, "The research browser could not start; using the saved job and profile.", "warning");
        console.error("[company-research] Browser launch failed", error);
      }
    }
    if (!origin || !browser) {
      await safeLog(deps, "Company-site browsing was unavailable; using the saved job and profile.", "warning");
    } else {
      try {
        await deps.validateNavigation(origin);
        await browser.navigate(origin);
        const homepage = await browser.extractHomepage();
        if (homepage.oneLiner.trim() || homepage.productSummary.trim()) {
          evidence.push({
            url: origin,
            oneLiner: homepage.oneLiner,
            productSummary: homepage.productSummary,
            signals: homepage.signals,
          });
          sources.push(origin);

          for (const link of selectResearchPageLinks(homepage.pageLinks, origin)) {
            try {
              await deps.validateNavigation(link.url);
              await browser.navigate(link.url);
              const page = await browser.extractPage(link.kind);
              if (useful(page)) {
                evidence.push({ url: link.url, ...page });
                sources.push(link.url);
              }
            } catch (error) {
              await safeLog(deps, `Skipped a company ${link.kind} page after a browsing failure.`, "warning");
              console.error("[company-research] Subpage research failed", error);
            }
          }
        } else {
          await safeLog(deps, "The company homepage did not provide usable evidence.", "warning");
        }
      } catch (error) {
        await safeLog(deps, "Company-site browsing failed; using the saved job and profile.", "warning");
        console.error("[company-research] Homepage research failed", error);
      }
    }
  } finally {
    if (browser) {
      try {
        await browser.closeBrowser();
      } catch (error) {
        console.error("[company-research] Browser cleanup failed", error);
      }
    }
  }

  const provenance: CompanyResearchProvenance = sources.length > 0 ? "website" : "fallback";
  const dossier = await deps.generate(job, profile, evidence, sources);
  await deps.persist(dossier);
  try {
    await deps.capture(provenance);
  } catch (error) {
    console.error("[company-research] Analytics capture failed", error);
  }
  await safeLog(deps, `Completed ${provenance === "website" ? "website-grounded" : "fallback"} company research.`, "success");

  return {
    dossier,
    provenance,
    message: provenance === "website"
      ? "Company research is ready."
      : "Research is ready using the saved job and your profile because the company site was unavailable.",
  };
}

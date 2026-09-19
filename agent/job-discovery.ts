import "server-only";

import type { PostHog } from "posthog-node";

import { scoreJob } from "@/agent/job-matcher";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  mapWithConcurrency,
  summarizeProcessingStatuses,
} from "@/lib/job-discovery";
import { searchJobsWithFallback } from "@/lib/job-providers";
import { createPostHogServer } from "@/lib/posthog-server";
import { createNormalizedJobIdentity } from "@/lib/searchapi-normalization";
import { SearchApiConfigurationError } from "@/lib/searchapi";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { DiscoveredJob, FindJobsSuccess } from "@/types/jobs";
import type { ProfileFormValues } from "@/types/profile";

type DiscoverySuccess = {
  success: true;
  data: FindJobsSuccess["data"];
};

type DiscoveryFailure = {
  success: false;
  error: string;
};

export type DiscoveryResult = DiscoverySuccess | DiscoveryFailure;

type ProcessResult =
  | { status: "saved"; strongMatch: boolean }
  | { status: "enriched" }
  | { status: "duplicate" }
  | { status: "failed" };

type ExistingJob = {
  id: string;
  title: string;
  company: string;
  externalJobId: string | null;
};

type JobWorkItem = {
  job: DiscoveredJob;
  enrichJobId: string | null;
};

async function logRunMessage(
  runId: string,
  userId: string,
  message: string,
  level: "info" | "success" | "warning" | "error",
): Promise<void> {
  try {
    const insforge = await createInsforgeServer();
    const { error } = await insforge.database.from("agent_logs").insert({
      run_id: runId,
      user_id: userId,
      message,
      level,
    });
    if (error) {
      console.error("[agent/job-discovery] Agent log insert failed", error);
    }
  } catch (error) {
    console.error("[agent/job-discovery] Agent log insert failed", error);
  }
}

async function finishRun(
  runId: string,
  userId: string,
  status: "completed" | "failed",
  jobsFound: number,
): Promise<boolean> {
  const insforge = await createInsforgeServer();
  const { error } = await insforge.database
    .from("agent_runs")
    .update({
      status,
      jobs_found: jobsFound,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .eq("user_id", userId);
  if (error) {
    console.error("[agent/job-discovery] Run finalization failed", error);
    return false;
  }
  return true;
}

function captureEvent(
  posthog: PostHog | null,
  userId: string,
  event: "job_search_started" | "job_found",
  properties: Record<string, unknown>,
): void {
  try {
    posthog?.capture({
      distinctId: userId,
      event,
      properties: { userId, ...properties },
    });
  } catch (error) {
    console.error(`[agent/job-discovery] ${event} capture failed`, error);
  }
}

async function isExistingJob(
  userId: string,
  externalJobId: string,
): Promise<boolean> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("jobs")
    .select("id")
    .eq("user_id", userId)
    .eq("source", "search")
    .eq("external_job_id", externalJobId)
    .maybeSingle();
  if (error) {
    throw new Error("Existing job lookup failed.", { cause: error });
  }
  return Boolean(data);
}

async function processJob(
  job: DiscoveredJob,
  profile: ProfileFormValues,
  userId: string,
  runId: string,
  posthog: PostHog | null,
  enrichJobId: string | null,
): Promise<ProcessResult> {
  try {
    const match = await scoreJob(profile, job);
    const insforge = await createInsforgeServer();
    const updates = {
      external_job_id: job.externalId,
      source_url: job.sourceUrl,
      external_apply_url: job.applyUrl,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      job_type: job.jobType,
      about_role: job.description || null,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      nice_to_have: job.niceToHave,
      benefits: job.benefits,
      about_company: null,
      match_score: match.matchScore,
      match_reason: match.matchReason,
      matched_skills: match.matchedSkills,
      missing_skills: match.missingSkills,
    };

    if (enrichJobId) {
      const { error } = await insforge.database
        .from("jobs")
        .update(updates)
        .eq("id", enrichJobId)
        .eq("user_id", userId);
      if (error) throw new Error("Job enrichment failed.", { cause: error });
      return { status: "enriched" };
    }

    const { error } = await insforge.database.from("jobs").insert({
      ...updates,
      run_id: runId,
      user_id: userId,
      source: "search",
      found_at: new Date().toISOString(),
    });

    if (error) {
      if (await isExistingJob(userId, job.externalId)) {
        return { status: "duplicate" };
      }
      throw new Error("Job insert failed.", { cause: error });
    }

    captureEvent(posthog, userId, "job_found", {
      source: "search",
      matchScore: match.matchScore,
    });
    return {
      status: "saved",
      strongMatch: match.matchScore >= MATCH_THRESHOLD,
    };
  } catch (error) {
    console.error(
      `[agent/job-discovery] Job processing failed for ${job.externalId}`,
      error,
    );
    await logRunMessage(
      runId,
      userId,
      `Skipped ${job.title} at ${job.company} because it could not be processed.`,
      "error",
    );
    return { status: "failed" };
  }
}

export async function discoverJobs(
  userId: string,
  jobTitle: string,
  location: string,
  profile: ProfileFormValues,
): Promise<DiscoveryResult> {
  const insforge = await createInsforgeServer();
  const { data: run, error: runError } = await insforge.database
    .from("agent_runs")
    .insert({
      user_id: userId,
      status: "running",
      job_title_searched: jobTitle,
      location_searched: location || null,
    })
    .select("id")
    .single();
  if (runError || !run?.id) {
    console.error("[agent/job-discovery] Run creation failed", runError);
    return { success: false, error: "We could not start the job search." };
  }

  const runId = String(run.id);
  const posthog = createPostHogServer();
  try {
    captureEvent(posthog, userId, "job_search_started", {
      jobTitle,
      location,
    });
    await logRunMessage(runId, userId, `Searching for ${jobTitle}.`, "info");

    let providerResult: Awaited<ReturnType<typeof searchJobsWithFallback>>;
    try {
      providerResult = await searchJobsWithFallback(jobTitle, location);
    } catch (error) {
      console.error("[agent/job-discovery] Provider search failed", error);
      await logRunMessage(
        runId,
        userId,
        error instanceof SearchApiConfigurationError
          ? "SearchAPI is not configured with a valid API key."
          : "The job provider was unavailable for this search.",
        "error",
      );
      await finishRun(runId, userId, "failed", 0);
      return {
        success: false,
        error:
          error instanceof SearchApiConfigurationError
            ? "Add a valid SearchAPI key before searching for jobs."
            : "Job search is temporarily unavailable. Please try again.",
      };
    }

    if (providerResult.fellBack) {
      await logRunMessage(
        runId,
        userId,
        "SearchAPI quota was exhausted, so this search used Adzuna previews.",
        "warning",
      );
    }

    const uniqueJobs = Array.from(
      new Map(
        providerResult.jobs.map((job) => [job.externalId, job]),
      ).values(),
    );
    const providerDuplicates = providerResult.jobs.length - uniqueJobs.length;
    const existingIds = new Set<string>();
    const existingJobs: ExistingJob[] = [];
    const { data: existingData, error: existingError } = await insforge.database
      .from("jobs")
      .select("id, title, company, external_job_id")
      .eq("user_id", userId)
      .eq("source", "search")
      .order("found_at", { ascending: false })
      .limit(500);
    if (existingError) {
      console.error("[agent/job-discovery] Duplicate lookup failed", existingError);
      await finishRun(runId, userId, "failed", 0);
      return { success: false, error: "We could not prepare the search results." };
    }
    for (const row of existingData ?? []) {
      if (
        typeof row.id === "string" &&
        typeof row.title === "string" &&
        typeof row.company === "string"
      ) {
        const externalJobId =
          typeof row.external_job_id === "string"
            ? row.external_job_id
            : null;
        if (externalJobId) existingIds.add(externalJobId);
        existingJobs.push({
          id: row.id,
          title: row.title,
          company: row.company,
          externalJobId,
        });
      }
    }

    const existingByIdentity = new Map<string, ExistingJob>();
    for (const existingJob of existingJobs) {
      const key = createNormalizedJobIdentity(
        existingJob.title,
        existingJob.company,
      );
      if (!existingByIdentity.has(key)) existingByIdentity.set(key, existingJob);
    }

    let exactDuplicates = 0;
    let externalDuplicates = 0;
    const workItems: JobWorkItem[] = [];
    for (const job of uniqueJobs) {
      if (existingIds.has(job.externalId)) {
        externalDuplicates += 1;
        continue;
      }
      const identity = createNormalizedJobIdentity(job.title, job.company);
      const exactMatch = existingByIdentity.get(identity);
      if (exactMatch) {
        existingByIdentity.delete(identity);
        if (
          job.provider === "searchapi" &&
          !exactMatch.externalJobId?.startsWith("searchapi:")
        ) {
          workItems.push({ job, enrichJobId: exactMatch.id });
        } else {
          exactDuplicates += 1;
        }
        continue;
      }
      workItems.push({ job, enrichJobId: null });
    }

    const results = await mapWithConcurrency(workItems, 3, (item) =>
      processJob(
        item.job,
        profile,
        userId,
        runId,
        posthog,
        item.enrichJobId,
      ),
    );
    const enrichedJobs = results.filter(
      (result) => result.status === "enriched",
    ).length;
    const summary = summarizeProcessingStatuses(
      results.flatMap((result) =>
        result.status === "saved"
          ? [result.strongMatch ? "savedStrong" : "saved"]
          : result.status === "enriched"
            ? []
            : [result.status],
      ),
      externalDuplicates + providerDuplicates + exactDuplicates,
    );
    const {
      jobsFound,
      strongMatches,
      skippedJobs,
      failedJobs,
      partial,
    } = summary;

    if (workItems.length > 0 && jobsFound === 0 && enrichedJobs === 0 && failedJobs > 0) {
      await finishRun(runId, userId, "failed", 0);
      return {
        success: false,
        error: "We found jobs but could not process them. Please try again.",
      };
    }

    const runCompleted = await finishRun(
      runId,
      userId,
      "completed",
      jobsFound,
    );
    if (!runCompleted) {
      return {
        success: false,
        error: "Your jobs were saved, but the search run could not be finalized.",
      };
    }
    await logRunMessage(
      runId,
      userId,
      `Saved ${jobsFound} jobs with ${strongMatches} strong matches.`,
      "success",
    );
    const message =
      uniqueJobs.length === 0
        ? "No jobs matched this search. Try a broader job title or another location."
        : jobsFound === 0 && enrichedJobs === 0 && skippedJobs > 0 && failedJobs === 0
          ? "No new jobs were added because the matching listings are already saved."
          : `Found ${jobsFound} new ${jobsFound === 1 ? "job" : "jobs"} and saved ${strongMatches} strong ${strongMatches === 1 ? "match" : "matches"}.${enrichedJobs > 0 ? ` Added full descriptions to ${enrichedJobs} saved ${enrichedJobs === 1 ? "job" : "jobs"}.` : ""}${providerResult.fellBack ? " SearchAPI quota was reached, so Adzuna previews were used." : ""}${partial ? " Some results were skipped." : ""}`;

    return {
      success: true,
      data: {
        runId,
        jobsFound,
        strongMatches,
        skippedJobs,
        partial,
        message,
      },
    };
  } catch (error) {
    console.error("[agent/job-discovery] Unexpected discovery failure", error);
    await logRunMessage(
      runId,
      userId,
      "The search stopped because of an unexpected error.",
      "error",
    );
    await finishRun(runId, userId, "failed", 0);
    return { success: false, error: "The job search could not be completed." };
  } finally {
    if (posthog) {
      try {
        await posthog.shutdown();
      } catch (error) {
        console.error("[agent/job-discovery] PostHog shutdown failed", error);
      }
    }
  }
}

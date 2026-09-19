import "server-only";

import type { PostHog } from "posthog-node";

import { scoreJob } from "@/agent/job-matcher";
import { searchAdzunaJobs } from "@/lib/adzuna";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  detectAdzunaCountry,
  formatAdzunaSalary,
  mapWithConcurrency,
  normalizeJobType,
  summarizeProcessingStatuses,
} from "@/lib/job-discovery";
import { createPostHogServer } from "@/lib/posthog-server";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { AdzunaJob, FindJobsSuccess } from "@/types/jobs";
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
  | { status: "duplicate" }
  | { status: "failed" };

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
  job: AdzunaJob,
  profile: ProfileFormValues,
  userId: string,
  runId: string,
  country: ReturnType<typeof detectAdzunaCountry>,
  posthog: PostHog | null,
): Promise<ProcessResult> {
  try {
    const match = await scoreJob(profile, job);
    const insforge = await createInsforgeServer();
    const { error } = await insforge.database.from("jobs").insert({
      run_id: runId,
      user_id: userId,
      source: "search",
      external_job_id: job.id,
      source_url: job.redirect_url,
      external_apply_url: job.redirect_url,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name || null,
      salary: formatAdzunaSalary(job, country),
      job_type: normalizeJobType(job),
      about_role: job.description || null,
      responsibilities: [],
      requirements: [],
      nice_to_have: [],
      benefits: [],
      about_company: null,
      match_score: match.matchScore,
      match_reason: match.matchReason,
      matched_skills: match.matchedSkills,
      missing_skills: match.missingSkills,
      found_at: new Date().toISOString(),
    });

    if (error) {
      if (await isExistingJob(userId, job.id)) {
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
    console.error(`[agent/job-discovery] Job processing failed for ${job.id}`, error);
    await logRunMessage(
      runId,
      userId,
      `Skipped ${job.title} at ${job.company.display_name} because it could not be processed.`,
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

    const country = detectAdzunaCountry(location);
    let adzunaJobs: AdzunaJob[];
    try {
      adzunaJobs = await searchAdzunaJobs(jobTitle, location, country);
    } catch (error) {
      console.error("[agent/job-discovery] Adzuna search failed", error);
      await logRunMessage(
        runId,
        userId,
        "The job provider was unavailable for this search.",
        "error",
      );
      await finishRun(runId, userId, "failed", 0);
      return {
        success: false,
        error: "Job search is temporarily unavailable. Please try again.",
      };
    }

    const uniqueJobs = Array.from(
      new Map(adzunaJobs.map((job) => [job.id, job])).values(),
    );
    const providerDuplicates = adzunaJobs.length - uniqueJobs.length;
    const existingIds = new Set<string>();
    if (uniqueJobs.length > 0) {
      const { data, error } = await insforge.database
        .from("jobs")
        .select("external_job_id")
        .eq("user_id", userId)
        .eq("source", "search")
        .in(
          "external_job_id",
          uniqueJobs.map((job) => job.id),
        );
      if (error) {
        console.error("[agent/job-discovery] Duplicate lookup failed", error);
        await finishRun(runId, userId, "failed", 0);
        return { success: false, error: "We could not prepare the search results." };
      }
      for (const row of data ?? []) {
        if (typeof row.external_job_id === "string") {
          existingIds.add(row.external_job_id);
        }
      }
    }

    const newJobs = uniqueJobs.filter((job) => !existingIds.has(job.id));
    const results = await mapWithConcurrency(newJobs, 3, (job) =>
      processJob(job, profile, userId, runId, country, posthog),
    );
    const summary = summarizeProcessingStatuses(
      results.map((result) =>
        result.status === "saved"
          ? result.strongMatch
            ? "savedStrong"
            : "saved"
          : result.status,
      ),
      existingIds.size + providerDuplicates,
    );
    const {
      jobsFound,
      strongMatches,
      skippedJobs,
      failedJobs,
      partial,
    } = summary;

    if (newJobs.length > 0 && jobsFound === 0 && failedJobs > 0) {
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
        : jobsFound === 0 && existingIds.size > 0 && failedJobs === 0
          ? "No new jobs were added because the matching listings are already saved."
          : `Found ${jobsFound} new ${jobsFound === 1 ? "job" : "jobs"} and saved ${strongMatches} strong ${strongMatches === 1 ? "match" : "matches"}.${partial ? " Some results were skipped." : ""}`;

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

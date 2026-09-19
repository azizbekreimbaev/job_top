import "server-only";

import OpenAI from "openai";

import { scoreJobWithClient } from "@/lib/job-matching";
export { JobMatchingOutputError } from "@/lib/job-matching";
import type { AdzunaJob, JobMatch } from "@/types/jobs";
import type { ProfileFormValues } from "@/types/profile";

export async function scoreJob(
  profile: ProfileFormValues,
  job: AdzunaJob,
): Promise<JobMatch> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30_000,
  });
  return scoreJobWithClient(profile, job, client);
}

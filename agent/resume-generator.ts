import "server-only";

import OpenAI from "openai";

import { generateResumeContentWithClient } from "@/lib/resume-generation";
export { ResumeGenerationOutputError } from "@/lib/resume-generation";
import type {
  GeneratedResumeContent,
  ProfileFormValues,
} from "@/types/profile";

export async function generateResumeContent(
  profile: ProfileFormValues,
): Promise<GeneratedResumeContent> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 45_000,
  });
  return generateResumeContentWithClient(profile, client);
}

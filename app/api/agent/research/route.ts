import { researchCompany } from "@/agent/company-research";
import { parseCompanyResearchInput, type ResearchJob } from "@/lib/company-research";
import { normalizeJobDetails } from "@/lib/job-details";
import { createInsforgeServer } from "@/lib/insforge-server";
import { calculateProfileCompletion, createProfileFormValues } from "@/lib/profile";
import type { CompanyResearchResponse } from "@/types/jobs";

export const runtime = "nodejs";

const RESEARCH_JOB_COLUMNS = "id, source, external_job_id, title, company, location, salary, job_type, about_role, responsibilities, requirements, nice_to_have, benefits, match_score, match_reason, matched_skills, missing_skills, source_url, external_apply_url, found_at, company_research";

function errorResponse(error: string, status: number, profileRequired = false): Response {
  return Response.json(
    { success: false, error, ...(profileRequired ? { profileRequired: true } : {}) } satisfies CompanyResearchResponse,
    { status },
  );
}

export async function POST(request: Request): Promise<Response> {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } = await insforge.auth.getCurrentUser();
    if (authError || !authData?.user) {
      return errorResponse("Your session expired. Please sign in again.", 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Choose a saved job to research.", 400);
    }
    const parsed = parseCompanyResearchInput(body);
    if (!parsed.valid) return errorResponse(parsed.error, 400);

    const { data: jobRecord, error: jobError } = await insforge.database
      .from("jobs")
      .select(RESEARCH_JOB_COLUMNS)
      .eq("id", parsed.jobId)
      .eq("user_id", authData.user.id)
      .maybeSingle();
    if (jobError) {
      console.error("[agent/research] Job lookup failed", jobError);
      return errorResponse("We could not load this saved job.", 503);
    }
    const jobDetails = normalizeJobDetails(jobRecord);
    if (!jobDetails) return errorResponse("That saved job was not found.", 404);

    const { data: profileRecord, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (profileError) {
      console.error("[agent/research] Profile lookup failed", profileError);
      return errorResponse("We could not load your saved profile.", 503);
    }
    if (!profileRecord) {
      return errorResponse("Create and save your profile before researching a company.", 404, true);
    }

    const profile = createProfileFormValues(profileRecord, {
      email: authData.user.email,
      fullName: "",
    });
    const completion = calculateProfileCompletion(profile);
    if (profileRecord.is_complete !== true || !completion.isComplete) {
      return errorResponse("Complete and save your profile before researching a company.", 422, true);
    }

    const job: ResearchJob = {
      id: jobDetails.id,
      title: jobDetails.title,
      company: jobDetails.company,
      aboutRole: jobDetails.aboutRole,
      responsibilities: jobDetails.responsibilities,
      requirements: jobDetails.requirements,
      niceToHave: jobDetails.niceToHave,
      benefits: jobDetails.benefits,
      matchedSkills: jobDetails.matchedSkills,
      missingSkills: jobDetails.missingSkills,
      sourceUrl: jobDetails.sourceUrl,
      applyUrl: jobDetails.applyUrl,
    };
    const result = await researchCompany(authData.user.id, job, profile);
    return Response.json({ success: true, data: result } satisfies CompanyResearchResponse);
  } catch (error) {
    console.error("[agent/research] Research failed", error);
    return errorResponse("Company research could not be completed. Your existing research is unchanged; please try again.", 503);
  }
}

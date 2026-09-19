import { discoverJobs } from "@/agent/job-discovery";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parseFindJobsInput } from "@/lib/job-discovery";
import {
  calculateProfileCompletion,
  createProfileFormValues,
} from "@/lib/profile";
import type { FindJobsResponse } from "@/types/jobs";

export const runtime = "nodejs";

function errorResponse(
  error: string,
  status: number,
  profileRequired = false,
): Response {
  return Response.json(
    {
      success: false,
      error,
      ...(profileRequired ? { profileRequired: true } : {}),
    } satisfies FindJobsResponse,
    { status },
  );
}

async function findJobsResponse(request: Request): Promise<Response> {
  const insforge = await createInsforgeServer();
  const { data: authData, error: authError } =
    await insforge.auth.getCurrentUser();
  if (authError || !authData?.user) {
    return errorResponse("Your session expired. Please sign in again.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Enter a job title to start searching.", 400);
  }
  const parsedInput = parseFindJobsInput(body);
  if (!parsedInput.valid) return errorResponse(parsedInput.error, 400);
  const { jobTitle, location } = parsedInput.input;

  const { data: profileRecord, error: profileError } =
    await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();
  if (profileError) {
    console.error("[agent/find] Profile lookup failed", profileError);
    return errorResponse("We could not load your saved profile.", 503);
  }
  if (!profileRecord) {
    return errorResponse(
      "Create and save your profile before searching for jobs.",
      404,
      true,
    );
  }

  const profile = createProfileFormValues(profileRecord, {
    email: authData.user.email,
    fullName: "",
  });
  const completion = calculateProfileCompletion(profile);
  if (profileRecord.is_complete !== true || !completion.isComplete) {
    return errorResponse(
      "Complete and save your profile before searching for jobs.",
      422,
      true,
    );
  }

  const result = await discoverJobs(
    authData.user.id,
    jobTitle,
    location,
    profile,
  );
  if (!result.success) {
    return errorResponse(result.error, 503);
  }
  return Response.json({ success: true, data: result.data } satisfies FindJobsResponse);
}

export async function POST(request: Request): Promise<Response> {
  try {
    return await findJobsResponse(request);
  } catch (error) {
    console.error("[agent/find] Unexpected failure", error);
    return errorResponse("Something went wrong while searching for jobs.", 500);
  }
}

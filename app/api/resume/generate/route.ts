import { renderToBuffer } from "@react-pdf/renderer";

import {
  generateResumeContent,
  ResumeGenerationOutputError,
} from "@/agent/resume-generator";
import { ResumeDocument } from "@/components/profile/ResumeDocument";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createProfileFormValues } from "@/lib/profile";
import {
  countRenderedPdfPages,
  getResumeGenerationEligibility,
} from "@/lib/resume";
import type { ResumeGenerationResponse } from "@/types/profile";

export const runtime = "nodejs";

function errorResponse(
  error: string,
  status: number,
  missingFields?: string[],
): Response {
  return Response.json(
    {
      success: false,
      error,
      ...(missingFields ? { missingFields } : {}),
    } satisfies ResumeGenerationResponse,
    { status },
  );
}

async function generateResumeResponse(): Promise<Response> {
  const insforge = await createInsforgeServer();
  const { data: authData, error: authError } =
    await insforge.auth.getCurrentUser();

  if (authError || !authData?.user) {
    return errorResponse("Your session expired. Please sign in again.", 401);
  }

  const { data: profileRecord, error: profileError } = await insforge.database
    .from("profiles")
    .select(
      "full_name, email, phone, location, current_title, experience_level, years_experience, skills, industries, work_experience, education, job_titles_seeking, remote_preference, preferred_locations, salary_expectation, linkedin_url, portfolio_url, work_authorization, resume_pdf_key",
    )
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[resume/generate] Profile lookup failed", profileError);
    return errorResponse(
      "We could not load your saved profile. Please try again.",
      503,
    );
  }
  if (!profileRecord) {
    return errorResponse(
      "Save your profile before generating a resume.",
      404,
    );
  }

  const profile = createProfileFormValues(profileRecord, {
    email: authData.user.email,
    fullName: "",
  });
  const eligibility = getResumeGenerationEligibility(profile);
  if (!eligibility.ready) {
    return errorResponse(
      "Complete the required resume fields and save your profile before generating.",
      422,
      eligibility.missingFields,
    );
  }

  let content;
  try {
    content = await generateResumeContent(profile);
  } catch (error) {
    if (error instanceof ResumeGenerationOutputError) {
      console.error("[resume/generate] Structured output validation failed", error);
      return errorResponse(
        "We could not create valid resume content. Please try again.",
        422,
      );
    }
    console.error("[resume/generate] OpenAI generation failed", error);
    return errorResponse(
      "AI resume generation is temporarily unavailable. Your current resume was not changed.",
      503,
    );
  }

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      ResumeDocument({ profile, content }),
    );
  } catch (error) {
    console.error("[resume/generate] PDF rendering failed", error);
    return errorResponse(
      "We could not render your resume. Your current resume was not changed.",
      503,
    );
  }

  const renderedPageCount = countRenderedPdfPages(buffer);
  if (renderedPageCount !== 1) {
    console.error(
      `[resume/generate] Expected one rendered page, received ${renderedPageCount}`,
    );
    return errorResponse(
      "We could not fit your resume onto one page. Your current resume was not changed.",
      422,
    );
  }

  const resumePdfKey = `${authData.user.id}/resume.pdf`;
  const resumeBlob = new Blob([new Uint8Array(buffer)], {
    type: "application/pdf",
  });
  const { error: uploadError } = await insforge.storage
    .from("resumes")
    .upload(resumePdfKey, resumeBlob);

  if (uploadError) {
    console.error("[resume/generate] Resume upload failed", uploadError);
    return errorResponse(
      "We generated your resume but could not save it. Your current resume was not changed.",
      503,
    );
  }

  const { error: saveError } = await insforge.database
    .from("profiles")
    .update({ resume_pdf_key: resumePdfKey })
    .eq("id", authData.user.id)
    .select("id")
    .single();

  if (saveError) {
    console.error("[resume/generate] Resume key save failed", saveError);
    return errorResponse(
      "Your PDF was created, but we could not attach it to your profile. Please try again.",
      503,
    );
  }

  return Response.json({
    success: true,
    message: "Resume generated successfully.",
  } satisfies ResumeGenerationResponse);
}

export async function POST(): Promise<Response> {
  try {
    return await generateResumeResponse();
  } catch (error) {
    console.error("[resume/generate] Unexpected failure", error);
    return errorResponse(
      "Something went wrong while generating your resume. Your current resume was not changed.",
      500,
    );
  }
}

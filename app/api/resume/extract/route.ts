import { pathToFileURL } from "node:url";

import { PDFParse } from "pdf-parse";
import { getPath as getPdfWorkerPath } from "pdf-parse/worker";

import {
  extractProfileFromResumeText,
  ProfileExtractionOutputError,
} from "@/agent/profile-extractor";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { ProfileExtractionResponse } from "@/types/profile";

export const runtime = "nodejs";

PDFParse.setWorker(pathToFileURL(getPdfWorkerPath()).href);

const MINIMUM_RESUME_TEXT_LENGTH = 100;
const UNREADABLE_PDF_MESSAGE =
  "We could not read enough text from this PDF. Please try a different file.";

function errorResponse(error: string, status: number) {
  return Response.json(
    { success: false, error } satisfies ProfileExtractionResponse,
    { status },
  );
}

function isPdfInfrastructureError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = `${error.message} ${
    error.cause instanceof Error ? error.cause.message : ""
  }`.toLowerCase();

  return [
    "fake worker",
    "cannot find module",
    "workeroptions",
    "dommatrix",
    "native binding",
    "unsupported protocol",
  ].some((fragment) => message.includes(fragment));
}

export async function POST() {
  const insforge = await createInsforgeServer();
  const { data: authData, error: authError } =
    await insforge.auth.getCurrentUser();

  if (authError || !authData?.user) {
    return errorResponse("Your session expired. Please sign in again.", 401);
  }

  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("resume_pdf_key")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[resume/extract] Profile lookup failed", profileError);
    return errorResponse(
      "We could not prepare your resume for extraction. Please try again.",
      503,
    );
  }
  if (!profile || typeof profile.resume_pdf_key !== "string") {
    return errorResponse("Upload a PDF resume before extracting profile data.", 404);
  }

  const { data: resume, error: downloadError } = await insforge.storage
    .from("resumes")
    .download(profile.resume_pdf_key);

  if (downloadError || !resume) {
    console.error("[resume/extract] Resume download failed", downloadError);
    return errorResponse(
      "We could not open your uploaded resume. Please try again.",
      503,
    );
  }

  let parser: PDFParse | null = null;
  let resumeText = "";
  try {
    parser = new PDFParse({ data: new Uint8Array(await resume.arrayBuffer()) });
    const parsed = await parser.getText();
    resumeText = parsed.text.replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error("[resume/extract] PDF parsing failed", error);
    if (isPdfInfrastructureError(error)) {
      return errorResponse(
        "Resume processing is temporarily unavailable. Please try again.",
        503,
      );
    }
    return errorResponse(UNREADABLE_PDF_MESSAGE, 422);
  } finally {
    await parser?.destroy().catch(() => undefined);
  }

  if (resumeText.length < MINIMUM_RESUME_TEXT_LENGTH) {
    return errorResponse(UNREADABLE_PDF_MESSAGE, 422);
  }

  try {
    const extraction = await extractProfileFromResumeText(resumeText);
    return Response.json({ success: true, ...extraction } satisfies ProfileExtractionResponse);
  } catch (error) {
    if (error instanceof ProfileExtractionOutputError) {
      console.error("[resume/extract] Structured output validation failed", error);
      return errorResponse(
        "We could not understand the extracted profile data. Please try again.",
        422,
      );
    }
    console.error("[resume/extract] OpenAI extraction failed", error);
    return errorResponse(
      "AI extraction is temporarily unavailable. Your profile was not changed.",
      503,
    );
  }
}

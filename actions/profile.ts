"use server";

import { revalidatePath } from "next/cache";

import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";
import {
  calculateProfileCompletion,
  createProfileFormValues,
  isEducationDegree,
  isExperienceLevel,
  isRecord,
  isRemotePreference,
  isValidOptionalHttpUrl,
  isWorkAuthorization,
  MAX_EDUCATION_ENTRIES,
  MAX_WORK_EXPERIENCE_ROLES,
  normalizeCommaSeparatedList,
  normalizeEducationEntries,
  normalizeOptionalText,
  normalizeStringList,
  normalizeText,
  normalizeWorkExperience,
} from "@/lib/profile";
import {
  hasPdfFileName,
  hasPdfHeader,
  MAX_RESUME_SIZE,
} from "@/lib/resume";
import type {
  Education,
  ProfileActionState,
  ProfileFormValues,
  ResumeUploadActionState,
  WorkExperience,
} from "@/types/profile";

type ParsedJson =
  | { success: true; value: unknown }
  | { success: false; message: string };

function parseJsonField(formData: FormData, name: string): ParsedJson {
  const rawValue = formData.get(name);
  if (typeof rawValue !== "string") {
    return { success: false, message: "Some profile fields are malformed." };
  }

  try {
    const value: unknown = JSON.parse(rawValue);
    return { success: true, value };
  } catch {
    return { success: false, message: "Some profile fields are malformed." };
  }
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }

  return normalizeStringList(value);
}

function isWorkExperiencePayload(value: unknown): value is WorkExperience[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(
    (role) =>
      isRecord(role) &&
      typeof role.company === "string" &&
      typeof role.title === "string" &&
      typeof role.startDate === "string" &&
      typeof role.endDate === "string" &&
      typeof role.currentlyWorking === "boolean" &&
      typeof role.responsibilities === "string",
  );
}

function isEducationPayload(value: unknown): value is Education[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.degree === "string" &&
        typeof entry.fieldOfStudy === "string" &&
        typeof entry.institution === "string" &&
        typeof entry.graduationYear === "string",
    )
  );
}

function createErrorState(
  previousState: ProfileActionState,
  message: string,
  fieldErrors?: Record<string, string>,
): ProfileActionState {
  return {
    ...previousState,
    status: "error",
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
  };
}

async function getResumeValidationError(resume: File): Promise<string | null> {
  if (!hasPdfFileName(resume.name)) {
    return "Only PDF files are supported.";
  }
  if (resume.size > MAX_RESUME_SIZE) {
    return "Choose a PDF that is 5 MB or smaller.";
  }

  const header = new TextDecoder().decode(
    await resume.slice(0, 1024).arrayBuffer(),
  );
  return hasPdfHeader(header)
    ? null
    : "The selected file is not a valid PDF.";
}

async function captureFirstCompletion(userId: string): Promise<void> {
  const posthog = createPostHogServer();
  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId: userId,
      event: "profile_completed",
      properties: { userId },
    });
  } catch (error) {
    console.error("[saveProfile] Unable to capture profile completion", error);
  } finally {
    try {
      await posthog.shutdown();
    } catch (error) {
      console.error("[saveProfile] Unable to flush profile completion", error);
    }
  }
}

export async function uploadResume(
  formData: FormData,
): Promise<ResumeUploadActionState> {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } =
      await insforge.auth.getCurrentUser();

    if (authError || !authData?.user) {
      return {
        status: "error",
        message: "Your session expired. Sign in again before uploading.",
      };
    }

    const entry = formData.get("resume");
    if (!(entry instanceof File) || entry.size === 0) {
      return { status: "error", message: "Choose a PDF resume to upload." };
    }

    const validationError = await getResumeValidationError(entry);
    if (validationError) {
      return { status: "error", message: validationError };
    }

    const resumePdfKey = `${authData.user.id}/resume.pdf`;
    const { error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(resumePdfKey, entry);

    if (uploadError) {
      console.error("[uploadResume] Resume upload failed", uploadError);
      return {
        status: "error",
        message: "Resume upload failed. Try again in a moment.",
      };
    }

    const { data: existingProfile, error: existingProfileError } =
      await insforge.database
        .from("profiles")
        .select("id")
        .eq("id", authData.user.id)
        .maybeSingle();

    if (existingProfileError) {
      console.error(
        "[uploadResume] Existing profile lookup failed",
        existingProfileError,
      );
      return {
        status: "error",
        message: "The PDF uploaded, but your profile could not be updated. Try again.",
      };
    }

    const initialProfile = createProfileFormValues(null, {
      email: authData.user.email,
      fullName: authData.user.profile?.name ?? "",
    });
    const completion = calculateProfileCompletion(initialProfile);
    const profileMutation = existingProfile
      ? insforge.database
          .from("profiles")
          .update({ resume_pdf_key: resumePdfKey })
          .eq("id", authData.user.id)
      : insforge.database.from("profiles").insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: initialProfile.fullName || null,
          resume_pdf_key: resumePdfKey,
          completion_percentage: completion.completionPercentage,
          is_complete: completion.isComplete,
          missing_fields: completion.missingFields,
        });
    const { error: saveError } = await profileMutation
      .select("id")
      .single();

    if (saveError) {
      console.error("[uploadResume] Resume key save failed", saveError);
      return {
        status: "error",
        message: "The PDF uploaded, but it could not be attached to your profile. Try again.",
      };
    }

    return {
      status: "success",
      message: "Resume uploaded successfully.",
    };
  } catch (error) {
    console.error("[uploadResume] Unexpected failure", error);
    return {
      status: "error",
      message: "Something went wrong while uploading your resume.",
    };
  }
}

export async function saveProfile(
  previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData, error: authError } =
      await insforge.auth.getCurrentUser();

    if (authError || !authData?.user) {
      if (authError) {
        console.error("[saveProfile] Session verification failed", authError);
      }
      return createErrorState(
        previousState,
        "Your session has expired. Sign in again before saving your profile.",
      );
    }

    const skillsResult = parseJsonField(formData, "skillsJson");
    const industriesResult = parseJsonField(formData, "industriesJson");
    const workExperienceResult = parseJsonField(
      formData,
      "workExperienceJson",
    );
    const educationResult = parseJsonField(formData, "educationJson");

    if (
      !skillsResult.success ||
      !industriesResult.success ||
      !workExperienceResult.success ||
      !educationResult.success
    ) {
      return createErrorState(
        previousState,
        "Some profile fields could not be read. Refresh the page and try again.",
      );
    }

    const skills = parseStringArray(skillsResult.value);
    const industries = parseStringArray(industriesResult.value);
    if (!skills || !industries) {
      return createErrorState(
        previousState,
        "Skills or industries contain invalid values.",
      );
    }

    if (!isWorkExperiencePayload(workExperienceResult.value)) {
      return createErrorState(
        previousState,
        "Work experience contains invalid data. Refresh the page and try again.",
        { workExperience: "One or more roles are malformed." },
      );
    }

    if (workExperienceResult.value.length > MAX_WORK_EXPERIENCE_ROLES) {
      return createErrorState(
        previousState,
        `Add no more than ${MAX_WORK_EXPERIENCE_ROLES} work experience roles.`,
        { workExperience: "A maximum of three roles is allowed." },
      );
    }

    if (!isEducationPayload(educationResult.value)) {
      return createErrorState(
        previousState,
        "Education contains invalid data. Refresh the page and try again.",
        { education: "One or more education entries are malformed." },
      );
    }

    if (educationResult.value.length > MAX_EDUCATION_ENTRIES) {
      return createErrorState(
        previousState,
        `Add no more than ${MAX_EDUCATION_ENTRIES} education entries.`,
        { education: "A maximum of five education entries is allowed." },
      );
    }

    const rawExperienceLevel = normalizeText(formData.get("experienceLevel"));
    const rawRemotePreference = normalizeText(
      formData.get("remotePreference"),
    );
    const rawWorkAuthorization = normalizeText(
      formData.get("workAuthorization"),
    );
    const yearsExperienceValue = normalizeText(
      formData.get("yearsExperience"),
    );
    const yearsExperience = yearsExperienceValue
      ? Number(yearsExperienceValue)
      : null;
    const education = normalizeEducationEntries(educationResult.value);
    const fieldErrors: Record<string, string> = {};

    if (!isExperienceLevel(rawExperienceLevel)) {
      fieldErrors.experienceLevel = "Choose a valid experience level.";
    }
    if (!isRemotePreference(rawRemotePreference)) {
      fieldErrors.remotePreference = "Choose a valid remote preference.";
    }
    if (!isWorkAuthorization(rawWorkAuthorization)) {
      fieldErrors.workAuthorization = "Choose a valid work authorization.";
    }
    if (
      yearsExperience !== null &&
      (!Number.isInteger(yearsExperience) || yearsExperience < 0)
    ) {
      fieldErrors.yearsExperience =
        "Years of experience must be a whole number of zero or more.";
    }
    if (
      education.some(
        (entry) =>
          entry.graduationYear && !/^\d{4}$/.test(entry.graduationYear),
      )
    ) {
      fieldErrors.education =
        "Every graduation year must contain four digits.";
    }
    if (education.some((entry) => !isEducationDegree(entry.degree))) {
      fieldErrors.education = "Choose a valid degree for every education entry.";
    }

    const linkedinUrl = normalizeText(formData.get("linkedinUrl"));
    const portfolioUrl = normalizeText(formData.get("portfolioUrl"));
    if (!isValidOptionalHttpUrl(linkedinUrl)) {
      fieldErrors.linkedinUrl = "Enter a valid LinkedIn URL.";
    }
    if (!isValidOptionalHttpUrl(portfolioUrl)) {
      fieldErrors.portfolioUrl = "Enter a valid portfolio or GitHub URL.";
    }

    const workExperience = normalizeWorkExperience(
      workExperienceResult.value,
    );
    if (workExperience.length !== workExperienceResult.value.length) {
      fieldErrors.workExperience =
        "Remove empty or malformed work experience roles.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return createErrorState(
        previousState,
        "Review the highlighted profile details and try again.",
        fieldErrors,
      );
    }

    const profile: ProfileFormValues = {
      fullName: normalizeText(formData.get("fullName")),
      email: authData.user.email,
      phone: normalizeText(formData.get("phone")),
      location: normalizeText(formData.get("location")),
      linkedinUrl,
      portfolioUrl,
      workAuthorization: isWorkAuthorization(rawWorkAuthorization)
        ? rawWorkAuthorization
        : "",
      currentTitle: normalizeText(formData.get("currentTitle")),
      experienceLevel: isExperienceLevel(rawExperienceLevel)
        ? rawExperienceLevel
        : "",
      yearsExperience: yearsExperienceValue,
      skills,
      industries,
      workExperience,
      education,
      jobTitlesSeeking: normalizeCommaSeparatedList(
        formData.get("jobTitlesSeeking"),
      ),
      remotePreference: isRemotePreference(rawRemotePreference)
        ? rawRemotePreference
        : "",
      salaryExpectation: normalizeText(
        formData.get("salaryExpectation"),
      ),
      preferredLocations: normalizeCommaSeparatedList(
        formData.get("preferredLocations"),
      ),
      resumePdfKey: null,
    };
    const completion = calculateProfileCompletion(profile);
    const { data: existingProfile, error: existingProfileError } =
      await insforge.database
        .from("profiles")
        .select("is_complete, resume_pdf_key")
        .eq("id", authData.user.id)
        .maybeSingle();

    if (existingProfileError) {
      console.error(
        "[saveProfile] Unable to read the existing profile",
        existingProfileError,
      );
      return createErrorState(
        previousState,
        "We could not verify your current profile. Try again in a moment.",
      );
    }

    const existingIsComplete =
      isRecord(existingProfile) && existingProfile.is_complete === true;
    const existingResumeKey =
      isRecord(existingProfile) &&
      typeof existingProfile.resume_pdf_key === "string"
        ? existingProfile.resume_pdf_key
        : null;
    const resumeEntry = formData.get("resume");
    const resume =
      resumeEntry instanceof File && resumeEntry.size > 0 ? resumeEntry : null;
    let resumePdfKey = existingResumeKey;

    if (resume) {
      const resumeValidationError = await getResumeValidationError(resume);
      if (resumeValidationError) {
        return createErrorState(
          previousState,
          "Select a PDF file before saving your profile.",
          { resume: resumeValidationError },
        );
      }

      resumePdfKey = `${authData.user.id}/resume.pdf`;
      const { error: uploadError } = await insforge.storage
        .from("resumes")
        .upload(resumePdfKey, resume);

      if (uploadError) {
        console.error("[saveProfile] Resume upload failed", uploadError);
        return createErrorState(
          previousState,
          "Your profile was not saved because the resume upload failed. Try again.",
          { resume: "Resume upload failed." },
        );
      }
    }

    profile.resumePdfKey = resumePdfKey;
    const profileRecord: Record<string, unknown> = {
      id: authData.user.id,
      full_name: normalizeOptionalText(profile.fullName),
      email: authData.user.email,
      phone: normalizeOptionalText(profile.phone),
      location: normalizeOptionalText(profile.location),
      current_title: normalizeOptionalText(profile.currentTitle),
      experience_level: normalizeOptionalText(profile.experienceLevel),
      years_experience: yearsExperience,
      skills: profile.skills,
      industries: profile.industries,
      work_experience: profile.workExperience,
      education: profile.education,
      job_titles_seeking: profile.jobTitlesSeeking,
      remote_preference: normalizeOptionalText(profile.remotePreference),
      preferred_locations: profile.preferredLocations,
      salary_expectation: normalizeOptionalText(profile.salaryExpectation),
      linkedin_url: normalizeOptionalText(profile.linkedinUrl),
      portfolio_url: normalizeOptionalText(profile.portfolioUrl),
      work_authorization: normalizeOptionalText(profile.workAuthorization),
      is_complete: completion.isComplete,
      completion_percentage: completion.completionPercentage,
      missing_fields: completion.missingFields,
    };

    if (resumePdfKey) {
      profileRecord.resume_pdf_key = resumePdfKey;
    }

    const { error: saveError } = await insforge.database
      .from("profiles")
      .upsert(profileRecord)
      .select("id")
      .single();

    if (saveError) {
      console.error("[saveProfile] Profile upsert failed", saveError);
      return createErrorState(
        previousState,
        "We could not save your profile. Your changes are still on this page, so you can try again.",
      );
    }

    revalidatePath("/profile");

    if (!existingIsComplete && completion.isComplete) {
      await captureFirstCompletion(authData.user.id);
    }

    return {
      ...completion,
      status: "success",
      message: resume
        ? "Profile and resume saved successfully."
        : "Profile saved successfully.",
      resumeUploaded: Boolean(resumePdfKey),
    };
  } catch (error) {
    console.error("[saveProfile] Unexpected failure", error);
    return createErrorState(
      previousState,
      "Something went wrong while saving your profile. Try again.",
    );
  }
}

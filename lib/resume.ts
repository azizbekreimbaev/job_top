import {
  isCompleteWorkExperience,
  isRecord,
  normalizeText,
} from "./profile.ts";
import type {
  GeneratedResumeContent,
  GeneratedResumeRole,
  ProfileFormValues,
  WorkExperience,
} from "../types/profile.ts";

export const MAX_RESUME_SIZE = 5 * 1024 * 1024;
export const MAX_RESUME_SKILLS = 12;
export const MAX_SUMMARY_WORDS = 65;
export const MAX_ROLE_BULLETS = 3;
export const MAX_BULLET_WORDS = 24;
export const MAX_BULLET_CHARACTERS = 180;

export function hasPdfFileName(fileName: string): boolean {
  return fileName.trim().toLowerCase().endsWith(".pdf");
}

export function hasPdfHeader(header: string): boolean {
  return header.includes("%PDF-");
}

export function countRenderedPdfPages(pdf: Uint8Array): number {
  const source = new TextDecoder("latin1").decode(pdf);
  return source.match(/\/Type\s*\/Page\b/g)?.length ?? 0;
}

export function getCompleteResumeRoles(
  profile: ProfileFormValues,
): WorkExperience[] {
  return profile.workExperience.filter(isCompleteWorkExperience);
}

export function getResumeGenerationEligibility(
  profile: ProfileFormValues,
): { ready: boolean; missingFields: string[] } {
  const checks = [
    { label: "Full Name", complete: Boolean(profile.fullName.trim()) },
    { label: "Email", complete: Boolean(profile.email.trim()) },
    { label: "Current Title", complete: Boolean(profile.currentTitle.trim()) },
    { label: "Skills", complete: profile.skills.length > 0 },
    {
      label: "Complete Work Experience",
      complete: getCompleteResumeRoles(profile).length > 0,
    },
  ];
  const missingFields = checks
    .filter((check) => !check.complete)
    .map((check) => check.label);

  return { ready: missingFields.length === 0, missingFields };
}

function serializeComparableProfile(profile: ProfileFormValues): string {
  return JSON.stringify(profile, (key, value: unknown) =>
    key === "resumePdfKey" ? undefined : value,
  );
}

export function profileMatchesSavedState(
  profile: ProfileFormValues,
  savedProfile: ProfileFormValues,
): boolean {
  return (
    serializeComparableProfile(profile) ===
    serializeComparableProfile(savedProfile)
  );
}

function wordCount(value: string): number {
  return value.split(/\s+/).filter(Boolean).length;
}

function normalizeGeneratedRole(value: unknown): GeneratedResumeRole | null {
  if (
    !isRecord(value) ||
    typeof value.roleIndex !== "number" ||
    !Number.isInteger(value.roleIndex)
  ) {
    return null;
  }
  if (
    !Array.isArray(value.bulletPoints) ||
    value.bulletPoints.length < 1 ||
    value.bulletPoints.length > MAX_ROLE_BULLETS
  ) {
    return null;
  }

  const bulletPoints = value.bulletPoints.map(normalizeText);
  if (
    bulletPoints.some(
      (bullet) =>
        !bullet ||
        bullet.length > MAX_BULLET_CHARACTERS ||
        wordCount(bullet) > MAX_BULLET_WORDS,
    )
  ) {
    return null;
  }

  return { roleIndex: value.roleIndex, bulletPoints };
}

export function normalizeGeneratedResumeContent(
  value: unknown,
  expectedRoleCount: number,
): GeneratedResumeContent | null {
  if (!isRecord(value)) {
    return null;
  }

  const professionalSummary = normalizeText(value.professionalSummary);
  if (
    !professionalSummary ||
    wordCount(professionalSummary) > MAX_SUMMARY_WORDS ||
    !Array.isArray(value.roles) ||
    value.roles.length !== expectedRoleCount
  ) {
    return null;
  }

  const roles = value.roles.map(normalizeGeneratedRole);
  if (roles.some((role) => role === null)) {
    return null;
  }

  const normalizedRoles = roles.filter(
    (role): role is GeneratedResumeRole => role !== null,
  );
  if (
    normalizedRoles.some(
      (role, index) => role.roleIndex !== index,
    )
  ) {
    return null;
  }

  return { professionalSummary, roles: normalizedRoles };
}

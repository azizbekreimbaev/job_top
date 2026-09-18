import {
  isExperienceLevel,
  isRecord,
  isValidOptionalHttpUrl,
  MAX_EDUCATION_ENTRIES,
  MAX_WORK_EXPERIENCE_ROLES,
  normalizeEducationEntries,
  normalizeStringList,
  normalizeText,
  normalizeWorkExperience,
} from "./profile.ts";
import type {
  ExtractedProfileValues,
  ProfileExtractionMode,
  ProfileFormValues,
  WorkExperience,
} from "../types/profile.ts";

const FIELD_LABELS: Record<keyof ExtractedProfileValues, string> = {
  fullName: "Full name",
  phone: "Phone",
  location: "Location",
  linkedinUrl: "LinkedIn",
  portfolioUrl: "Portfolio",
  currentTitle: "Current title",
  experienceLevel: "Experience level",
  yearsExperience: "Years of experience",
  skills: "Skills",
  industries: "Industries",
  workExperience: "Work experience",
  education: "Education",
};

const SCALAR_FIELDS = [
  "fullName",
  "phone",
  "location",
  "linkedinUrl",
  "portfolioUrl",
  "currentTitle",
  "experienceLevel",
  "yearsExperience",
] as const;

const MODEL_FIELDS = [
  ...SCALAR_FIELDS,
  "skills",
  "industries",
  "workExperience",
  "education",
  "warnings",
] as const;

const EDUCATION_DEGREES = new Set([
  "high-school",
  "associate",
  "bachelor",
  "master",
  "doctorate",
]);

export type NormalizedExtraction = {
  data: ExtractedProfileValues;
  populatedFields: string[];
  warnings: string[];
};

export type ExtractionMergeResult = {
  values: ProfileFormValues;
  changedFields: string[];
};

function isNullableString(value: unknown): boolean {
  return value === null || typeof value === "string";
}

function hasValidModelShape(value: Record<string, unknown>): boolean {
  if (MODEL_FIELDS.some((field) => !(field in value))) return false;
  if (
    ![
      "fullName",
      "phone",
      "location",
      "linkedinUrl",
      "portfolioUrl",
      "currentTitle",
      "experienceLevel",
    ].every((field) => isNullableString(value[field]))
  ) {
    return false;
  }
  if (
    value.yearsExperience !== null &&
    typeof value.yearsExperience !== "number"
  ) {
    return false;
  }
  if (
    ![value.skills, value.industries, value.warnings].every(
      (items) =>
        Array.isArray(items) && items.every((item) => typeof item === "string"),
    )
  ) {
    return false;
  }
  if (
    !Array.isArray(value.workExperience) ||
    !value.workExperience.every(
      (role) =>
        isRecord(role) &&
        [
          role.company,
          role.title,
          role.startDate,
          role.endDate,
          role.responsibilities,
        ].every(isNullableString) &&
        (role.currentlyWorking === null ||
          typeof role.currentlyWorking === "boolean"),
    )
  ) {
    return false;
  }
  return (
    Array.isArray(value.education) &&
    value.education.every(
      (entry) =>
        isRecord(entry) &&
      [
        entry.degree,
        entry.fieldOfStudy,
        entry.institution,
        entry.graduationYear,
      ].every(isNullableString),
    )
  );
}

function hasRoleContent(role: WorkExperience): boolean {
  return Boolean(
    role.company ||
      role.title ||
      role.startDate ||
      role.endDate ||
      role.responsibilities,
  );
}

function optionalText(value: unknown): string | undefined {
  const normalized = normalizeText(value);
  return normalized || undefined;
}

function validUrl(value: unknown, label: string, warnings: string[]) {
  const normalized = optionalText(value);
  if (!normalized) {
    return undefined;
  }
  if (!isValidOptionalHttpUrl(normalized)) {
    warnings.push(`${label} was skipped because it is not a valid web address.`);
    return undefined;
  }
  return normalized;
}

function validYears(value: unknown, warnings: string[]): string | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 0 || numericValue > 80) {
    warnings.push("Years of experience was skipped because it was invalid.");
    return undefined;
  }
  return String(numericValue);
}

function validGraduationYear(
  value: unknown,
  warnings: string[],
): string | undefined {
  const normalized = optionalText(value);
  if (!normalized) {
    return undefined;
  }
  const year = Number(normalized);
  if (!/^\d{4}$/.test(normalized) || year < 1900 || year > 2100) {
    warnings.push("Graduation year was skipped because it was invalid.");
    return undefined;
  }
  return normalized;
}

export function normalizeExtractedProfile(
  value: unknown,
): NormalizedExtraction | null {
  if (!isRecord(value) || !hasValidModelShape(value)) {
    return null;
  }

  const warnings = Array.isArray(value.warnings)
    ? normalizeStringList(value.warnings)
    : [];
  const data: ExtractedProfileValues = {};

  for (const field of [
    "fullName",
    "phone",
    "location",
    "currentTitle",
  ] as const) {
    const normalized = optionalText(value[field]);
    if (normalized) {
      data[field] = normalized;
    }
  }

  const linkedinUrl = validUrl(value.linkedinUrl, "LinkedIn URL", warnings);
  if (linkedinUrl) data.linkedinUrl = linkedinUrl;
  const portfolioUrl = validUrl(value.portfolioUrl, "Portfolio URL", warnings);
  if (portfolioUrl) data.portfolioUrl = portfolioUrl;

  const experienceLevel = optionalText(value.experienceLevel);
  if (experienceLevel) {
    if (isExperienceLevel(experienceLevel) && experienceLevel !== "") {
      data.experienceLevel = experienceLevel;
    } else {
      warnings.push("Experience level was skipped because it was invalid.");
    }
  }

  const yearsExperience = validYears(value.yearsExperience, warnings);
  if (yearsExperience) data.yearsExperience = yearsExperience;

  if (Array.isArray(value.skills)) {
    const skills = normalizeStringList(value.skills);
    if (skills.length > 0) data.skills = skills;
  }
  if (Array.isArray(value.industries)) {
    const industries = normalizeStringList(value.industries);
    if (industries.length > 0) data.industries = industries;
  }

  if (Array.isArray(value.workExperience)) {
    const roles = normalizeWorkExperience(value.workExperience).slice(
      0,
      MAX_WORK_EXPERIENCE_ROLES,
    );
    if (roles.length > 0) data.workExperience = roles;
    if (value.workExperience.length > MAX_WORK_EXPERIENCE_ROLES) {
      warnings.push("Only the three most recent work roles were included.");
    }
  }

  if (Array.isArray(value.education)) {
    const education = normalizeEducationEntries(
      value.education.map((entry) => {
        if (!isRecord(entry)) return entry;
        const degree = optionalText(entry.degree);
        if (degree && !EDUCATION_DEGREES.has(degree)) {
          warnings.push("An education degree was skipped because it was invalid.");
        }
        return {
          ...entry,
          degree:
            degree && EDUCATION_DEGREES.has(degree) ? degree : undefined,
          graduationYear: validGraduationYear(
            entry.graduationYear,
            warnings,
          ),
        };
      }),
    );
    if (education.length > 0) data.education = education;
    if (value.education.length > MAX_EDUCATION_ENTRIES) {
      warnings.push("Only the first five education entries were included.");
    }
  }

  return {
    data,
    populatedFields: (Object.keys(data) as Array<keyof ExtractedProfileValues>)
      .map((field) => FIELD_LABELS[field]),
    warnings,
  };
}

export function cloneProfileValues(values: ProfileFormValues): ProfileFormValues {
  return {
    ...values,
    skills: [...values.skills],
    industries: [...values.industries],
    workExperience: values.workExperience.map((role) => ({ ...role })),
    education: values.education.map((entry) => ({ ...entry })),
    jobTitlesSeeking: [...values.jobTitlesSeeking],
    preferredLocations: [...values.preferredLocations],
  };
}

export function mergeProfileExtraction(
  current: ProfileFormValues,
  extracted: ExtractedProfileValues,
  mode: ProfileExtractionMode,
): ExtractionMergeResult {
  const values = cloneProfileValues(current);
  const changedFields = new Set<string>();

  for (const field of SCALAR_FIELDS) {
    const incoming = extracted[field];
    if (!incoming || (mode === "fill-empty" && values[field])) {
      continue;
    }
    if (values[field] !== incoming) {
      (values[field] as string) = incoming;
      changedFields.add(field);
    }
  }

  for (const field of ["skills", "industries"] as const) {
    const incoming = extracted[field];
    if (
      !incoming?.length ||
      (mode === "fill-empty" && values[field].length > 0)
    ) {
      continue;
    }
    if (JSON.stringify(values[field]) !== JSON.stringify(incoming)) {
      values[field] = [...incoming];
      changedFields.add(field);
    }
  }

  if (
    extracted.workExperience?.length &&
    (mode === "replace" || !values.workExperience.some(hasRoleContent))
  ) {
    const incoming = extracted.workExperience
      .slice(0, MAX_WORK_EXPERIENCE_ROLES)
      .map((role) => ({ ...role }));
    if (JSON.stringify(values.workExperience) !== JSON.stringify(incoming)) {
      values.workExperience = incoming;
      changedFields.add("workExperience");
    }
  }

  if (extracted.education?.length) {
    const incoming = extracted.education
      .slice(0, MAX_EDUCATION_ENTRIES)
      .map((entry) => ({ ...entry }));
    const mergedEducation =
      mode === "replace"
        ? incoming
        : incoming.reduce<ProfileFormValues["education"]>(
            (entries, entry, index) => {
              if (!entries[index]) return [...entries, entry];
              entries[index] = Object.fromEntries(
                Object.entries(entries[index]).map(([field, currentValue]) => [
                  field,
                  currentValue || entry[field as keyof typeof entry],
                ]),
              ) as (typeof entries)[number];
              return entries;
            },
            values.education.map((entry) => ({ ...entry })),
          );
    if (JSON.stringify(values.education) !== JSON.stringify(mergedEducation)) {
      values.education = mergedEducation;
      changedFields.add("education");
    }
  }

  return { values, changedFields: [...changedFields] };
}

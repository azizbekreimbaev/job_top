import type {
  Education,
  ExperienceLevel,
  ProfileCompletion,
  ProfileFormValues,
  RemotePreference,
  WorkAuthorization,
  WorkExperience,
} from "@/types/profile";

const EXPERIENCE_LEVELS = new Set<string>([
  "",
  "junior",
  "mid",
  "senior",
  "lead",
]);

const REMOTE_PREFERENCES = new Set<string>([
  "",
  "remote",
  "onsite",
  "hybrid",
  "any",
]);

const WORK_AUTHORIZATIONS = new Set<string>([
  "",
  "citizen",
  "permanent_resident",
  "visa_required",
]);

const EDUCATION_DEGREES = new Set<string>([
  "",
  "high-school",
  "associate",
  "bachelor",
  "master",
  "doctorate",
]);

export const MAX_WORK_EXPERIENCE_ROLES = 3;
export const MAX_EDUCATION_ENTRIES = 5;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeOptionalText(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

export function normalizeStringList(values: readonly unknown[]): string[] {
  const normalized = values
    .map((value) => normalizeText(value))
    .filter((value) => value.length > 0);
  const seen = new Set<string>();

  return normalized.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function normalizeCommaSeparatedList(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return normalizeStringList(value.split(","));
}

export function isExperienceLevel(value: string): value is ExperienceLevel {
  return EXPERIENCE_LEVELS.has(value);
}

export function isRemotePreference(value: string): value is RemotePreference {
  return REMOTE_PREFERENCES.has(value);
}

export function isWorkAuthorization(value: string): value is WorkAuthorization {
  return WORK_AUTHORIZATIONS.has(value);
}

export function isEducationDegree(value: string): boolean {
  return EDUCATION_DEGREES.has(value);
}

export function isValidOptionalHttpUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function createEmptyWorkExperience(): WorkExperience {
  return {
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    responsibilities: "",
  };
}

export function createEmptyEducation(): Education {
  return {
    degree: "",
    fieldOfStudy: "",
    institution: "",
    graduationYear: "",
  };
}

export function isCompleteWorkExperience(role: WorkExperience): boolean {
  return Boolean(
    role.company && role.title && role.startDate && role.responsibilities,
  );
}

export function isCompleteEducation(education: Education): boolean {
  return Boolean(
    education.degree &&
      education.fieldOfStudy &&
      education.institution &&
      education.graduationYear,
  );
}

export function calculateProfileCompletion(
  profile: ProfileFormValues,
): ProfileCompletion {
  const checks = [
    { label: "Full Name", complete: Boolean(profile.fullName) },
    { label: "Email", complete: Boolean(profile.email) },
    { label: "Phone", complete: Boolean(profile.phone) },
    { label: "Location", complete: Boolean(profile.location) },
    { label: "Current Title", complete: Boolean(profile.currentTitle) },
    {
      label: "Experience Level",
      complete: Boolean(profile.experienceLevel),
    },
    { label: "Skills", complete: profile.skills.length > 0 },
    {
      label: "Work Experience",
      complete: profile.workExperience.some(isCompleteWorkExperience),
    },
    {
      label: "Education",
      complete: profile.education.some(isCompleteEducation),
    },
    {
      label: "Job Titles Seeking",
      complete: profile.jobTitlesSeeking.length > 0,
    },
  ];
  const missingFields = checks
    .filter((check) => !check.complete)
    .map((check) => check.label);
  const completionPercentage = (checks.length - missingFields.length) * 10;

  return {
    completionPercentage,
    isComplete: completionPercentage === 100,
    missingFields,
  };
}

export function normalizeWorkExperience(value: unknown): WorkExperience[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, MAX_WORK_EXPERIENCE_ROLES).flatMap((role) => {
    if (!isRecord(role)) {
      return [];
    }

    const normalizedRole: WorkExperience = {
      company: normalizeText(role.company),
      title: normalizeText(role.title),
      startDate: normalizeText(role.startDate),
      endDate: normalizeText(role.endDate),
      currentlyWorking: role.currentlyWorking === true,
      responsibilities: normalizeText(role.responsibilities),
    };

    if (normalizedRole.currentlyWorking) {
      normalizedRole.endDate = "";
    }

    const hasContent = Object.entries(normalizedRole).some(
      ([key, fieldValue]) => key !== "currentlyWorking" && Boolean(fieldValue),
    );

    return hasContent ? [normalizedRole] : [];
  });
}

export function normalizeEducation(value: unknown): Education {
  if (!isRecord(value)) {
    return createEmptyEducation();
  }

  return {
    degree: normalizeText(value.degree),
    fieldOfStudy: normalizeText(value.fieldOfStudy),
    institution: normalizeText(value.institution),
    graduationYear: normalizeText(value.graduationYear),
  };
}

export function normalizeEducationEntries(value: unknown): Education[] {
  const entries = Array.isArray(value)
    ? value
    : isRecord(value)
      ? [value]
      : [];

  return entries.slice(0, MAX_EDUCATION_ENTRIES).flatMap((entry) => {
    const education = normalizeEducation(entry);
    return Object.values(education).some(Boolean) ? [education] : [];
  });
}

export function createProfileFormValues(
  record: unknown,
  fallback: { email: string; fullName: string },
): ProfileFormValues {
  if (!isRecord(record)) {
    return {
      fullName: fallback.fullName,
      email: fallback.email,
      phone: "",
      location: "",
      linkedinUrl: "",
      portfolioUrl: "",
      workAuthorization: "",
      currentTitle: "",
      experienceLevel: "",
      yearsExperience: "",
      skills: [],
      industries: [],
      workExperience: [],
      education: [],
      jobTitlesSeeking: [],
      remotePreference: "",
      salaryExpectation: "",
      preferredLocations: [],
      resumePdfKey: null,
    };
  }

  const experienceLevel = normalizeText(record.experience_level);
  const remotePreference = normalizeText(record.remote_preference);
  const workAuthorization = normalizeText(record.work_authorization);

  return {
    fullName: normalizeText(record.full_name),
    email: fallback.email,
    phone: normalizeText(record.phone),
    location: normalizeText(record.location),
    linkedinUrl: normalizeText(record.linkedin_url),
    portfolioUrl: normalizeText(record.portfolio_url),
    workAuthorization: isWorkAuthorization(workAuthorization)
      ? workAuthorization
      : "",
    currentTitle: normalizeText(record.current_title),
    experienceLevel: isExperienceLevel(experienceLevel) ? experienceLevel : "",
    yearsExperience:
      typeof record.years_experience === "number"
        ? String(record.years_experience)
        : "",
    skills: Array.isArray(record.skills)
      ? normalizeStringList(record.skills)
      : [],
    industries: Array.isArray(record.industries)
      ? normalizeStringList(record.industries)
      : [],
    workExperience: normalizeWorkExperience(record.work_experience),
    education: normalizeEducationEntries(record.education),
    jobTitlesSeeking: Array.isArray(record.job_titles_seeking)
      ? normalizeStringList(record.job_titles_seeking)
      : [],
    remotePreference: isRemotePreference(remotePreference)
      ? remotePreference
      : "",
    salaryExpectation: normalizeText(record.salary_expectation),
    preferredLocations: Array.isArray(record.preferred_locations)
      ? normalizeStringList(record.preferred_locations)
      : [],
    resumePdfKey: normalizeOptionalText(record.resume_pdf_key),
  };
}

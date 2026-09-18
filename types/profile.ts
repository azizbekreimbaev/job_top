export type ExperienceLevel = "" | "junior" | "mid" | "senior" | "lead";

export type RemotePreference = "" | "remote" | "onsite" | "hybrid" | "any";

export type WorkAuthorization =
  | ""
  | "citizen"
  | "permanent_resident"
  | "visa_required";

export type WorkExperience = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
};

export type Education = {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
};

export type ProfileFormValues = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: WorkAuthorization;
  currentTitle: string;
  experienceLevel: ExperienceLevel;
  yearsExperience: string;
  skills: string[];
  industries: string[];
  workExperience: WorkExperience[];
  education: Education[];
  jobTitlesSeeking: string[];
  remotePreference: RemotePreference;
  salaryExpectation: string;
  preferredLocations: string[];
  resumePdfKey: string | null;
};

export type ProfileCompletion = {
  completionPercentage: number;
  isComplete: boolean;
  missingFields: string[];
};

export type ProfileActionState = ProfileCompletion & {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
  resumeUploaded?: boolean;
};

export type ResumeUploadActionState = {
  status: "success" | "error";
  message: string;
};

export type ProfileExtractionMode = "fill-empty" | "replace";

export type ExtractedProfileValues = {
  fullName?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentTitle?: string;
  experienceLevel?: Exclude<ExperienceLevel, "">;
  yearsExperience?: string;
  skills?: string[];
  industries?: string[];
  workExperience?: WorkExperience[];
  education?: Education[];
};

export type ProfileExtractionSuccess = {
  success: true;
  data: ExtractedProfileValues;
  populatedFields: string[];
  warnings: string[];
};

export type ProfileExtractionResponse =
  | ProfileExtractionSuccess
  | {
      success: false;
      error: string;
    };

export type GeneratedResumeRole = {
  roleIndex: number;
  bulletPoints: string[];
};

export type GeneratedResumeContent = {
  professionalSummary: string;
  roles: GeneratedResumeRole[];
};

export type ResumeGenerationResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      missingFields?: string[];
    };

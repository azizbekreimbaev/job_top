import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { PDFParse } from "pdf-parse";
import { getPath as getPdfWorkerPath } from "pdf-parse/worker";

import {
  calculateProfileCompletion,
  createProfileFormValues,
  normalizeEducationEntries,
  normalizeStringList,
  normalizeWorkExperience,
} from "../lib/profile.ts";
import {
  countRenderedPdfPages,
  getResumeGenerationEligibility,
  hasPdfFileName,
  hasPdfHeader,
  normalizeGeneratedResumeContent,
  profileMatchesSavedState,
} from "../lib/resume.ts";
import {
  generateResumeContentWithClient,
  ResumeGenerationOutputError,
} from "../lib/resume-generation.ts";
import {
  cloneProfileValues,
  mergeProfileExtraction,
  normalizeExtractedProfile,
} from "../lib/profile-extraction.ts";

PDFParse.setWorker(pathToFileURL(getPdfWorkerPath()).href);

function createTextPdf(text) {
  const escapedText = text.replace(/([\\()])/g, "\\$1");
  const stream = `BT /F1 12 Tf 72 720 Td (${escapedText}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Uint8Array(Buffer.from(pdf, "latin1"));
}

function createReferenceProfile() {
  return createProfileFormValues(
    {
      full_name: "Faizan Ali",
      phone: null,
      location: null,
      current_title: "Frontend Engineer",
      experience_level: "junior",
      skills: ["React", "TypeScript"],
      work_experience: [
        {
          company: "Vercel",
          title: "Frontend Engineer",
          startDate: "January 2022",
          endDate: "",
          currentlyWorking: true,
          responsibilities: "Built Next.js features.",
        },
      ],
      education: {
        degree: "high-school",
        fieldOfStudy: "Computer Science",
        institution: "",
        graduationYear: "",
      },
      job_titles_seeking: ["Frontend Engineer"],
    },
    { email: "faizan@jsmastery.pro", fullName: "" },
  );
}

test("reference profile computes to 70 percent", () => {
  const completion = calculateProfileCompletion(createReferenceProfile());

  assert.equal(completion.completionPercentage, 70);
  assert.deepEqual(completion.missingFields, ["Phone", "Location", "Education"]);
  assert.equal(completion.isComplete, false);
});

test("complete profile computes to 100 percent", () => {
  const profile = createReferenceProfile();
  profile.phone = "+1 555 000 0000";
  profile.location = "Toronto, Canada";
  profile.education[0].institution = "State University";
  profile.education[0].graduationYear = "2021";

  assert.deepEqual(calculateProfileCompletion(profile), {
    completionPercentage: 100,
    isComplete: true,
    missingFields: [],
  });
});

test("partial work experience and education do not count", () => {
  const profile = createReferenceProfile();
  profile.workExperience[0].responsibilities = "";

  const completion = calculateProfileCompletion(profile);

  assert.equal(completion.completionPercentage, 60);
  assert.ok(completion.missingFields.includes("Work Experience"));
  assert.ok(completion.missingFields.includes("Education"));
});

test("string lists are trimmed, deduplicated, and empty values are removed", () => {
  assert.deepEqual(
    normalizeStringList([" React ", "react", "", "TypeScript"]),
    ["React", "TypeScript"],
  );
});

test("work experience is limited to three roles", () => {
  const roles = Array.from({ length: 4 }, (_, index) => ({
    company: `Company ${index}`,
    title: "Engineer",
    startDate: "2020",
    endDate: "2021",
    currentlyWorking: false,
    responsibilities: "Built products.",
  }));

  assert.equal(normalizeWorkExperience(roles).length, 3);
});

test("education supports legacy objects and is limited to five entries", () => {
  const legacy = normalizeEducationEntries({
    degree: "bachelor",
    fieldOfStudy: "Computer Science",
    institution: "State University",
    graduationYear: "2021",
  });
  assert.equal(legacy.length, 1);
  assert.equal(legacy[0].institution, "State University");

  const entries = Array.from({ length: 6 }, (_, index) => ({
    degree: "bachelor",
    fieldOfStudy: `Field ${index}`,
    institution: `University ${index}`,
    graduationYear: "2021",
  }));
  assert.equal(normalizeEducationEntries(entries).length, 5);
});

test("profile completion accepts any complete education entry", () => {
  const profile = createReferenceProfile();
  profile.phone = "+1 555 000 0000";
  profile.location = "Toronto, Canada";
  profile.education.push({
    degree: "bachelor",
    fieldOfStudy: "Computer Science",
    institution: "State University",
    graduationYear: "2021",
  });

  assert.equal(calculateProfileCompletion(profile).isComplete, true);
});

test("provider name is only used for a new profile", () => {
  const fallback = { email: "user@example.com", fullName: "Provider Name" };

  assert.equal(createProfileFormValues(null, fallback).fullName, "Provider Name");
  assert.equal(
    createProfileFormValues({ full_name: null }, fallback).fullName,
    "",
  );
});

test("resume validation accepts PDF names and rejects other extensions", () => {
  assert.equal(hasPdfFileName("Resume.PDF"), true);
  assert.equal(hasPdfFileName("resume.zip"), false);
  assert.equal(hasPdfFileName("resume.pdf.zip"), false);
});

test("resume validation checks the actual PDF header", () => {
  assert.equal(hasPdfHeader("%PDF-1.7"), true);
  assert.equal(hasPdfHeader("PK zip archive renamed.pdf"), false);
});

test("generated PDF page counting distinguishes page objects from the page tree", () => {
  const pdfSource =
    "%PDF-1.7 /Type /Pages /Count 2 /Type /Page /Type /Page %%EOF";
  assert.equal(
    countRenderedPdfPages(new TextEncoder().encode(pdfSource)),
    2,
  );
});

test("pdf-parse worker extracts text from a real PDF on the server", async () => {
  const parser = new PDFParse({
    data: createTextPdf(
      "Feature 07 resume worker integration extracts this text successfully.",
    ),
  });

  try {
    const result = await parser.getText();
    assert.match(result.text, /resume worker integration/);
  } finally {
    await parser.destroy();
  }
});

test("fill-empty extraction preserves existing values and fills empty fields", () => {
  const profile = createReferenceProfile();
  const before = cloneProfileValues(profile);
  const result = mergeProfileExtraction(
    profile,
    {
      fullName: "Different Name",
      phone: "+1 555 123 4567",
      skills: ["Python"],
      education: [{
        institution: "State University",
        graduationYear: "2021",
        degree: "bachelor",
        fieldOfStudy: "Computer Science",
      }],
    },
    "fill-empty",
  );

  assert.equal(result.values.fullName, before.fullName);
  assert.deepEqual(result.values.skills, before.skills);
  assert.equal(result.values.phone, "+1 555 123 4567");
  assert.equal(result.values.education[0].institution, "State University");
  assert.deepEqual(result.changedFields.sort(), ["education", "phone"]);
});

test("education extraction merges by entry without overwriting saved facts", () => {
  const profile = createReferenceProfile();
  const result = mergeProfileExtraction(
    profile,
    {
      education: [
        {
          degree: "bachelor",
          fieldOfStudy: "Mathematics",
          institution: "State University",
          graduationYear: "2021",
        },
        {
          degree: "master",
          fieldOfStudy: "Computer Science",
          institution: "Technical University",
          graduationYear: "2024",
        },
      ],
    },
    "fill-empty",
  );

  assert.equal(result.values.education[0].degree, "high-school");
  assert.equal(result.values.education[0].institution, "State University");
  assert.equal(result.values.education[1].degree, "master");
  assert.deepEqual(result.changedFields, ["education"]);
});

test("replacement overwrites supported values without erasing missing values", () => {
  const profile = createReferenceProfile();
  const result = mergeProfileExtraction(
    profile,
    { fullName: "Resume Name", skills: ["Go"] },
    "replace",
  );

  assert.equal(result.values.fullName, "Resume Name");
  assert.equal(result.values.currentTitle, profile.currentTitle);
  assert.deepEqual(result.values.skills, ["Go"]);
  assert.equal(result.values.email, profile.email);
  assert.deepEqual(result.values.jobTitlesSeeking, profile.jobTitlesSeeking);
});

test("fill-empty only adds work history when the current roles have no user data", () => {
  const profile = createReferenceProfile();
  const extractedRole = {
    company: "Acme",
    title: "Engineer",
    startDate: "2020",
    endDate: "2022",
    currentlyWorking: false,
    responsibilities: "Built systems.",
  };

  const preserved = mergeProfileExtraction(
    profile,
    { workExperience: [extractedRole] },
    "fill-empty",
  );
  assert.equal(preserved.values.workExperience[0].company, "Vercel");

  profile.workExperience = [
    {
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      responsibilities: "",
    },
  ];
  const populated = mergeProfileExtraction(
    profile,
    { workExperience: [extractedRole] },
    "fill-empty",
  );
  assert.equal(populated.values.workExperience[0].company, "Acme");
});

test("undo snapshots are deep copies of the exact pre-extraction form", () => {
  const profile = createReferenceProfile();
  const snapshot = cloneProfileValues(profile);
  const merged = mergeProfileExtraction(
    profile,
    { phone: "+1 555 123 4567", skills: ["Go"] },
    "replace",
  );

  merged.values.workExperience[0].company = "Changed";
  merged.values.skills.push("Rust");
  assert.equal(snapshot.workExperience[0].company, "Vercel");
  assert.deepEqual(snapshot.skills, ["React", "TypeScript"]);
});

test("model output normalization rejects invalid fields and caps work roles", () => {
  const roles = Array.from({ length: 4 }, (_, index) => ({
    company: `Company ${index}`,
    title: "Engineer",
    startDate: "2020",
    endDate: "2021",
    currentlyWorking: false,
    responsibilities: "Built products.",
  }));
  const result = normalizeExtractedProfile({
    fullName: " Resume Person ",
    phone: null,
    location: null,
    linkedinUrl: "javascript:alert(1)",
    portfolioUrl: null,
    currentTitle: null,
    experienceLevel: "expert",
    yearsExperience: -2,
    skills: [" React ", "react", "TypeScript"],
    industries: [],
    workExperience: roles,
    education: [{
      degree: null,
      fieldOfStudy: null,
      institution: null,
      graduationYear: "twenty twenty",
    }],
    warnings: [],
  });

  assert.ok(result);
  assert.equal(result.data.fullName, "Resume Person");
  assert.equal(result.data.linkedinUrl, undefined);
  assert.equal(result.data.experienceLevel, undefined);
  assert.equal(result.data.yearsExperience, undefined);
  assert.deepEqual(result.data.skills, ["React", "TypeScript"]);
  assert.equal(result.data.workExperience.length, 3);
  assert.ok(result.warnings.length >= 4);
});

test("structurally invalid model output is rejected", () => {
  assert.equal(normalizeExtractedProfile(null), null);
  assert.equal(normalizeExtractedProfile([]), null);
  assert.equal(normalizeExtractedProfile({ warnings: [] }), null);
});

test("resume generation eligibility requires only resume-ready saved fields", () => {
  const profile = createReferenceProfile();

  assert.deepEqual(getResumeGenerationEligibility(profile), {
    ready: true,
    missingFields: [],
  });

  profile.fullName = "";
  profile.email = "";
  profile.currentTitle = "";
  profile.skills = [];
  profile.workExperience[0].responsibilities = "";

  assert.deepEqual(getResumeGenerationEligibility(profile), {
    ready: false,
    missingFields: [
      "Full Name",
      "Email",
      "Current Title",
      "Skills",
      "Complete Work Experience",
    ],
  });
});

test("resume generation saved-state comparison includes nested profile data", () => {
  const saved = createReferenceProfile();
  const current = structuredClone(saved);

  assert.equal(profileMatchesSavedState(current, saved), true);
  current.workExperience[0].responsibilities = "Changed responsibility";
  assert.equal(profileMatchesSavedState(current, saved), false);

  current.workExperience[0].responsibilities =
    saved.workExperience[0].responsibilities;
  current.education[0].institution = "New institution";
  assert.equal(profileMatchesSavedState(current, saved), false);

  current.education[0].institution = saved.education[0].institution;
  current.resumePdfKey = "replacement/resume.pdf";
  assert.equal(profileMatchesSavedState(current, saved), true);
});

test("generated resume normalization enforces role order and content caps", () => {
  const valid = normalizeGeneratedResumeContent(
    {
      professionalSummary: "Frontend engineer building reliable web products.",
      roles: [
        {
          roleIndex: 0,
          bulletPoints: ["Built accessible product interfaces with React."],
        },
      ],
    },
    1,
  );

  assert.ok(valid);
  assert.equal(valid.roles[0].roleIndex, 0);
  assert.equal(
    normalizeGeneratedResumeContent(
      {
        professionalSummary: "Valid summary.",
        roles: [{ roleIndex: 1, bulletPoints: ["Wrong role order."] }],
      },
      1,
    ),
    null,
  );
  assert.equal(
    normalizeGeneratedResumeContent(
      {
        professionalSummary: "word ".repeat(66),
        roles: [{ roleIndex: 0, bulletPoints: ["Valid bullet."] }],
      },
      1,
    ),
    null,
  );
  assert.equal(
    normalizeGeneratedResumeContent(
      {
        professionalSummary: "Valid summary.",
        roles: [
          {
            roleIndex: 0,
            bulletPoints: ["word ".repeat(25)],
          },
        ],
      },
      1,
    ),
    null,
  );
});

test("resume generation uses the locked Responses API contract", async () => {
  const profile = createReferenceProfile();
  let capturedRequest;
  const client = {
    responses: {
      async create(request) {
        capturedRequest = request;
        return {
          output_text: JSON.stringify({
            professionalSummary:
              "Frontend engineer experienced in building Next.js features.",
            roles: [
              {
                roleIndex: 0,
                bulletPoints: ["Built Next.js product features."],
              },
            ],
          }),
        };
      },
    },
  };

  const result = await generateResumeContentWithClient(profile, client);

  assert.equal(capturedRequest.model, "gpt-5.6-luna");
  assert.deepEqual(capturedRequest.reasoning, { effort: "low" });
  assert.equal(capturedRequest.store, false);
  assert.equal(capturedRequest.text.format.type, "json_schema");
  assert.equal(capturedRequest.text.format.strict, true);
  assert.match(capturedRequest.instructions, /untrusted data/);
  assert.doesNotMatch(capturedRequest.input, /jobTitlesSeeking/);
  assert.equal(result.roles[0].bulletPoints[0], "Built Next.js product features.");
});

test("resume generation rejects malformed model output", async () => {
  const client = {
    responses: {
      async create() {
        return { output_text: "not-json" };
      },
    },
  };

  await assert.rejects(
    generateResumeContentWithClient(createReferenceProfile(), client),
    ResumeGenerationOutputError,
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  createAdzunaSearchUrl,
  detectAdzunaCountry,
  formatAdzunaSalary,
  formatRelativeDate,
  mapWithConcurrency,
  normalizeAdzunaJobs,
  normalizeJobMatch,
  normalizeJobType,
  parseFindJobsInput,
  summarizeProcessingStatuses,
} from "../lib/job-discovery.ts";
import {
  createJobMatchingRequest,
  JobMatchingOutputError,
  scoreJobWithClient,
} from "../lib/job-matching.ts";
import {
  createJobsUrl,
  createJobTextFilter,
  getPaginationItems,
  JOBS_PAGE_SIZE,
  parseJobsQuery,
} from "../lib/job-filters.ts";
import { createProfileFormValues } from "../lib/profile.ts";

const adzunaJob = {
  id: "job-1",
  title: "Frontend Engineer",
  company: { display_name: "Example" },
  location: { display_name: "London, UK" },
  description: "Build React interfaces with TypeScript.",
  redirect_url: "https://www.adzuna.example/job-1",
  salary_min: 60000,
  salary_max: 80000,
  salary_is_predicted: "0",
  contract_type: "permanent",
  contract_time: "full_time",
  created: "2026-09-18T00:00:00Z",
  category: { tag: "it-jobs", label: "IT Jobs" },
};

function createProfile() {
  return createProfileFormValues(
    {
      full_name: "Candidate",
      current_title: "Frontend Engineer",
      experience_level: "senior",
      years_experience: 6,
      skills: ["React", "TypeScript"],
      industries: ["SaaS"],
      work_experience: [
        {
          company: "Example",
          title: "Engineer",
          startDate: "2020",
          endDate: "",
          currentlyWorking: true,
          responsibilities: "Built web applications.",
        },
      ],
      job_titles_seeking: ["Frontend Engineer"],
    },
    { email: "candidate@example.com", fullName: "" },
  );
}

test("country detection handles supported countries without treating CA as Canada", () => {
  assert.equal(detectAdzunaCountry("London, UK"), "gb");
  assert.equal(detectAdzunaCountry("Edinburgh, Scotland"), "gb");
  assert.equal(detectAdzunaCountry("Toronto, Canada"), "ca");
  assert.equal(detectAdzunaCountry("Sydney, Australia"), "au");
  assert.equal(detectAdzunaCountry("San Francisco, CA"), "us");
});

test("Adzuna URL uses the IT category and omits an empty location", () => {
  const withoutLocation = new URL(
    createAdzunaSearchUrl("Frontend Engineer", "", "us", {
      appId: "id",
      appKey: "key",
    }),
  );
  assert.equal(withoutLocation.searchParams.get("category"), "it-jobs");
  assert.equal(withoutLocation.searchParams.get("results_per_page"), "10");
  assert.equal(withoutLocation.searchParams.has("where"), false);

  const withLocation = new URL(
    createAdzunaSearchUrl("Engineer", "London", "gb", {
      appId: "id",
      appKey: "key",
    }),
  );
  assert.equal(withLocation.searchParams.get("where"), "London");
  assert.match(withLocation.pathname, /jobs\/gb\/search\/1$/);
});

test("Adzuna responses are validated and capped at ten results", () => {
  assert.equal(normalizeAdzunaJobs({ invalid: [] }), null);
  const normalized = normalizeAdzunaJobs({
    results: Array.from({ length: 12 }, (_, index) => ({
      ...adzunaJob,
      id: `job-${index}`,
    })),
  });
  assert.equal(normalized.length, 10);
});

test("salary and contract fields normalize for database constraints", () => {
  assert.equal(formatAdzunaSalary(adzunaJob, "gb"), "£60k - £80k");
  assert.equal(normalizeJobType(adzunaJob), "fulltime");
  assert.equal(normalizeJobType({ contract_type: "contract" }), "contract");
  assert.equal(normalizeJobType({ contract_time: "part_time" }), "parttime");
});

test("request validation trims inputs and enforces limits", () => {
  assert.deepEqual(
    parseFindJobsInput({ jobTitle: " Frontend Engineer ", location: " Remote " }),
    {
      valid: true,
      input: { jobTitle: "Frontend Engineer", location: "Remote" },
    },
  );
  assert.equal(parseFindJobsInput({ jobTitle: "" }).valid, false);
  assert.equal(parseFindJobsInput({ jobTitle: "x".repeat(101) }).valid, false);
  assert.equal(
    parseFindJobsInput({ jobTitle: "Engineer", location: "x".repeat(121) })
      .valid,
    false,
  );
});

test("match validation restricts matched skills to the saved profile", () => {
  assert.deepEqual(
    normalizeJobMatch(
      {
        matchScore: 88,
        matchReason: "Strong frontend alignment.",
        matchedSkills: ["react", "Rust"],
        missingSkills: ["GraphQL", "graphql"],
      },
      ["React", "TypeScript"],
    ),
    {
      matchScore: 88,
      matchReason: "Strong frontend alignment.",
      matchedSkills: ["React"],
      missingSkills: ["GraphQL"],
    },
  );
});

test("job matching uses the locked Responses API contract", async () => {
  const profile = createProfile();
  let capturedRequest;
  const client = {
    responses: {
      async create(request) {
        capturedRequest = request;
        return {
          output_text: JSON.stringify({
            matchScore: 90,
            matchReason: "The candidate has the core frontend skills.",
            matchedSkills: ["React", "TypeScript"],
            missingSkills: [],
          }),
        };
      },
    },
  };
  const result = await scoreJobWithClient(profile, adzunaJob, client);

  assert.equal(capturedRequest.model, "gpt-5.6-luna");
  assert.deepEqual(capturedRequest.reasoning, { effort: "low" });
  assert.equal(capturedRequest.store, false);
  assert.equal(capturedRequest.text.format.type, "json_schema");
  assert.equal(capturedRequest.text.format.strict, true);
  assert.match(capturedRequest.instructions, /untrusted data/);
  assert.equal(result.matchScore, 90);
});

test("job matching rejects malformed output", async () => {
  const client = {
    responses: { async create() { return { output_text: "not-json" }; } },
  };
  await assert.rejects(
    scoreJobWithClient(createProfile(), adzunaJob, client),
    JobMatchingOutputError,
  );
});

test("bounded mapper never exceeds its concurrency limit", async () => {
  let active = 0;
  let maximum = 0;
  const results = await mapWithConcurrency([1, 2, 3, 4, 5, 6], 3, async (value) => {
    active += 1;
    maximum = Math.max(maximum, active);
    await new Promise((resolve) => setTimeout(resolve, 2));
    active -= 1;
    return value * 2;
  });
  assert.equal(maximum, 3);
  assert.deepEqual(results, [2, 4, 6, 8, 10, 12]);
});

test("processing summary counts saved, duplicate, and partial results", () => {
  assert.deepEqual(
    summarizeProcessingStatuses(
      ["savedStrong", "saved", "duplicate", "failed"],
      2,
    ),
    {
      jobsFound: 2,
      strongMatches: 1,
      skippedJobs: 4,
      failedJobs: 1,
      partial: true,
    },
  );
});

test("relative date formatting covers current, recent, and old jobs", () => {
  const now = new Date("2026-09-19T12:00:00Z");
  assert.equal(formatRelativeDate("2026-09-19T11:30:00Z", now), "Just now");
  assert.equal(formatRelativeDate("2026-09-18T11:00:00Z", now), "Yesterday");
  assert.equal(formatRelativeDate("2026-09-15T12:00:00Z", now), "4 days ago");
});

test("matching request excludes identity and contact fields", () => {
  const request = createJobMatchingRequest(createProfile(), adzunaJob);
  assert.doesNotMatch(String(request.input), /candidate@example.com/);
  assert.doesNotMatch(String(request.input), /fullName/);
});

test("job list query parameters normalize invalid values", () => {
  assert.deepEqual(
    parseJobsQuery({
      q: '  Acme, Inc. (Platform)  ',
      match: "unknown",
      sort: "oldest",
      page: "3",
    }),
    {
      search: "Acme Inc. Platform",
      match: "all",
      sort: "oldest",
      page: 3,
    },
  );
  assert.equal(createJobsUrl({ search: "", match: "all", sort: "score", page: 1 }), "/find-jobs");
});

test("job text filtering searches company and title safely", () => {
  assert.equal(
    createJobTextFilter("100% Engineer"),
    "company.ilike.%100\\% Engineer%,title.ilike.%100\\% Engineer%",
  );
});

test("pagination items remain compact around the active page", () => {
  assert.equal(JOBS_PAGE_SIZE, 10);
  assert.deepEqual(getPaginationItems(1, 3), [1, 2, 3]);
  assert.deepEqual(getPaginationItems(5, 10), [1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
});

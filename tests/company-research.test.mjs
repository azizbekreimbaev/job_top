import assert from "node:assert/strict";
import test from "node:test";

import {
  createCompanyDotComCandidate,
  createDeterministicCompanyResearch,
  extractRenderedResearchPage,
  isSafeResearchUrl,
  normalizeCompanyOrigin,
  parseCompanyResearchInput,
  selectResearchPageLinks,
} from "../lib/company-research.ts";
import { runCompanyResearchWithDependencies } from "../lib/company-research-runner.ts";
import { normalizeCompanyResearch, normalizeJobDetails } from "../lib/job-details.ts";

const job = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  title: "Platform Engineer",
  company: "Acme, Inc.",
  aboutRole: "Build the platform.",
  responsibilities: ["Build APIs"],
  requirements: ["TypeScript"],
  niceToHave: ["PostgreSQL"],
  benefits: ["Remote work"],
  matchedSkills: ["TypeScript"],
  missingSkills: ["PostgreSQL"],
  sourceUrl: "https://www.google.com/search?q=job",
  applyUrl: "https://jobs.acme.com/platform",
};

const profile = {
  fullName: "Candidate",
  email: "candidate@example.com",
  phone: "+1 555 0100",
  location: "Seoul",
  linkedinUrl: "",
  portfolioUrl: "",
  workAuthorization: "citizen",
  currentTitle: "Software Engineer",
  experienceLevel: "senior",
  yearsExperience: "6",
  skills: ["TypeScript"],
  industries: ["SaaS"],
  workExperience: [{ company: "Example", title: "Engineer", startDate: "2020", endDate: "", currentlyWorking: true, responsibilities: "Built APIs." }],
  education: [{ degree: "bachelor", fieldOfStudy: "Computer Science", institution: "Example University", graduationYear: "2020" }],
  jobTitlesSeeking: ["Platform Engineer"],
  remotePreference: "remote",
  salaryExpectation: "",
  preferredLocations: ["Remote"],
  resumePdfKey: null,
};

function dossier(sources = []) {
  return {
    companyOverview: "Acme builds developer infrastructure.",
    techStack: ["TypeScript"],
    culture: ["Engineering-led"],
    whyThisRole: "The role owns core platform systems.",
    yourEdge: ["Relevant TypeScript experience"],
    gapsToAddress: ["Prepare PostgreSQL examples"],
    smartQuestions: ["How is platform reliability measured?"],
    interviewPrep: ["Review system design tradeoffs"],
    sources,
  };
}

test("research request validation accepts only a UUID job id", () => {
  assert.deepEqual(parseCompanyResearchInput({ jobId: ` ${job.id} ` }), { valid: true, jobId: job.id });
  assert.equal(parseCompanyResearchInput({ jobId: "not-an-id" }).valid, false);
  assert.equal(parseCompanyResearchInput(null).valid, false);
});

test("historical dossier normalization is strict, trimmed, and non-crashing", () => {
  assert.equal(normalizeCompanyResearch({ companyOverview: "partial" }), null);
  const normalized = normalizeCompanyResearch({
    ...dossier(["https://acme.com", "javascript:alert(1)"]),
    techStack: [" TypeScript ", "TypeScript"],
  });
  assert.deepEqual(normalized.techStack, ["TypeScript"]);
  assert.deepEqual(normalized.sources, ["https://acme.com"]);

  const normalizedJob = normalizeJobDetails({
    id: job.id,
    title: job.title,
    company: job.company,
    match_score: 80,
    match_reason: "Good fit.",
    source_url: job.sourceUrl,
    external_apply_url: job.applyUrl,
    company_research: { broken: true },
  });
  assert.equal(normalizedJob.companyResearch, null);
});

test("research URL policy rejects credentials, local addresses, metadata, and job providers", () => {
  assert.equal(isSafeResearchUrl("https://acme.com/about"), true);
  assert.equal(isSafeResearchUrl("https://user:pass@acme.com"), false);
  assert.equal(isSafeResearchUrl("http://127.0.0.1/admin"), false);
  assert.equal(isSafeResearchUrl("http://169.254.169.254/latest/meta-data"), false);
  assert.equal(isSafeResearchUrl("https://jobs.lever.co/acme"), false);
  assert.equal(isSafeResearchUrl("file:///etc/passwd"), false);
});

test("company origins remove only recognized recruiting prefixes and produce a normalized fallback", () => {
  assert.equal(normalizeCompanyOrigin("https://careers.acme.com/jobs/1"), "https://acme.com");
  assert.equal(normalizeCompanyOrigin("https://product.acme.com/about"), "https://product.acme.com");
  assert.equal(normalizeCompanyOrigin("https://indeed.com/viewjob"), null);
  assert.equal(createCompanyDotComCandidate("Acme, Inc."), "https://www.acme.com");
});

test("subpage links are same-company, deduplicated, prioritized, and capped at three", () => {
  const selected = selectResearchPageLinks([
    { url: "https://acme.com/careers", kind: "careers" },
    { url: "https://acme.com/product", kind: "product" },
    { url: "https://evil.example/about", kind: "about" },
    { url: "https://acme.com/blog", kind: "blog" },
    { url: "https://acme.com/about", kind: "about" },
    { url: "https://acme.com/about#team", kind: "about" },
  ], "https://acme.com");
  assert.deepEqual(selected.map((link) => link.kind), ["about", "blog", "product"]);
});

test("rendered-page extraction derives useful evidence and classified links without a model", () => {
  const extracted = extractRenderedResearchPage(
    "Acme Developer Platform\nBuild reliable APIs with our cloud infrastructure.\nEngineering teams ship secure products for global customers.\nAbout\nBlog",
    '<a href="/about">About us</a><a href="/engineering">Engineering blog</a><a href="https://evil.example">Other</a>',
    "https://acme.com",
    true,
  );
  assert.equal(extracted.oneLiner, "Acme Developer Platform");
  assert.match(extracted.productSummary, /reliable APIs/);
  assert.deepEqual(extracted.pageLinks.map((link) => link.kind), ["about", "engineering", "other"]);
});

test("deterministic generation creates a complete grounded dossier and replaces sources", () => {
  const result = createDeterministicCompanyResearch(job, profile, [{
    url: "https://acme.com",
    kind: "homepage",
    oneLiner: "Acme builds developer infrastructure.",
    productSummary: "A cloud platform for engineering teams.",
    signals: ["Our remote team uses TypeScript and PostgreSQL to build reliable APIs."],
  }], ["https://acme.com"]);
  assert.match(result.companyOverview, /developer infrastructure/);
  assert.ok(result.techStack.includes("TypeScript"));
  assert.ok(result.techStack.includes("PostgreSQL"));
  assert.deepEqual(result.sources, ["https://acme.com"]);
  assert.ok(result.smartQuestions.length > 0);
});

test("deterministic fallback creates the complete shape without sources", () => {
  const result = createDeterministicCompanyResearch(job, profile, [], []);
  assert.deepEqual(result.sources, []);
  assert.ok(result.companyOverview.length > 0);
  assert.ok(result.interviewPrep.length > 0);
  assert.ok(result.gapsToAddress.length > 0);
});

function runnerDeps(overrides = {}) {
  const state = { navigations: [], persisted: [], captures: [], logs: [], browserClosed: 0 };
  const browser = {
    async navigate(url) { state.navigations.push(url); },
    async extractHomepage() {
      return {
        oneLiner: "Acme builds infrastructure.",
        productSummary: "A developer platform.",
        signals: ["API product"],
        pageLinks: [
          { url: "https://acme.com/about", kind: "about" },
          { url: "https://acme.com/blog", kind: "blog" },
          { url: "https://acme.com/product", kind: "product" },
          { url: "https://acme.com/team", kind: "team" },
        ],
      };
    },
    async extractPage(kind) { return { oneLiner: `${kind} page`, productSummary: "Useful facts", signals: [kind] }; },
    async closeBrowser() { state.browserClosed += 1; },
  };
  const deps = {
    async resolveOrigin() { return "https://acme.com"; },
    async createBrowser() { return browser; },
    async validateNavigation() {},
    async generate(_job, _profile, _evidence, sources) { return dossier([...sources]); },
    async persist(value) { state.persisted.push(value); },
    async log(message, level) { state.logs.push({ message, level }); },
    async capture(value) { state.captures.push(value); },
    ...overrides,
  };
  return { state, browser, deps };
}

test("orchestrator uses one browser, visits at most four pages, persists, captures, and cleans up", async () => {
  const { state, deps } = runnerDeps();
  const result = await runCompanyResearchWithDependencies(job, profile, deps);
  assert.equal(result.provenance, "website");
  assert.equal(state.navigations.length, 4);
  assert.equal(state.persisted.length, 1);
  assert.deepEqual(state.captures, ["website"]);
  assert.equal(state.browserClosed, 1);
});

test("partial page failures keep successful evidence and still clean up", async () => {
  const setup = runnerDeps();
  setup.browser.navigate = async (url) => {
    setup.state.navigations.push(url);
    if (url.endsWith("/blog")) throw new Error("navigation failed");
  };
  const result = await runCompanyResearchWithDependencies(job, profile, setup.deps);
  assert.equal(result.provenance, "website");
  assert.equal(result.dossier.sources.includes("https://acme.com/blog"), false);
  assert.equal(setup.state.browserClosed, 1);
});

test("empty homepage and unavailable browser both produce disclosed fallback dossiers", async () => {
  const empty = runnerDeps();
  empty.browser.extractHomepage = async () => ({ oneLiner: "", productSummary: "", signals: [], pageLinks: [] });
  const emptyResult = await runCompanyResearchWithDependencies(job, profile, empty.deps);
  assert.equal(emptyResult.provenance, "fallback");
  assert.deepEqual(emptyResult.dossier.sources, []);

  const unavailable = runnerDeps({ async createBrowser() { return null; } });
  const unavailableResult = await runCompanyResearchWithDependencies(job, profile, unavailable.deps);
  assert.equal(unavailableResult.provenance, "fallback");
});

test("generation failure preserves old research by skipping persistence and analytics", async () => {
  const setup = runnerDeps({ async generate() { throw new Error("generation failed"); } });
  await assert.rejects(runCompanyResearchWithDependencies(job, profile, setup.deps), /generation failed/);
  assert.equal(setup.state.persisted.length, 0);
  assert.equal(setup.state.captures.length, 0);
  assert.equal(setup.state.browserClosed, 1);
});

test("successful reruns persist a complete replacement each time", async () => {
  const setup = runnerDeps();
  await runCompanyResearchWithDependencies(job, profile, setup.deps);
  await runCompanyResearchWithDependencies(job, profile, setup.deps);
  assert.equal(setup.state.persisted.length, 2);
  assert.deepEqual(setup.state.captures, ["website", "website"]);
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  DASHBOARD_ACTIVITY_LIMIT,
  calculateDashboardStats,
  normalizeDashboardJobs,
  toDashboardActivity,
} from "../lib/dashboard.ts";

const now = new Date("2026-09-19T12:00:00.000Z");

function jobRecord(overrides = {}) {
  return {
    id: "job-1",
    title: "Frontend Engineer",
    company: "Example",
    match_score: 80,
    found_at: "2026-09-18T12:00:00.000Z",
    company_research: null,
    ...overrides,
  };
}

test("normalizeDashboardJobs drops records missing required fields", () => {
  const jobs = normalizeDashboardJobs([
    jobRecord(),
    { id: "job-2", title: "No company" },
    "not-an-object",
  ]);

  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].id, "job-1");
  assert.equal(jobs[0].hasCompanyResearch, false);
});

test("normalizeDashboardJobs maps optional fields and research presence", () => {
  const [job] = normalizeDashboardJobs([
    jobRecord({ match_score: "high", found_at: 5, company_research: { a: 1 } }),
  ]);

  assert.equal(job.matchScore, null);
  assert.equal(job.foundAt, null);
  assert.equal(job.hasCompanyResearch, true);
});

test("normalizeDashboardJobs returns empty array for non-array input", () => {
  assert.deepEqual(normalizeDashboardJobs(null), []);
  assert.deepEqual(normalizeDashboardJobs({}), []);
});

test("calculateDashboardStats aggregates counts and rounds the average", () => {
  const jobs = normalizeDashboardJobs([
    jobRecord({ id: "a", match_score: 90, company_research: { x: 1 } }),
    jobRecord({ id: "b", match_score: 71 }),
    jobRecord({ id: "c", match_score: null, found_at: "2026-08-01T12:00:00.000Z" }),
  ]);

  const stats = calculateDashboardStats(jobs, now);

  assert.equal(stats.totalJobs, 3);
  assert.equal(stats.averageMatchScore, 81);
  assert.equal(stats.companiesResearched, 1);
  assert.equal(stats.jobsThisWeek, 2);
});

test("calculateDashboardStats returns null average when no scores exist", () => {
  const jobs = normalizeDashboardJobs([jobRecord({ match_score: null })]);
  const stats = calculateDashboardStats(jobs, now);

  assert.equal(stats.averageMatchScore, null);
});

test("toDashboardActivity caps entries and formats the found date", () => {
  const jobs = normalizeDashboardJobs(
    Array.from({ length: DASHBOARD_ACTIVITY_LIMIT + 2 }, (_, index) =>
      jobRecord({ id: `job-${index}` }),
    ),
  );

  const activity = toDashboardActivity(jobs, now);

  assert.equal(activity.length, DASHBOARD_ACTIVITY_LIMIT);
  assert.equal(activity[0].dateFound, "Yesterday");
});

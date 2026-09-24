import assert from "node:assert/strict";
import test from "node:test";

import { summarizeDashboardStats } from "../lib/dashboard-stats.ts";

test("dashboard stats aggregate current-user job metrics correctly", () => {
    const jobs = [
        { match_score: 80, company_research: { company: "Acme" }, found_at: "2026-09-18T12:00:00.000Z" },
        { match_score: 90, company_research: null, found_at: "2026-09-20T16:00:00.000Z" },
        { match_score: 70, company_research: { company: "Northwind" }, found_at: "2026-09-22T09:00:00.000Z" },
        { match_score: 85, company_research: { company: "Juno" }, found_at: "2026-09-23T15:30:00.000Z" },
        { match_score: 95, company_research: null, found_at: "2025-09-20T08:00:00.000Z" },
    ];

    assert.deepEqual(summarizeDashboardStats(jobs), {
        totalJobsFound: 5,
        averageMatchRate: 84,
        companiesResearched: 3,
        jobsThisWeek: 4,
    });
});

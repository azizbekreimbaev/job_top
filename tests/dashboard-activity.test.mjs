import assert from "node:assert/strict";
import test from "node:test";

import { summarizeRecentActivities } from "../lib/dashboard-activity.ts";

test("recent activity merges job-search runs and company research entries by recency", () => {
    const now = new Date("2026-09-24T12:00:00.000Z");
    const entries = [
        {
            type: "agent_run",
            text: "Found 8 jobs for Frontend Engineer",
            timestamp: "2026-09-24T11:45:00.000Z",
        },
        {
            type: "company_research",
            text: "Researched Stripe",
            timestamp: "2026-09-24T10:30:00.000Z",
        },
        {
            type: "agent_run",
            text: "Found 12 jobs for React Developer",
            timestamp: "2026-09-24T09:00:00.000Z",
        },
    ];

    assert.deepEqual(summarizeRecentActivities(entries, now), [
        {
            type: "agent_run",
            text: "Found 8 jobs for Frontend Engineer",
            time: "15 mins ago",
            color: "bg-success-alt",
            ring: "bg-success-light",
        },
        {
            type: "company_research",
            text: "Researched Stripe",
            time: "1 hour ago",
            color: "bg-info",
            ring: "bg-info-light",
        },
        {
            type: "agent_run",
            text: "Found 12 jobs for React Developer",
            time: "3 hours ago",
            color: "bg-success-alt",
            ring: "bg-success-light",
        },
    ]);
});

import assert from "node:assert/strict";
import test from "node:test";

import {
    buildMatchScoreDistribution,
    buildRollingDaySeries,
} from "../lib/dashboard-analytics.ts";

test("daily event counts aggregate per day and fill missing days with zero", () => {
    const series = buildRollingDaySeries(
        [
            { timestamp: "2026-09-20T09:00:00.000Z" },
            { timestamp: "2026-09-20T19:00:00.000Z" },
            { timestamp: "2026-09-22T12:00:00.000Z" },
        ],
        3,
        new Date("2026-09-24T12:00:00.000Z"),
    );

    assert.deepEqual(series, [
        { label: "Sep 22", value: 1 },
        { label: "Sep 23", value: 0 },
        { label: "Sep 24", value: 0 },
    ]);
});

test("match score distribution groups events into the approved score bands", () => {
    const distribution = buildMatchScoreDistribution([
        { properties: { matchScore: 55 } },
        { properties: { matchScore: 61 } },
        { properties: { matchScore: 68 } },
        { properties: { matchScore: 72 } },
        { properties: { matchScore: 88 } },
        { properties: { matchScore: 92 } },
        { properties: { matchScore: 100 } },
    ]);

    assert.deepEqual(distribution, [
        { label: "50-60%", value: 1 },
        { label: "60-70%", value: 2 },
        { label: "70-80%", value: 1 },
        { label: "80-90%", value: 1 },
        { label: "90-100%", value: 2 },
    ]);
});

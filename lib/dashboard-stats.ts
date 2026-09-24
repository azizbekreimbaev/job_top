export type DashboardJobRecord = {
    match_score?: number | null;
    company_research?: Record<string, unknown> | null;
    found_at?: string | null;
};

export type DashboardStatsSummary = {
    totalJobsFound: number;
    averageMatchRate: number;
    companiesResearched: number;
    jobsThisWeek: number;
};

function parseFoundAt(value?: string | null) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function calculatePercentChange(current: number, previous: number) {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
}

export function summarizeDashboardStats(
    jobs: DashboardJobRecord[],
): DashboardStatsSummary {
    const totalJobsFound = jobs.length;
    const averageMatchRate = totalJobsFound
        ? Math.round(
            jobs.reduce((sum, job) => sum + Number(job.match_score ?? 0), 0) /
            totalJobsFound,
        )
        : 0;

    const companiesResearched = jobs.filter(
        (job) => !!job.company_research && typeof job.company_research === "object",
    ).length;

    const now = Date.now();
    const currentWeekStart = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const jobsThisWeek = jobs.filter((job) => {
        const foundAt = parseFoundAt(job.found_at);
        return foundAt ? foundAt >= currentWeekStart : false;
    }).length;

    return {
        totalJobsFound,
        averageMatchRate,
        companiesResearched,
        jobsThisWeek,
    };
}

export function getDashboardTrendText(current: number, previous: number) {
    const delta = calculatePercentChange(current, previous);
    return `${delta >= 0 ? "+" : ""}${delta}%`;
}

export type DashboardActivityType = "agent_run" | "agent_run_failed" | "company_research";

export type DashboardActivityEntry = {
    type: DashboardActivityType;
    text: string;
    timestamp: string;
};

export type DashboardActivityViewModel = {
    type: DashboardActivityType;
    text: string;
    time: string;
    color: string;
    ring: string;
};

export type AgentRunActivityInput = {
    status: string | null;
    job_title_searched: string | null;
    jobs_found: number | null;
    started_at: string;
    completed_at: string | null;
};

const ACTIVITY_COLORS: Record<DashboardActivityType, { color: string; ring: string }> = {
    agent_run: { color: "bg-success-alt", ring: "bg-success-light" },
    agent_run_failed: { color: "bg-error", ring: "bg-error/20" },
    company_research: { color: "bg-info", ring: "bg-info-light" },
};

export function toAgentRunActivity(run: AgentRunActivityInput): DashboardActivityEntry {
    const title = run.job_title_searched || "your search";
    const timestamp = run.completed_at ?? run.started_at;

    if (run.status === "failed") {
        return { type: "agent_run_failed", text: `Search for ${title} failed`, timestamp };
    }

    if (run.status === "running") {
        return { type: "agent_run", text: `Searching for ${title}…`, timestamp };
    }

    return { type: "agent_run", text: `Found ${run.jobs_found ?? 0} jobs for ${title}`, timestamp };
}

function formatRelativeTime(date: Date, now: Date) {
    const diffMinutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));

    if (diffMinutes < 60) {
        return `${diffMinutes} mins ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function summarizeRecentActivities(
    entries: DashboardActivityEntry[],
    now = new Date(),
): DashboardActivityViewModel[] {
    return entries
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((entry) => {
            const date = new Date(entry.timestamp);
            const isValidDate = !Number.isNaN(date.getTime());

            return {
                type: entry.type,
                text: entry.text,
                time: isValidDate ? formatRelativeTime(date, now) : "Unknown time",
                ...ACTIVITY_COLORS[entry.type],
            };
        })
        .slice(0, 5);
}

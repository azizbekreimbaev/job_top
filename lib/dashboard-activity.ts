export type DashboardActivityType = "agent_run" | "company_research";

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
                color: entry.type === "company_research" ? "bg-info" : "bg-success-alt",
                ring: entry.type === "company_research" ? "bg-info-light" : "bg-success-light",
            };
        })
        .slice(0, 5);
}

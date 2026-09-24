export type DashboardEventPoint = {
    timestamp: string;
};

export type MatchScoreEvent = {
    properties?: {
        matchScore?: number | null;
    };
};

export type DashboardSeriesPoint = {
    label: string;
    value: number;
};

function toDate(value: string | Date): Date {
    const date = value instanceof Date ? value : new Date(value);
    return date;
}

function formatLabel(date: Date) {
    return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}

export function buildRollingDaySeries(
    events: DashboardEventPoint[],
    days: number,
    now: Date,
): DashboardSeriesPoint[] {
    const reference = new Date(now);
    const points: DashboardSeriesPoint[] = [];

    for (let index = days - 1; index >= 0; index -= 1) {
        const date = new Date(reference);
        date.setHours(0, 0, 0, 0);
        date.setDate(reference.getDate() - index);

        const label = formatLabel(date);
        const value = events.filter((event) => {
            const eventDate = toDate(event.timestamp);
            if (Number.isNaN(eventDate.getTime())) return false;
            return (
                eventDate.getFullYear() === date.getFullYear() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getDate() === date.getDate()
            );
        }).length;

        points.push({ label, value });
    }

    return points;
}

export function buildMatchScoreDistribution(events: MatchScoreEvent[]) {
    const ranges = [
        { label: "50-60%", min: 50, max: 60 },
        { label: "60-70%", min: 60, max: 70 },
        { label: "70-80%", min: 70, max: 80 },
        { label: "80-90%", min: 80, max: 90 },
        { label: "90-100%", min: 90, max: 100 },
    ];

    return ranges.map((range) => ({
        label: range.label,
        value: events.filter((event) => {
            const score = Number(event.properties?.matchScore ?? 0);
            if (range.max === 100) {
                return score >= range.min && score <= range.max;
            }
            return score >= range.min && score < range.max;
        }).length,
    }));
}

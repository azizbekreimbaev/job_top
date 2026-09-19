import type { DashboardStats } from "@/lib/dashboard";

type Props = {
  stats: DashboardStats;
};

export function StatsBar({ stats }: Props) {
  const cards = [
    { label: "Total Jobs Found", value: String(stats.totalJobs) },
    {
      label: "Avg. Match Rate",
      value:
        stats.averageMatchScore === null
          ? "—"
          : `${stats.averageMatchScore}%`,
    },
    { label: "Companies Researched", value: String(stats.companiesResearched) },
    { label: "Jobs This Week", value: String(stats.jobsThisWeek) },
  ];

  return (
    <section
      aria-label="Job search stats"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-text-secondary">
            {card.label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-text-primary">
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
}

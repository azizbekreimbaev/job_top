type DashboardStatsProps = {
  totalJobsFound: number;
  averageMatchRate: number;
  companiesResearched: number;
  jobsThisWeek: number;
  totalJobsTrend?: string;
  averageMatchRateTrend?: string;
};

export function DashboardStats({
  totalJobsFound,
  averageMatchRate,
  companiesResearched,
  jobsThisWeek,
  totalJobsTrend,
  averageMatchRateTrend,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Jobs Found",
      value: totalJobsFound.toString(),
      trend: totalJobsTrend,
      detail: "vs last week",
    },
    {
      label: "Avg. Match Rate",
      value: `${averageMatchRate}%`,
      trend: averageMatchRateTrend,
      detail: "vs last week",
    },
    {
      label: "Companies Researched",
      value: companiesResearched.toString(),
      detail: "Total researched",
    },
    {
      label: "Jobs This Week",
      value: jobsThisWeek.toString(),
      detail: "New this week",
    },
  ];

  return (
    <section aria-label="Job search overview" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold leading-none text-text-primary">{stat.value}</p>
          <div className="mt-4 flex min-h-5 items-center gap-3 text-xs">
            {stat.trend ? (
              <span className="rounded-sm bg-success-lightest px-2 py-0.5 font-medium text-success-darker">
                {stat.trend}
              </span>
            ) : null}
            <span className="text-text-muted">{stat.detail}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

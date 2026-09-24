const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ChartCard({ title, children, summary }: { title: string; children: React.ReactNode; summary: string }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="sr-only">{summary}</p>
      <div className="mt-8 min-h-64">{children}</div>
    </section>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted px-6 text-sm text-text-muted">
      {message}
    </div>
  );
}

function CompanyResearchChart({ values }: { values: Array<number> }) {
  const maxValue = Math.max(...values, 1);
  const plotBottom = 244;
  const plotHeight = 204;

  return (
    <svg aria-hidden="true" viewBox="0 0 700 280" className="h-full min-h-64 w-full overflow-visible">
      {[12, 9, 6, 3, 0].map((tick) => {
        const y = plotBottom - (tick / 12) * plotHeight;
        return (
          <g key={tick}>
            <line x1="48" x2="688" y1={y} y2={y} stroke="var(--color-border)" strokeDasharray="4 4" />
            <text x="38" y={y + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="12">{tick}</text>
          </g>
        );
      })}
      {values.map((value, index) => {
        const height = maxValue === 0 ? 0 : (value / maxValue) * plotHeight;
        const x = 70 + index * 88;
        return (
          <g key={days[index]}>
            <rect x={x} y={plotBottom - height} width="46" height={height} rx="5" fill="var(--color-info)" />
            <text x={x + 23} y="273" textAnchor="middle" fill="var(--color-text-muted)" fontSize="12">{days[index]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function JobsFoundChart({ values }: { values: Array<number> }) {
  const maxValue = Math.max(...values, 1);
  return (
    <svg aria-hidden="true" viewBox="0 0 900 280" className="h-full min-h-64 w-full overflow-visible">
      <defs>
        <linearGradient id="jobs-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[100, 75, 50, 25, 0].map((tick) => {
        const y = 24 + ((100 - tick) / 100) * 210;
        return (
          <g key={tick}>
            <line x1="48" x2="884" y1={y} y2={y} stroke="var(--color-border)" strokeDasharray="4 4" />
            <text x="38" y={y + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="12">{tick}</text>
          </g>
        );
      })}
      <path
        d={values.map((value, index) => {
          const x = 48 + index * (836 / Math.max(values.length - 1, 1));
          const y = 234 - (value / maxValue) * 190;
          return `${index === 0 ? "M" : "L"}${x} ${y}`;
        }).join(" ") + " L884 234 L48 234 Z"}
        fill="url(#jobs-area)"
      />
      <path
        d={values.map((value, index) => {
          const x = 48 + index * (836 / Math.max(values.length - 1, 1));
          const y = 234 - (value / maxValue) * 190;
          return `${index === 0 ? "M" : "L"}${x} ${y}`;
        }).join(" ")}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {days.map((day, index) => (
        <text key={day} x={48 + index * (836 / 6)} y="272" textAnchor={index === 0 ? "start" : index === 6 ? "end" : "middle"} fill="var(--color-text-muted)" fontSize="12">{day}</text>
      ))}
    </svg>
  );
}

function MatchDistributionChart({ values }: { values: Array<number> }) {
  const labels = ["50–60%", "60–70%", "70–80%", "80–90%", "90–100%"];
  const maxValue = Math.max(...values, 1);
  const plotBottom = 234;
  const plotHeight = 210;

  return (
    <svg aria-hidden="true" viewBox="0 0 500 280" className="h-full min-h-64 w-full overflow-visible">
      {[100, 75, 50, 25, 0].map((tick) => {
        const y = plotBottom - (tick / 100) * plotHeight;
        return (
          <g key={tick}>
            <line x1="48" x2="490" y1={y} y2={y} stroke="var(--color-border)" strokeDasharray="4 4" />
            <text x="38" y={y + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="12">{tick}</text>
          </g>
        );
      })}
      {values.map((value, index) => {
        const height = maxValue === 0 ? 0 : (value / maxValue) * plotHeight;
        const x = 67 + index * 85;
        return (
          <g key={labels[index]}>
            <rect x={x} y={plotBottom - height} width="42" height={height} rx="5" fill="var(--color-success)" />
            <text x={x + 21} y="272" textAnchor="middle" fill="var(--color-text-muted)" fontSize="11">{labels[index]}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function CompanyResearchActivity({ values }: { values: Array<number> }) {
  const hasData = values.some((value) => value > 0);

  return (
    <ChartCard title="Company Research Activity" summary="Research activity by day across the last 7 days.">
      {hasData ? <CompanyResearchChart values={values} /> : <EmptyChartState message="No company research activity yet." />}
    </ChartCard>
  );
}

export function JobsFoundOverTime({ values }: { values: Array<number> }) {
  const hasData = values.some((value) => value > 0);

  return (
    <ChartCard title="Jobs Found Over Time" summary="Jobs found by day across the last 30 days.">
      {hasData ? <JobsFoundChart values={values} /> : <EmptyChartState message="No job discovery events yet." />}
    </ChartCard>
  );
}

export function MatchScoreDistribution({ values }: { values: Array<number> }) {
  const hasData = values.some((value) => value > 0);

  return (
    <ChartCard title="Match Score Distribution" summary="Saved jobs grouped by match score range.">
      {hasData ? <MatchDistributionChart values={values} /> : <EmptyChartState message="No match-score events yet." />}
    </ChartCard>
  );
}

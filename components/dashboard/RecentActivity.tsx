type RecentActivityProps = {
  activities: Array<{
    type: "agent_run" | "company_research";
    text: string;
    time: string;
    color: string;
    ring: string;
  }>;
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-6 py-6">
        <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
      </div>
      <ol className="px-6 py-5">
        {activities.map((activity, index) => (
          <li key={`${activity.type}-${activity.text}-${index}`} className="relative flex gap-5 pb-6 last:pb-1">
            {index < activities.length - 1 ? (
              <span aria-hidden="true" className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-border" />
            ) : null}
            <span aria-hidden="true" className={`relative mt-1 grid size-4 shrink-0 place-items-center rounded-full ${activity.ring}`}>
              <span className={`size-2 rounded-full ${activity.color}`} />
            </span>
            <div>
              <p className="text-sm font-medium leading-5 text-text-primary">{activity.text}</p>
              <time className="mt-1 block text-xs leading-4 text-text-muted">{activity.time}</time>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

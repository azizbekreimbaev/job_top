import { formatJobType } from "@/lib/job-details";
import type { JobDetails } from "@/types/jobs";

type Props = {
  job: JobDetails;
};

export function JobInfoCards({ job }: Props) {
  const items = [
    { label: "Salary Est.", value: job.salary ?? "Not listed", color: "text-success", background: "bg-success-lightest", icon: "$" },
    { label: "Location", value: job.location ?? "Not listed", color: "text-info-medium", background: "bg-info-lightest", icon: "pin" },
    { label: "Job Type", value: formatJobType(job.jobType), color: "text-accent", background: "bg-accent-muted", icon: "case" },
    { label: "Date Found", value: job.dateFound, color: "text-text-secondary", background: "bg-surface-secondary", icon: "date" },
  ] as const;

  return (
    <section aria-label="Job information" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${item.background} ${item.color}`}>
            {item.icon === "$" ? <span aria-hidden="true" className="text-xl font-medium">$</span> : null}
            {item.icon === "pin" ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.9"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            ) : null}
            {item.icon === "case" ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8"><rect x="4" y="7" width="16" height="12" rx="2" /><path d="M9 7V5h6v2M9 11v5M15 11v5" /></svg>
            ) : null}
            {item.icon === "date" ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
            ) : null}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary" title={item.value}>{item.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-text-muted">{item.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

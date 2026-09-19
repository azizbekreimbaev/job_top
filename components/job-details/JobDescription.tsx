import Link from "next/link";

type Props = {
  aboutRole: string | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  isComplete: boolean;
  sourceUrl: string;
};

export function JobDescription({ aboutRole, responsibilities, requirements, niceToHave, benefits, isComplete, sourceUrl }: Props) {
  const sections = [
    { title: "Responsibilities", items: responsibilities },
    { title: "Requirements", items: requirements },
    { title: "Nice to have", items: niceToHave },
    { title: "Benefits", items: benefits },
  ];

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-surface-secondary text-text-secondary">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.8"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 12h5M10 16h5" /></svg>
        </span>
        <h2 className="text-lg font-semibold text-text-primary">
          {isComplete ? "Job Description" : "Job Description Preview"}
        </h2>
      </div>
      <div className="mt-5 space-y-6 text-[15px] leading-7 text-text-primary">
        <p className="whitespace-pre-line">{aboutRole ?? "No job description was provided for this listing."}</p>
        {sections.map((section) => section.items.length ? (
          <div key={section.title}>
            <h3 className="font-semibold">{section.title}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ) : null)}
        {!isComplete ? (
          <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-secondary px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-text-secondary">
              Adzuna supplied a preview for this saved job. Open the original listing to read the complete description.
            </p>
            <Link href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              View Full Description
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

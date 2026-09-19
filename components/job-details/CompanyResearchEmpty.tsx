type Props = {
  company: string;
};

export function CompanyResearchEmpty({ company }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-accent-muted text-accent">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.8"><path d="M5 20V7.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V20" /><path d="M14 10.5h3a1 1 0 0 1 1 1V20M3 20h17" /><path d="M8 10h3M8 13.5h3M8 17h3" /></svg>
          </span>
          <h2 className="text-lg font-semibold text-text-primary">Company Research</h2>
        </div>
        <button type="button" aria-disabled="true" title="Company research will be available in the next feature" className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground opacity-90">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="2"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>
          Research Company
        </button>
      </div>
      <div className="grid min-h-64 place-items-center px-6 py-12 text-center sm:min-h-72">
        <div className="max-w-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-surface-secondary text-text-muted">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8"><path d="M5 20V7.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V20" /><path d="M14 10.5h3a1 1 0 0 1 1 1V20M3 20h17" /><path d="M8 10h3M8 13.5h3M8 17h3" /></svg>
          </span>
          <h3 className="mt-5 font-semibold text-text-primary">No research yet</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">Click “Research Company” to let the AI browse {company}&apos;s public pages and build a dossier.</p>
        </div>
      </div>
    </section>
  );
}

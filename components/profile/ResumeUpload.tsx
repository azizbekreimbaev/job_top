export function ResumeUpload() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-text-primary">Resume</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Upload an existing resume to auto-fill the profile, or generate a new
        tailored one from your details below.
      </p>

      <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-muted bg-surface-secondary px-6 py-10 text-center">
        <div className="grid size-14 place-items-center rounded-full border border-border bg-surface shadow-sm">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-7 fill-none stroke-accent"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 11a3.5 3.5 0 0 1-.5 7" />
            <path d="m9 13 3-3 3 3" />
            <path d="M12 10v8" />
          </svg>
        </div>
        <p className="mt-5 text-base font-semibold text-text-primary">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          PDF formatting only. Maximum file size 5MB.
        </p>
        <label className="mt-6 cursor-pointer rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-surface-secondary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
          Select Resume
          <input type="file" accept="application/pdf" className="sr-only" />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4 fill-none stroke-current"
            strokeWidth="1.8"
            strokeLinejoin="round"
          >
            <path d="M7 3h7l4 4v14H7z" />
            <path d="M14 3v5h5" />
            <path d="M10 12h5M10 16h5" />
          </svg>
          Generate Resume from Profile
        </button>
      </div>
    </section>
  );
}

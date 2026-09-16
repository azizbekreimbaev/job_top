import { startOAuth } from "@/actions/auth";

const buttonClassName =
  "flex w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-dark transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      <form action={startOAuth.bind(null, "google")}>
        <button type="submit" className={buttonClassName}>
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-full border border-border text-xs font-semibold text-text-slate"
          >
            G
          </span>
          Continue with Google
        </button>
      </form>

      <form action={startOAuth.bind(null, "github")}>
        <button type="submit" className={buttonClassName}>
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-full bg-overlay text-xs font-semibold text-accent-foreground"
          >
            GH
          </span>
          Continue with GitHub
        </button>
      </form>
    </div>
  );
}

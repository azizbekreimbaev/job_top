import Link from "next/link";

import type { ProfileCompletion } from "@/types/profile";

type Props = {
  completion: ProfileCompletion;
};

export function ProfileProgress({ completion }: Props) {
  if (completion.isComplete) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-error/20 bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          Complete your profile
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-5 text-text-secondary">
          Your profile is {completion.completionPercentage}% complete. Fill the
          missing fields to get better job matches.
        </p>
        {completion.missingFields.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {completion.missingFields.map((field) => (
              <span
                key={field}
                className="rounded-sm bg-error/10 px-2 py-1 text-xs font-medium uppercase text-error"
              >
                {field}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <Link
        href="/profile"
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Complete profile
      </Link>
    </section>
  );
}

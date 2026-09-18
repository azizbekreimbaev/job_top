import { CompletionIndicator } from "@/components/profile/CompletionIndicator";

type ProfileAttentionProps = {
  completionPercentage: number;
  isComplete: boolean;
  missingFields: string[];
};

export function ProfileAttention({
  completionPercentage,
  isComplete,
  missingFields,
}: ProfileAttentionProps) {
  return (
    <section
      className={`flex flex-col gap-6 rounded-2xl border bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7 ${
        isComplete ? "border-success/25" : "border-error/20"
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`size-5 fill-none ${
              isComplete ? "stroke-success" : "stroke-error"
            }`}
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            {isComplete ? (
              <path d="m8 12 2.5 2.5L16 9" />
            ) : (
              <>
                <path d="M12 7v6" />
                <path d="M12 17h.01" />
              </>
            )}
          </svg>
          <h1 className="text-lg font-semibold text-text-primary">
            {isComplete ? "Profile complete" : "Profile needs attention"}
          </h1>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-5 text-text-secondary">
          {isComplete
            ? "Your profile is ready for accurate job matching and professional resume generation."
            : "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes."}
        </p>
        {!isComplete ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {missingFields.map((field) => (
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
      <CompletionIndicator
        isComplete={isComplete}
        percentage={completionPercentage}
      />
    </section>
  );
}

type CompletionIndicatorProps = {
  isComplete: boolean;
  percentage: number;
};

export function CompletionIndicator({
  isComplete,
  percentage,
}: CompletionIndicatorProps) {
  const boundedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="relative grid size-28 shrink-0 place-items-center sm:size-32">
      <svg
        aria-hidden="true"
        viewBox="0 0 80 80"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="40"
          cy="40"
          r="33"
          pathLength="100"
          className={
            isComplete
              ? "fill-none stroke-success/15"
              : "fill-none stroke-error/15"
          }
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r="33"
          pathLength="100"
          className={
            isComplete ? "fill-none stroke-success" : "fill-none stroke-error"
          }
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${boundedPercentage} ${100 - boundedPercentage}`}
        />
      </svg>
      <span className="text-3xl font-semibold text-text-primary">
        {boundedPercentage}%
      </span>
      <span className="sr-only">
        Profile is {boundedPercentage} percent complete
      </span>
    </div>
  );
}

export function CompletionIndicator() {
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
          className="fill-none stroke-error/15"
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r="33"
          pathLength="100"
          className="fill-none stroke-error"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="70 30"
        />
      </svg>
      <span className="text-3xl font-semibold text-text-primary">70%</span>
      <span className="sr-only">Profile is 70 percent complete</span>
    </div>
  );
}

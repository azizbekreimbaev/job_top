export default function ProtectedLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="mx-auto max-w-[1280px] space-y-8 px-5 py-8 sm:px-8 sm:py-10"
    >
      <div className="h-9 w-48 animate-pulse rounded-md bg-surface-secondary" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

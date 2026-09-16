export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  const showSignOutError = error === "sign_out";

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-[-0.04em] text-text-slate">
        Dashboard
      </h1>
      {showSignOutError ? (
        <p
          role="alert"
          className="mt-6 border border-error bg-surface px-4 py-3 text-sm text-text-dark"
        >
          We couldn’t sign you out. Please try again.
        </p>
      ) : null}
    </main>
  );
}

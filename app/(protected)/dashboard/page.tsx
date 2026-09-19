import { redirect } from "next/navigation";

import { ProfileProgress } from "@/components/dashboard/ProfileProgress";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsBar } from "@/components/dashboard/StatsBar";
import {
  calculateDashboardStats,
  normalizeDashboardJobs,
  toDashboardActivity,
} from "@/lib/dashboard";
import { createInsforgeServer, getSessionUser } from "@/lib/insforge-server";
import {
  calculateProfileCompletion,
  createProfileFormValues,
} from "@/lib/profile";

type Props = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const showSignOutError = error === "sign_out";

  const { data: authData, error: authError } = await getSessionUser();

  if (authError || !authData?.user) {
    redirect("/login");
  }

  const userId = authData.user.id;
  const insforge = await createInsforgeServer();
  const [jobsResult, profileResult] = await Promise.all([
    insforge.database
      .from("jobs")
      .select("id, title, company, match_score, found_at, company_research")
      .eq("user_id", userId)
      .order("found_at", { ascending: false }),
    insforge.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  if (jobsResult.error) {
    console.error("[DashboardPage] Jobs lookup failed", jobsResult.error);
  }
  if (profileResult.error) {
    console.error("[DashboardPage] Profile lookup failed", profileResult.error);
  }

  const jobs = normalizeDashboardJobs(jobsResult.data);
  const stats = calculateDashboardStats(jobs);
  const activity = toDashboardActivity(jobs);
  const profileValues = createProfileFormValues(profileResult.data, {
    email: authData.user.email,
    fullName: authData.user.profile?.name ?? "",
  });
  const completion = calculateProfileCompletion(profileValues);

  return (
    <main className="mx-auto max-w-[1280px] space-y-8 px-5 py-8 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-text-slate">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Track your job search, matches, and company research in one place.
        </p>
      </div>
      {showSignOutError ? (
        <p
          role="alert"
          className="border border-error bg-surface px-4 py-3 text-sm text-text-dark"
        >
          We couldn’t sign you out. Please try again.
        </p>
      ) : null}
      <ProfileProgress completion={completion} />
      <StatsBar stats={stats} />
      <RecentActivity items={activity} />
    </main>
  );
}

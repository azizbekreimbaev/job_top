import { redirect } from "next/navigation";

import { CompanyResearchActivity, JobsFoundOverTime, MatchScoreDistribution } from "@/components/dashboard/DashboardCharts";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ProfileIncompleteBanner } from "@/components/dashboard/ProfileIncompleteBanner";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { buildMatchScoreDistribution, buildRollingDaySeries } from "@/lib/dashboard-analytics";
import { summarizeRecentActivities } from "@/lib/dashboard-activity";
import {
  getDashboardTrendText,
  summarizeDashboardStats,
} from "@/lib/dashboard-stats";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  const showSignOutError = error === "sign_out";
  const insforge = await createInsforgeServer();
  const { data: authData, error: authError } = await insforge.auth.getCurrentUser();
  if (authError || !authData?.user) redirect("/login");

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("is_complete")
    .eq("id", authData.user.id)
    .maybeSingle();
  const profileIncomplete = profile?.is_complete !== true;

  const { data: jobsData } = await insforge.database
    .from("jobs")
    .select("match_score, company_research, found_at")
    .eq("user_id", authData.user.id)
    .order("found_at", { ascending: false });

  const { data: agentRunsData } = await insforge.database
    .from("agent_runs")
    .select("id, status, job_title_searched, jobs_found, started_at, completed_at")
    .eq("user_id", authData.user.id)
    .order("started_at", { ascending: false });

  const jobs = jobsData ?? [];
  const dashboardStats = summarizeDashboardStats(jobs);

  const today = new Date();
  const jobsFoundSeries = buildRollingDaySeries(
    jobs.map((job) => ({ timestamp: job.found_at ?? new Date().toISOString() })),
    7,
    today,
  ).map((point) => point.value);
  const researchSeries = buildRollingDaySeries(
    jobs
      .filter((job) => !!job.company_research)
      .map((job) => ({ timestamp: job.found_at ?? new Date().toISOString() })),
    7,
    today,
  ).map((point) => point.value);
  const scoreDistribution = buildMatchScoreDistribution(
    jobs.map((job) => ({ properties: { matchScore: Number(job.match_score ?? 0) } })),
  ).map((point) => point.value);

  const recentActivity = summarizeRecentActivities([
    ...((agentRunsData ?? []).map((run) => ({
      type: "agent_run" as const,
      text: `Found ${run.jobs_found ?? 0} jobs for ${run.job_title_searched || "your search"}`,
      timestamp: run.completed_at ?? run.started_at,
    }))),
    ...((jobs ?? []).filter((job) => job.company_research).map((job) => ({
      type: "company_research" as const,
      text: `Researched ${job.company_research?.company ?? "company"}`,
      timestamp: job.found_at ?? new Date().toISOString(),
    }))),
  ]);
  const now = Date.now();
  const currentWeekStart = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const previousWeekStart = new Date(now - 14 * 24 * 60 * 60 * 1000);
  const previousWeekEnd = currentWeekStart;

  const currentWeekJobs = jobs.filter((job) => {
    const foundAt = job.found_at ? new Date(job.found_at) : null;
    return foundAt && !Number.isNaN(foundAt.getTime())
      ? foundAt >= currentWeekStart
      : false;
  });
  const previousWeekJobs = jobs.filter((job) => {
    const foundAt = job.found_at ? new Date(job.found_at) : null;
    return foundAt && !Number.isNaN(foundAt.getTime())
      ? foundAt >= previousWeekStart && foundAt < previousWeekEnd
      : false;
  });

  const totalJobsTrend = getDashboardTrendText(
    currentWeekJobs.length,
    previousWeekJobs.length,
  );
  const averageMatchRateTrend = getDashboardTrendText(
    currentWeekJobs.length
      ? Math.round(
        currentWeekJobs.reduce((sum, job) => sum + Number(job.match_score ?? 0), 0) /
        currentWeekJobs.length,
      )
      : 0,
    previousWeekJobs.length
      ? Math.round(
        previousWeekJobs.reduce((sum, job) => sum + Number(job.match_score ?? 0), 0) /
        previousWeekJobs.length,
      )
      : 0,
  );

  return (
    <main className="mx-auto max-w-[1440px] space-y-6 px-5 py-8 sm:px-8 sm:py-10">
      {showSignOutError ? (
        <p
          role="alert"
          className="border border-error bg-surface px-4 py-3 text-sm text-text-dark"
        >
          We couldn’t sign you out. Please try again.
        </p>
      ) : null}
      {profileIncomplete ? <ProfileIncompleteBanner /> : null}
      <DashboardStats
        totalJobsFound={dashboardStats.totalJobsFound}
        averageMatchRate={dashboardStats.averageMatchRate}
        companiesResearched={dashboardStats.companiesResearched}
        jobsThisWeek={dashboardStats.jobsThisWeek}
        totalJobsTrend={totalJobsTrend}
        averageMatchRateTrend={averageMatchRateTrend}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity activities={recentActivity} />
        <CompanyResearchActivity values={researchSeries} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <JobsFoundOverTime values={jobsFoundSeries} />
        <MatchScoreDistribution values={scoreDistribution} />
      </div>
    </main>
  );
}

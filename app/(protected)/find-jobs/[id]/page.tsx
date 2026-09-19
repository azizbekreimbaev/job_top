import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CompanyResearchEmpty } from "@/components/job-details/CompanyResearchEmpty";
import { JobDescription } from "@/components/job-details/JobDescription";
import { JobDetailsHeader } from "@/components/job-details/JobDetailsHeader";
import { JobInfoCards } from "@/components/job-details/JobInfoCards";
import { MatchReasoning } from "@/components/job-details/MatchReasoning";
import { SkillsComparison } from "@/components/job-details/SkillsComparison";
import { isJobId, normalizeJobDetails } from "@/lib/job-details";
import { createInsforgeServer } from "@/lib/insforge-server";

const JOB_DETAILS_COLUMNS = "id, source, external_job_id, title, company, location, salary, job_type, about_role, responsibilities, requirements, nice_to_have, benefits, match_score, match_reason, matched_skills, missing_skills, source_url, external_apply_url, found_at";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailsPage(props: Props) {
  const { id } = await props.params;
  if (!isJobId(id)) notFound();

  const insforge = await createInsforgeServer();
  const { data: authData, error: authError } = await insforge.auth.getCurrentUser();

  if (authError || !authData?.user) redirect("/login");

  const { data, error } = await insforge.database
    .from("jobs")
    .select(JOB_DETAILS_COLUMNS)
    .eq("id", id)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (error) {
    console.error("[JobDetailsPage] Job lookup failed", error);
    throw new Error("Unable to load this job.");
  }

  const job = normalizeJobDetails(data);
  if (!job) notFound();

  return (
    <main className="mx-auto w-full max-w-[1024px] px-5 py-8 sm:px-8 sm:py-10">
      <Link href="/find-jobs" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <span aria-hidden="true">‹</span>
        Back to Jobs
      </Link>

      <div className="mt-8 space-y-6">
        <JobDetailsHeader job={job} />
        <JobInfoCards job={job} />
        <MatchReasoning reason={job.matchReason} />
        <SkillsComparison matchedSkills={job.matchedSkills} missingSkills={job.missingSkills} />
        <JobDescription aboutRole={job.aboutRole} responsibilities={job.responsibilities} requirements={job.requirements} niceToHave={job.niceToHave} benefits={job.benefits} isComplete={job.descriptionIsComplete} sourceUrl={job.sourceUrl} />
        <CompanyResearchEmpty company={job.company} />
        <Link href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          Apply Now at {job.company}
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </div>
    </main>
  );
}

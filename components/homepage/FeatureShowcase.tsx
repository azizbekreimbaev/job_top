import Image from "next/image";

import { FeatureList } from "@/components/homepage/FeatureList";

const searchFeatures = [
  {
    title: "Find jobs that actually fit",
    body: "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    body: "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    body: "Keep a clear view of every job you’ve found and researched. Your activity and progress all stay in one simple place.",
  },
];

const confidenceFeatures = [
  {
    title: "Understand your match score",
    body: "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what’s missing.",
  },
  {
    title: "AI-Powered Job Matching",
    body: "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
  },
  {
    title: "Focus on the right roles",
    body: "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export function FeatureShowcase() {
  return (
    <section className="px-4 sm:px-8">
      <div className="marketing-grid mx-auto h-20 max-w-[1280px] border-x border-border" aria-hidden="true" />

      <div className="mx-auto grid max-w-[1280px] border border-border lg:grid-cols-2">
        <div className="bg-surface">
          <h2 className="px-6 py-12 text-3xl leading-tight font-semibold tracking-[-0.035em] text-text-slate sm:px-10 sm:text-5xl lg:py-16">
            Manage Your Job
            <br />
            Search With Ease
          </h2>
          <FeatureList items={searchFeatures} accentItem={0} />
        </div>
        <div className="flex items-center border-t border-border bg-background p-6 sm:p-10 lg:border-t-0 lg:border-l">
          <Image
            src="/images/jobs-lists.png"
            alt="JobPilot job matches with match scores, salary estimates, and sources"
            width={2364}
            height={1778}
            sizes="(max-width: 1024px) 100vw, 640px"
            className="h-auto w-full"
          />
        </div>
      </div>

      <div className="marketing-grid mx-auto h-20 max-w-[1280px] border-x border-border" aria-hidden="true" />

      <div className="mx-auto grid max-w-[1280px] border border-border lg:grid-cols-2">
        <div className="flex items-center bg-background p-6 sm:p-10">
          <Image
            src="/images/agnet-log.png"
            alt="JobPilot agent log finding roles and preparing application materials"
            width={2144}
            height={1656}
            sizes="(max-width: 1024px) 100vw, 640px"
            className="h-auto w-full"
          />
        </div>
        <div className="border-t border-border bg-surface lg:border-t-0 lg:border-l">
          <h2 className="px-6 py-12 text-3xl leading-tight font-semibold tracking-[-0.035em] text-text-slate sm:px-10 sm:text-5xl lg:py-16">
            Apply With More
            <br />
            Confidence, Every Time
          </h2>
          <FeatureList items={confidenceFeatures} accentItem={1} />
        </div>
      </div>
    </section>
  );
}

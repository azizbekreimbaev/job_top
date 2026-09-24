"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CompanyResearch, CompanyResearchResponse } from "@/types/jobs";

type Props = {
  jobId: string;
  company: string;
  research: CompanyResearch | null;
};

const LIST_SECTIONS: Array<{ key: keyof CompanyResearch; label: string }> = [
  { key: "techStack", label: "Technology signals" },
  { key: "culture", label: "Culture" },
  { key: "yourEdge", label: "Your edge" },
  { key: "gapsToAddress", label: "Gaps to address" },
  { key: "smartQuestions", label: "Smart questions" },
  { key: "interviewPrep", label: "Interview prep" },
];

export function CompanyResearchCard({ jobId, company, research }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string; profileRequired?: boolean } | null>(null);

  async function runResearch() {
    if (pending) return;
    setPending(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const payload = await response.json() as CompanyResearchResponse;
      if (!response.ok || !payload.success) {
        setFeedback({
          type: "error",
          message: payload.success ? "Company research could not be completed." : payload.error,
          profileRequired: payload.success ? false : payload.profileRequired,
        });
        return;
      }
      setFeedback({ type: "success", message: payload.data.message });
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Company research could not be completed. Please try again." });
    } finally {
      setPending(false);
    }
  }

  const fallback = research !== null && research.sources.length === 0;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-accent-muted text-accent">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.8"><path d="M5 20V7.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V20" /><path d="M14 10.5h3a1 1 0 0 1 1 1V20M3 20h17" /><path d="M8 10h3M8 13.5h3M8 17h3" /></svg>
          </span>
          <h2 className="text-lg font-semibold text-text-primary">Company Research</h2>
        </div>
        <button
          type="button"
          onClick={runResearch}
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-4 fill-none stroke-current ${pending ? "animate-spin" : ""}`} strokeWidth="2"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>
          {pending ? "Researching…" : research ? "Research Again" : "Research Company"}
        </button>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {pending && <p className="border-b border-border bg-accent-muted px-6 py-3 text-sm text-accent sm:px-8">Researching {company}. This can take up to two minutes.</p>}
        {feedback && (
          <div role={feedback.type === "error" ? "alert" : "status"} className={`border-b px-6 py-3 text-sm sm:px-8 ${feedback.type === "error" ? "border-error bg-surface text-error" : "border-success-light bg-success-lightest text-success-dark"}`}>
            {feedback.message}
            {feedback.profileRequired && <>{" "}<Link href="/profile" className="font-semibold underline underline-offset-2">Complete your profile</Link>.</>}
          </div>
        )}
      </div>

      {!research ? (
        <div className="grid min-h-64 place-items-center px-6 py-12 text-center sm:min-h-72">
          <div className="max-w-sm">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-surface-secondary text-text-muted">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8"><path d="M5 20V7.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V20" /><path d="M14 10.5h3a1 1 0 0 1 1 1V20M3 20h17" /><path d="M8 10h3M8 13.5h3M8 17h3" /></svg>
            </span>
            <h3 className="mt-5 font-semibold text-text-primary">No research yet</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">Research {company}&apos;s public pages and turn the findings into interview preparation tailored to your profile.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 px-6 py-7 sm:px-8">
          {fallback && (
            <p className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-text-secondary">
              Based on the job posting and your profile because company-site research was unavailable.
            </p>
          )}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Company overview</h3>
            <p className="mt-3 leading-7 text-text-primary">{research.companyOverview}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Why this role</h3>
            <p className="mt-3 leading-7 text-text-primary">{research.whyThisRole}</p>
          </div>
          <div className="grid gap-7 md:grid-cols-2">
            {LIST_SECTIONS.map(({ key, label }) => {
              const items = research[key] as string[];
              return (
                <section key={key}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">{label}</h3>
                  {items.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-text-primary">
                      {items.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />{item}</li>)}
                    </ul>
                  ) : <p className="mt-3 text-sm text-text-muted">No supported signals were found.</p>}
                </section>
              );
            })}
          </div>
          {!fallback && (
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Sources</h3>
              <ul className="mt-3 space-y-2">
                {research.sources.map((source) => (
                  <li key={source}>
                    <a href={source} target="_blank" rel="noopener noreferrer" className="break-all text-sm font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                      {new URL(source).hostname}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

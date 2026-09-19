"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { FindJobsResponse } from "@/types/jobs";

type SearchState =
  | { status: "idle"; message: ""; profileRequired: false }
  | { status: "success" | "error"; message: string; profileRequired: boolean };

const initialState: SearchState = {
  status: "idle",
  message: "",
  profileRequired: false,
};

export function SearchControls() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<SearchState>(initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    const jobTitle = String(formData.get("jobTitle") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    setIsPending(true);
    setState(initialState);

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, location }),
      });
      const result: FindJobsResponse = await response.json();
      if (!result.success) {
        setState({
          status: "error",
          message: result.error,
          profileRequired: result.profileRequired === true,
        });
        return;
      }

      setState({
        status: "success",
        message: result.data.message,
        profileRequired: false,
      });
      router.refresh();
    } catch (error) {
      console.error("[SearchControls] Job search request failed", error);
      setState({
        status: "error",
        message: "We could not start the search. Check your connection and try again.",
        profileRequired: false,
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section aria-label="Search for jobs" className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end lg:gap-5">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-text-dark">
          Job title
          <span className="flex h-12 items-center gap-3 rounded-md border border-border bg-surface px-4 text-text-muted shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
            <input type="search" name="jobTitle" required maxLength={100} disabled={isPending} placeholder="Frontend Engineer" className="min-w-0 flex-1 bg-transparent text-sm font-normal text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed" />
          </span>
        </label>
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-text-dark">
          Location
          <input type="search" name="location" maxLength={120} disabled={isPending} placeholder="Remote, New York..." className="h-12 rounded-md border border-border bg-surface px-4 text-sm font-normal normal-case text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary" />
        </label>
        <button type="submit" disabled={isPending} className="flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
          {isPending ? "Finding Jobs..." : "Find Jobs"}
        </button>
      </form>
      {state.status !== "idle" ? (
        <div role={state.status === "error" ? "alert" : "status"} className={`mt-5 flex min-h-12 items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium ${state.status === "success" ? "border-success-light bg-success-lightest text-success-dark" : "border-error bg-surface text-error"}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 13.4 7.6 18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" /><path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" /><path d="M5 14.5v6M2 17.5h6" /></svg>
          <span>{state.message} {state.profileRequired ? <Link href="/profile" className="font-semibold underline underline-offset-2">Complete profile</Link> : null}</span>
        </div>
      ) : null}
    </section>
  );
}

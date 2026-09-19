"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import type { JobsQuery } from "@/types/jobs";

type Props = {
  filters: JobsQuery;
};

export function JobFilters({ filters }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);
  const [isPending, startTransition] = useTransition();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    [],
  );

  function navigate(updates: Record<string, string>): void {
    const params = new URLSearchParams(window.location.search);
    for (const [name, value] of Object.entries(updates)) {
      if (value) params.set(name, value);
      else params.delete(name);
    }
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function updateSearch(value: string): void {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => navigate({ q: value.trim() }), 350);
  }

  return (
    <section aria-label="Filter and sort jobs" aria-busy={isPending} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm sm:flex-row sm:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-3 px-2 text-text-muted">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
        <span className="sr-only">Filter by company or role</span>
        <input type="search" value={search} onChange={(event) => updateSearch(event.target.value)} maxLength={100} placeholder="Filter by company or role..." className="h-10 min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted" />
      </label>
      <div className="hidden h-10 w-px bg-border sm:block" />
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <label><span className="sr-only">Match filter</span><select value={filters.match} onChange={(event) => navigate({ match: event.target.value === "all" ? "" : event.target.value })} className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-secondary shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:w-auto"><option value="all">All Matches</option><option value="high">High Match</option><option value="low">Low Match</option></select></label>
        <label><span className="sr-only">Sort jobs</span><select value={filters.sort} onChange={(event) => navigate({ sort: event.target.value === "score" ? "" : event.target.value })} className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-secondary shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:w-auto"><option value="score">Match Score</option><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label>
      </div>
    </section>
  );
}

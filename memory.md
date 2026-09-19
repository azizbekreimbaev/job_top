# Memory — Features 01–11 Complete

Last updated: 2026-09-19 +09:00

## What was built

- Completed Features 01–11 across Foundation, Profile, and Find Jobs. Phase 4 Feature 12 is next.
- Feature 10 now runs authenticated Adzuna discovery through `POST /api/agent/find`, requires a complete saved profile, detects the supported country endpoint, excludes duplicate provider IDs, scores listings with `gpt-5.6-luna`, persists valid jobs, records agent runs/logs, and emits the approved PostHog events.
- Added the server-only discovery and matching modules in `agent/`, Adzuna/query helpers in `lib/`, shared job types, route handler, migration, environment documentation, and automated discovery tests.
- Feature 11 now provides URL-backed company/role filtering, high/low match ranges, score/newest/oldest sorting, exact InsForge counts, deterministic ordering, and server-side pagination.
- Pagination is intentionally 10 jobs per page. The current 20 saved jobs therefore produce two pages.
- Fixed profile persistence so all preference controls update canonical form state and successful saves adopt the row returned by InsForge as the saved baseline.
- Added Next.js `data-scroll-behavior="smooth"` metadata and clearer zero-result/duplicate-result discovery messages.
- Updated project context and the UI registry for Features 10–11 and the current patterns.

## Decisions made

- Found-job counts represent newly inserted jobs; strong matches use the shared threshold of 70.
- Repeated Adzuna listings are skipped rather than rescored or duplicated.
- Search, match filter, sort, and page state live in URL parameters and are applied server-side to the complete user-owned dataset.
- Filter changes reset pagination to page one; malformed URL parameters fall back safely.
- Job list reads select only rendered columns, use exact counts, and use bounded `.range()` pagination.
- Adzuna discovery currently supports only the `us`, `gb`, `ca`, and `au` country endpoints. Other locations fall back to the US endpoint under the approved Feature 10 behavior.
- Find Jobs visuals continue to follow the supplied reference and established Tailwind v4 design tokens.

## Problems solved

- Applied the live InsForge migration adding nullable `jobs.external_job_id` and verified the partial unique index on `(user_id, source, external_job_id)`.
- Resolved the `42703 column jobs.external_job_id does not exist` discovery failure.
- Linked the repository to its existing InsForge project for official CLI diagnostics; local link metadata is ignored and no credentials are stored here.
- Confirmed that Korean searches returning zero results are not a pagination/filter defect: Adzuna search is country-endpoint scoped and the current integration has no Korean market endpoint.
- Verified live InsForge filter/sort/count/range behavior and confirmed all 20 saved rows are valid display records.
- Changed pagination from 20 to 10 rows per page at the developer’s request.

## Current state

- Features 01 Homepage through 11 Filter + Sort + Pagination are complete.
- `/profile` saves and reloads the full profile correctly.
- `/find-jobs` discovers, scores, deduplicates, saves, filters, sorts, and paginates real jobs.
- The live database contains the required Feature 10 column and uniqueness index.
- ESLint, strict TypeScript, 39 Node tests, `git diff --check`, live read-only InsForge query verification, and the Next.js production build pass.
- Changes remain uncommitted in the working tree alongside existing project work.
- No known blockers remain for Features 10–11.

## Next session starts with

Run `/remember restore`, confirm this state, then use `/architect` for Feature 12: Job Details Page — Full UI.

Feature 12 should use the persisted `jobs` record to build `/find-jobs/[id]`, enforce current-user ownership, include the back link, job header, source link, salary/location/type/date cards, AI match reasoning, matched/missing skill badges, job description, and the empty company-research state described in `context/build-plan.md`.

## Open questions

- Korean job discovery requires a provider that covers South Korea or a separate Adzuna market/data agreement; the current public integration cannot reliably return Korean-local listings.
- The production application domain remains unspecified; explicitly allowlist its `/callback` URL before launch.
- A browser-backed authenticated visual pass remains desirable when a browser surface is available.

# Memory — Features 13–14 Company Research and Dashboard

Last updated: 2026-09-24 14:24 +09:00

## What was built

- Completed Feature 13 Company Research on owned job-detail pages, including the authenticated research API, safe Browserbase browsing, deterministic no-credit dossier generation, persistence, reruns, fallback disclosure, analytics, normalization, migration, tests, and documentation.
- Completed Feature 14 Dashboard UI in `app/(protected)/dashboard/page.tsx` and `components/dashboard/*.tsx` to match `context/designs/dashboard.png`.
- Added four mock stat cards, a five-entry recent-activity timeline, Company Research Activity bars, a filled Jobs Found Over Time chart, and Match Score Distribution bars.
- Added a profile-completion lookup and compact incomplete-profile CTA banner above the dashboard content.
- Added responsive layouts, accessible chart summaries, token-based SVG colors, progress tracking, and a Dashboard Cards and Charts entry in `context/ui-registry.md`.

## Decisions made

- Feature 14 remains mock-data UI except for the profile-completion banner. Features 15–17 will replace stats, activity, and chart datasets with real InsForge and PostHog data.
- Dashboard charts are dependency-free inline SVGs rather than a charting library. They use CSS design tokens, dashed token gridlines, muted axes, and hidden text summaries for assistive technology.
- The dashboard uses the authenticated 1440px application canvas, white bordered cards, `rounded-xl`, `shadow-sm`, 24px card padding, and responsive one/two/four-column arrangements.
- The supplied dashboard image controls Feature 14’s visible content: the fourth card is “Jobs This Week,” and the upper chart is “Company Research Activity.”
- Feature 13 remains model-free: Browserbase website evidence is optional, and missing browser access immediately produces the complete job/profile fallback without OpenAI credits.

## Problems solved

- Feature 13 no longer fails on exhausted OpenAI credits, unsafe provider URLs, or Stagehand’s Turbopack bundling behavior.
- Browserbase is externalized for Next.js and cleaned up on every exit path; unconfigured Browserbase skips URL probing and falls back immediately.
- Feature 14 reproduces the dashboard charts without introducing another dependency or hardcoded component colors.
- Dashboard layouts collapse cleanly on smaller screens while preserving the desktop hierarchy from the reference.

## Current state

- Features 01 through 14 are implemented. Feature 15, Stats Bar — Real Data, is next.
- The dashboard displays the approved mock values and visualizations. Only the incomplete-profile banner reads current user data.
- Feature 13 and Feature 14 changes remain uncommitted in the shared working tree; preserve unrelated changes.
- ESLint, strict TypeScript, all 58 Node tests, `git diff --check`, raw-color scanning for the new dashboard files, and the Next.js 16.3.5 production build pass.
- Node’s typeless-module warnings remain non-failing, and the Feature 13 partial-failure test intentionally logs its mocked navigation error.
- Browser-based visual comparison was unavailable because no browser surface was connected.

## Next session starts with

Run `/remember restore`, confirm this state, and visually inspect `/dashboard` in an authenticated browser against `context/designs/dashboard.png` at desktop and mobile widths.

Then implement Feature 15 by replacing the four mock stat values with current-user-scoped InsForge aggregates while preserving the exact Feature 14 card layout.

## Open questions

- Confirm final dashboard spacing and SVG rendering in a connected authenticated browser, because automated visual QA was unavailable.
- Confirm whether the configured Browserbase account has session allowance for website-grounded Feature 13 research; fallback behavior does not depend on it.
- The production application domain remains unspecified; explicitly allowlist its `/callback` URL before launch.

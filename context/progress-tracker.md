# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 04 Database Schema
**Next:** 05 Profile Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- Homepage follows the supplied desktop reference with responsive stacking below desktop widths.
- Marketing CTAs link to `/login`; product navigation uses the documented application routes.
- Supplied assets in `public/` are used for the logo, dashboard preview, jobs list, agent log, and testimonial avatar.
- Marketing UI remains server-rendered with no client-side JavaScript.
- Auth uses `@insforge/sdk` SSR helpers so OAuth starts and completes on the server, keeping the PKCE verifier and refresh token in httpOnly cookies.
- Next.js 16 `proxy.ts` refreshes InsForge sessions and redirects unauthenticated application routes before render; the protected layout performs a second authoritative user check.
- `/dashboard`, `/profile`, and `/find-jobs` are intentionally minimal heading-only placeholders until their planned UI phases.
- PostHog initializes before hydration through Next.js 16 client instrumentation, identifies authenticated users by their stable InsForge user ID, and resets browser identity when the protected application shell unmounts after sign-out.
- PostHog configuration uses the current `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` name while retaining `NEXT_PUBLIC_POSTHOG_KEY` as a temporary compatibility fallback.
- Only the four approved business events in `code-standards.md` may be captured; authentication and marketing interactions do not introduce additional custom event names.
- JobPilot logo links consistently return users to the public homepage, including from the authenticated application header.
- Database ownership is enforced with RLS through `auth.uid()` on profiles, runs, jobs, logs, and private resume objects; composite foreign keys also prevent cross-user run/job relationships.
- Profiles are created on first profile save. Resume storage keeps one private `{user_id}/resume.pdf` object and persists its key, while signed URLs are generated only when needed.
- Resume-tailoring fields were omitted because resume tailoring is outside the current product scope.

---

## Notes

- Local auth configuration lives in ignored `.env.local`; `.env.example` documents the required backend URL, anon key, and application URL.
- Google and GitHub are enabled on the connected InsForge backend. InsForge permits all redirect URLs while the allowed list is empty, which supports local development. Before production launch, explicitly allowlist the deployed `/callback` URL.

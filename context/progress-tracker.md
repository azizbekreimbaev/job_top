# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 08 Resume PDF Generation from Profile
**Next:** 09 Find Jobs Page â€” Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

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
- Profiles are created on the first explicit profile mutation (profile save or resume upload). Resume storage keeps one private `{user_id}/resume.pdf` object and persists its key, while signed URLs are generated only when needed.
- Resume-tailoring fields were omitted because resume tailoring is outside the current product scope.
- The profile page follows `context/designs/profile.png` on a 1024px content canvas with responsive field stacking, mock-only form content, and no persistence or generation logic until Features 06–08.
- The authenticated application header uses a 64px product layout and a small `usePathname()` client boundary for icon-backed active navigation while session verification remains server-side.
- The authenticated header keeps a visible Sign Out button at every breakpoint; it submits the existing server action, ends the InsForge session, and redirects to the homepage.
- Cover letter tone remains in the data model but is intentionally omitted from Feature 05 because it is not present in the approved profile reference.
- `/profile` now loads and upserts the authenticated user’s InsForge profile through a typed Server Action; identity fields always come from the verified session and incomplete profiles remain saveable.
- Profile completion uses ten equal checkpoints and stores the percentage, stable missing-field labels, and complete state with each save. The UI changes from attention to success styling only at 100%.
- Skills, industries, and comma-separated preferences are trimmed and case-insensitively deduplicated. Work history accepts up to three roles, and partial roles remain stored without counting toward completion.
- Resume replacement accepts PDF files up to 5 MB, uses the deterministic private `resumes/{user_id}/resume.pdf` location, and preserves the existing key when no replacement is submitted. The Server Action body limit is 6 MB.
- `profile_completed` is emitted only on the first stored transition from incomplete to complete; analytics delivery is best-effort and never reverses a successful save.
- Resume selection and drag/drop now upload immediately with client and server PDF validation, a visible pending state, a success/replacement row, and an authenticated 15-minute signed review URL opened on demand.
- Resume extraction downloads the authenticated user’s private PDF server-side, rejects unreadable or image-only documents, and sends only extracted text to `gpt-5.6-luna` through the Responses API with strict Structured Outputs, low reasoning effort, and storage disabled.
- AI extraction is review-only form state: fill-empty is non-destructive, replacement requires confirmation, missing AI values never erase user data, and Undo Extraction restores the exact pre-extraction snapshot until save, upload, or another extraction.
- Next.js keeps `pdf-parse` and `@napi-rs/canvas` external on the server, and the PDF.js worker is configured with a Windows-safe `file://` URL before parsing.
- Resume generation uses saved, resume-ready profile data and `gpt-5.6-luna` strict Structured Outputs to create only a factual summary and ordered work bullets; deterministic profile facts render through a single-column ATS-safe A4 template.
- Generated resumes replace the canonical private `{user_id}/resume.pdf` only after AI validation, PDF rendering, and a one-page guard succeed. Unsaved profile edits block generation, and existing resumes require inline replacement confirmation.
- The generated document caps summary, skills, roles, and bullets for readability, excludes job preferences and work authorization, and keeps signed review URLs on demand through the existing resume view route.
- Education is stored as a backward-compatible JSON array with up to five entries. The profile editor supports accessible add/remove controls, extraction can populate multiple entries, completion requires any one complete entry, and generated resumes render complete entries only.
- The database education constraint and default were migrated from a single JSON object to an array capped at five; existing non-empty education objects are wrapped into one-entry arrays and empty objects become empty arrays.

---

## Notes

- Local auth configuration lives in ignored `.env.local`; `.env.example` documents the required backend URL, anon key, and application URL.
- Google and GitHub are enabled on the connected InsForge backend. InsForge permits all redirect URLs while the allowed list is empty, which supports local development. Before production launch, explicitly allowlist the deployed `/callback` URL.

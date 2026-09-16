# Memory — InsForge Authentication Complete

Last updated: 2026-09-16 16:10 +09:00

## What was built

- Completed Phase 1, Feature 02: Google and GitHub OAuth with the current `@insforge/sdk` SSR helpers.
- Added the login UI, server-started PKCE flow, `/callback` exchange handler, refresh and sign-out routes, Next.js 16 `proxy.ts` session refresh/protection, and an authoritative protected layout.
- Added minimal protected `/dashboard`, `/profile`, and `/find-jobs` placeholders. Successful sign-out redirects to `/`; a failed sign-out stays on the dashboard and shows a human-readable alert.
- Added browser/server InsForge client modules and documented the required public environment variables in `.env.example`.
- Updated the InsForge project guidance, dependency standard, UI registry, and progress tracker.

## Decisions made

- Use `@insforge/sdk/ssr`, not the obsolete standalone `@insforge/ssr` examples.
- OAuth mutations and PKCE exchange run on the server so the verifier and refresh token remain in httpOnly cookies.
- Protected routes use both proxy-level session refresh/early redirect and a server-layout `getCurrentUser()` check.
- Keep application pages as heading-only placeholders until their dedicated build phases.

## Problems solved

- The installed SDK exposes official SSR and Next.js 16 middleware helpers even though the high-level auth reference mainly shows browser usage.
- PowerShell does not resolve `npm` from PATH; validation uses the installed Node runtime under the user NVM directory.
- InsForge allows all redirect targets while its allowed redirect list is empty for local development. Explicitly allowlist the deployed callback URL before production launch.
- Sign-out errors no longer silently redirect as if logout succeeded.

## Current state

- Feature 02 is complete and recorded in `context/progress-tracker.md`.
- Google and GitHub are enabled on the connected InsForge backend.
- Local environment configuration exists in ignored `.env.local`; no credentials are stored in this memory file.
- ESLint, strict TypeScript, production build, and unauthenticated route/callback smoke checks pass.

## Next session starts with

Run `/remember restore`, then begin Phase 1 Feature 03: PostHog Initialization as specified in `context/build-plan.md`.

## Open questions

- The production application domain is not known yet. Once chosen, add its `/callback` URL to InsForge’s explicit allowed redirect list and update `NEXT_PUBLIC_APP_URL` in the deployment environment.

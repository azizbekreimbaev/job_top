# Memory — Phase 2 Feature 08 Complete

Last updated: 2026-09-18 +09:00

## What was built

- Completed Phase 2 Feature 08: authenticated resume PDF generation from the user’s last explicitly saved profile.
- Added `POST /api/resume/generate`, a server-only resume generation service, strict generated-content validation, and an ATS-safe single-column A4 document rendered with `@react-pdf/renderer`.
- Added resume-readiness checks, deep saved-profile comparison, unsaved-change blocking, inline replacement confirmation, accessible generation states, and reuse of the authenticated `/api/resume/view` review route.
- Extended education from one object to a repeatable list capped at five across profile editing, persistence, AI extraction, completion calculation, undo snapshots, saved-state comparison, and generated resumes.
- Added and applied `migrations/20260918_multiple_education_entries.sql`, converting existing education objects to arrays, changing the default to `[]`, and enforcing the five-entry database cap.
- Updated profile/resume tests and the architecture, library guidance, progress tracker, and UI registry.

## Decisions made

- Resume generation uses exact model `gpt-5.6-luna`, low reasoning effort, strict JSON Schema Structured Outputs, `store: false`, and a client timeout.
- AI generates only a factual professional summary and ordered work bullets. Identity, contact details, skills, role facts, dates, and education are rendered deterministically from saved profile data.
- Generation never saves form edits. Any difference from the saved baseline blocks generation until the user explicitly saves.
- The canonical private object remains `{user_id}/resume.pdf`; replacement occurs only after AI validation, PDF rendering, and the one-page guard succeed.
- Root PDF wrapping remains enabled because disabling it can shrink the page media box in `@react-pdf/renderer` 4.9.0. A post-render page-count check enforces exactly one true A4 page.
- Education persists as a JSON array of up to five entries. Legacy single objects are normalized to one-entry arrays; profile completion requires any one complete entry; generated resumes include complete entries only.
- No new PostHog event was added because the project permits only its four documented events.

## Problems solved

- Fixed the live profile-save failure caused by the original database constraint requiring education to be a JSON object. The connected InsForge database now has an array default and a maximum-five constraint, with zero remaining object-shaped rows.
- Preserved existing education data by wrapping non-empty objects into arrays and converting empty objects to empty arrays.
- Verified the densest supported generated resume—65-word summary, 12 skills, three roles with three capped bullets each, and five education entries—renders as one readable A4 page without clipping or overlap.
- Confirmed that unexpected text at the top of a generated resume comes from the saved `full_name` value, not from AI generation; identity fields are intentionally never rewritten by the model.

## Current state

- Phase 1 Features 01–04 and Phase 2 Features 05–08 are complete. Feature 09 is next.
- Profile save, private resume upload/replacement/review, AI extraction/undo, repeatable education, and resume generation are implemented end to end.
- The live education schema migration is applied and verified: default `[]`, array constraint active, maximum five entries, and no legacy object rows remain.
- Twenty-four unit tests pass. ESLint, strict TypeScript, `git diff --check`, the Next.js production build, one-page PDF metadata/text checks, and rendered PNG visual inspection pass.
- The configured service credentials remain server-only and are not persisted in this memory.
- Changes remain in the working tree/index and have not been committed.

## Next session starts with

Run `/remember restore`, confirm this state, then use `/architect` for Phase 3 Feature 09: Find Jobs Page — Full UI.

Read the required project context files in the exact order specified by `AGENTS.md`. Preserve the established authenticated application shell, design tokens, profile contracts, four-event PostHog allowlist, and user-owned working-tree changes.

## Open questions

- The production application domain remains unspecified; explicitly allowlist its `/callback` URL before launch.
- No Feature 08 blockers remain.

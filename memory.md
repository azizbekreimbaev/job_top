# Memory — Database Foundation Complete

Last updated: 2026-09-17 12:15 +09:00

## What was built

- Completed Phase 1 Feature 04: Database Schema and applied it to the connected InsForge backend.
- Added `migrations/20260917_feature_04_database_schema.sql` for the `profiles`, `agent_runs`, `jobs`, and `agent_logs` tables, their constraints, indexes, relationships, row-level security policies, and private resume-object policies.
- Created the private `resumes` bucket. The current resume uses the object key `{user_id}/resume.pdf`.
- Updated `context/architecture.md`, `context/build-plan.md`, `context/library-docs.md`, `context/progress-tracker.md`, and `context/ui-registry.md` to reflect the implemented data and storage model.

## Decisions made

- Profiles are created on the user's first profile save. A missing profile is treated as incomplete.
- Resume tailoring remains outside the product scope, so no tailoring columns were added.
- Store `profiles.resume_pdf_key`, not a public or expiring URL. Generate short-lived signed URLs only when a private resume needs browser access.
- Enforce ownership both through `auth.uid()` row-level security and composite foreign keys that prevent jobs or logs from referencing another user's records.

## Problems solved

- Reconciled the stale build-plan reference to resume-tailoring fields with the current product scope.
- Replaced the obsolete public resume URL pattern with private object keys and signed URLs.
- InsForge's schema tool controls its own transaction, so the migration intentionally contains no explicit `BEGIN` or `COMMIT` statements.
- Removed default anonymous table privileges in addition to enabling row-level security.

## Current state

- Phase 1 Features 01 through 04 are complete. Phase 2 Feature 05, Profile Page — Full UI, is next.
- The live backend contains four empty application tables, four application-table RLS policies, four resume-object policies, and a private `resumes` bucket.
- Schema inspection confirmed all intended constraints, indexes, relationships, policies, and authenticated grants. Invalid profile completion data was rejected and no test records remain.
- The InsForge admin tool does not permit changing session claims, so a two-user request-level impersonation test was not possible. Cross-user isolation was verified from the deployed RLS definitions, revoked anonymous grants, and composite ownership constraints.
- The Feature 04 review passed all three layers with no implementation issues found.

## Next session starts with

Run `/remember restore`, then use `/architect` for Phase 2 Feature 05: Profile Page — Full UI.

Build the complete profile interface with mock data only, following the existing design tokens and UI rules. Do not add save logic yet; that belongs to Feature 06. Read the required context files in the order specified by `AGENTS.md` before implementation.

## Open questions

- Required fields and the exact completion-percentage weighting must be finalized before Feature 06 implements profile persistence.
- The production application domain is still unspecified. Before launch, explicitly allowlist its `/callback` URL in InsForge and configure the deployment application URL.

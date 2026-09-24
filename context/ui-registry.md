# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Find Jobs Search and Results

Files: components/find-jobs/SearchControls.tsx, components/find-jobs/JobFilters.tsx, components/find-jobs/JobsTable.tsx, components/find-jobs/MatchScore.tsx, components/find-jobs/JobsPagination.tsx
Last updated: 2026-09-19 (Feature 11)

| Property         | Class                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Background       | `bg-surface`, secondary table header `bg-surface-secondary`             |
| Border           | `border border-border`, rows `border-b border-border`                   |
| Border radius    | Sections `rounded-xl`, controls `rounded-md`, score bars `rounded-full` |
| Text — primary   | `text-text-primary text-sm font-semibold`                               |
| Text — secondary | `text-text-secondary text-sm`, labels `text-xs font-semibold uppercase` |
| Spacing          | Sections `p-5 sm:p-6`, rows `px-6 py-4`, section gap `space-y-6`        |
| Hover state      | `hover:bg-surface-secondary`, primary `hover:bg-accent-dark`            |
| Shadow           | `shadow-sm`                                                             |
| Accent usage     | `bg-accent text-accent-foreground`, `focus-visible:outline-accent`      |

**Pattern notes:** Search and filter controls use 48px and 40px heights respectively. Result tables use white rows, a secondary-surface header, token borders, horizontal overflow on narrow screens, and green/blue/orange score fills matching the approved Find Jobs reference. Search pending state disables all inputs and uses `disabled:opacity-70 disabled:cursor-wait` on the primary action. Success feedback uses `border-success-light bg-success-lightest text-success-dark`; errors use `border-error bg-surface text-error` with an inline underlined Profile CTA when completion is required. Filter and sort controls use the normal surface with accent focus states; URL-backed filter changes reset to page one. Pagination links use token hover/focus states, the current page uses `border-accent-light bg-accent-muted text-accent`, and unavailable Previous/Next states use `text-text-muted opacity-60 cursor-not-allowed`.

### Marketing Navbar

File: components/layout/Navbar.tsx
Last updated: 2026-09-15

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border-b border-border`                                              |
| Border radius    | `none`                                                                |
| Text — primary   | `text-text-dark text-sm font-medium`                                  |
| Text — secondary | `text-accent-foreground text-sm font-medium`                          |
| Spacing          | `h-20 px-5 sm:px-8`                                                   |
| Hover state      | `hover:text-accent`, `hover:bg-text-slate`                            |
| Shadow           | `none`                                                                |
| Accent usage     | `focus-visible:outline-accent`                                        |

**Pattern notes:** Marketing navigation uses the supplied logo asset, an 80px header, a centered 1280px content width, and hides product navigation below the medium breakpoint while keeping the onboarding CTA visible.

### Marketing Hero and CTA

Files: components/homepage/Hero.tsx, components/homepage/BottomCta.tsx
Last updated: 2026-09-15

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `marketing-glow`                                                      |
| Border           | `border border-border`                                                |
| Border radius    | `none`                                                                |
| Text — primary   | `text-text-slate font-semibold tracking-[-0.04em]`                    |
| Text — secondary | `text-text-secondary font-normal`                                     |
| Spacing          | `px-5 py-16 sm:px-10 sm:py-20 lg:py-24`                               |
| Hover state      | `hover:bg-text-slate`, `hover:bg-surface`                             |
| Shadow           | `none`                                                                |
| Accent usage     | `focus-visible:outline-accent`                                        |

**Pattern notes:** Primary marketing CTAs use `bg-overlay` with white token text; secondary CTAs use a translucent white surface and the muted border token. Both remain stacked on mobile and inline from `sm` upward.

### Editorial Feature Panel

Files: components/homepage/FeatureShowcase.tsx, components/homepage/FeatureList.tsx
Last updated: 2026-09-15

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`, media panel `bg-background`                             |
| Border           | `border border-border`, rows `border-b border-border`                 |
| Border radius    | `none`                                                                |
| Text — primary   | `text-text-slate font-semibold`                                       |
| Text — secondary | `text-text-secondary font-normal`                                     |
| Spacing          | Headings `px-6 py-12 sm:px-10`; rows `px-6 py-8 sm:px-10`             |
| Hover state      | `none`                                                                |
| Shadow           | `none`                                                                |
| Accent usage     | Selected row `border-l-2 border-l-accent`                             |

**Pattern notes:** Marketing feature panels alternate white editorial copy and `bg-background` imagery. Desktop uses two equal columns; smaller screens stack content in reading order. Hatched `marketing-grid` separators create the large-page rhythm from the reference.

### Testimonial

File: components/homepage/Testimonial.tsx
Last updated: 2026-09-15

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border border-border`                                                |
| Border radius    | `none`                                                                |
| Text — primary   | `text-text-slate font-normal`                                         |
| Text — secondary | `text-text-secondary text-sm font-normal`                             |
| Spacing          | `px-6 py-16 sm:px-12 sm:py-20`                                       |
| Hover state      | `none`                                                                |
| Shadow           | `none`                                                                |
| Accent usage     | Eyebrow `text-accent`                                                 |

**Pattern notes:** Testimonials use a centered uppercase accent eyebrow, large regular-weight quotation, and a compact avatar/name/role attribution row.

### Marketing Footer

File: components/layout/Footer.tsx
Last updated: 2026-09-15

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border-x border-t border-border`                                     |
| Border radius    | `none`                                                                |
| Text — primary   | `text-text-dark text-sm font-medium`                                  |
| Text — secondary | `none`                                                                |
| Spacing          | `px-6 py-10 sm:px-10`                                                 |
| Hover state      | `hover:text-accent`                                                   |
| Shadow           | `none`                                                                |
| Accent usage     | Supplied JobPilot logo and link hover color                           |

**Pattern notes:** The footer mirrors the centered 1280px marketing canvas and switches from a centered vertical arrangement to a horizontal row at the small breakpoint.

### Authentication Card

Files: app/(auth)/login/page.tsx, components/auth/OAuthButtons.tsx
Last updated: 2026-09-16

| Property         | Class                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| Background       | Page `marketing-glow`, card and buttons `bg-surface`                       |
| Border           | `border border-border`                                                     |
| Border radius    | Card `none`, buttons `rounded-md`                                          |
| Text — primary   | `text-text-slate font-semibold tracking-[-0.04em]`                         |
| Text — secondary | `text-text-secondary text-sm`, legal text `text-text-muted text-xs`        |
| Spacing          | Card `px-6 py-8 sm:px-10 sm:py-10`, buttons `px-4 py-3`, stack `space-y-3` |
| Hover state      | `hover:bg-surface-secondary`                                               |
| Shadow           | `none`                                                                     |
| Accent usage     | Eyebrow `text-accent`, focus `focus-visible:outline-accent`                |

**Pattern notes:** Authentication uses a centered, square-edged editorial card over the existing marketing glow. Provider actions are full-width bordered buttons with compact monochrome provider marks and consistent accessible focus outlines.

### Authenticated App Header

Files: app/(protected)/layout.tsx, components/layout/ApplicationNavigation.tsx
Last updated: 2026-09-17

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface` on `bg-background` application pages                    |
| Border           | `border-b border-border`                                              |
| Border radius    | Sign-out button `rounded-md`                                          |
| Text — primary   | Inactive `text-text-dark text-sm font-medium`                         |
| Text — secondary | Active `text-accent text-sm font-medium`                              |
| Spacing          | Header `h-16 px-5 sm:px-8`, navigation `gap-8`                       |
| Hover state      | Links `hover:text-accent`, sign-out `hover:bg-surface-secondary`      |
| Shadow           | `none`                                                                |
| Accent usage     | Active `border-b-2 border-accent text-accent`, focus `focus-visible:outline-accent` |

**Pattern notes:** The authenticated shell uses the compact 64px product header from the supplied application reference. `ApplicationNavigation` isolates `usePathname()` to a small client boundary so the server layout keeps ownership of session verification. Active routes use a purple bottom border and matching icon/text color. The logo always links to the public homepage (`/`); the server-action-backed Sign Out button remains visible at every breakpoint while product navigation is hidden below medium.

### Inline Error Alert

File: app/(protected)/dashboard/page.tsx
Last updated: 2026-09-16

| Property         | Class                                      |
| ---------------- | ------------------------------------------ |
| Background       | `bg-surface`                               |
| Border           | `border border-error`                      |
| Border radius    | `none`                                     |
| Text — primary   | `text-text-dark text-sm`                   |
| Text — secondary | `none`                                     |
| Spacing          | `mt-6 px-4 py-3`                           |
| Hover state      | `none`                                     |
| Shadow           | `none`                                     |
| Accent usage     | Error state uses the `border-error` token  |

**Pattern notes:** Recoverable action failures stay in context and use a concise `role="alert"` message. The alert uses the project surface and error-border tokens without exposing raw backend errors.

### Analytics Identity Bridge

File: components/analytics/PostHogIdentity.tsx
Last updated: 2026-09-16

| Property         | Class  |
| ---------------- | ------ |
| Visual output    | `none` |
| Layout impact    | `none` |
| Interaction      | `none` |

**Pattern notes:** The authenticated server layout supplies the stable InsForge user identity to this non-visual client boundary. It identifies the active user after hydration and resets PostHog identity when the protected shell unmounts after sign-out.

### Feature 04 — Database Foundation

Last updated: 2026-09-17

No visual components were added. Feature 04 establishes the data and ownership model used by future profile, job, activity, and resume UI. Existing application-shell patterns remain unchanged.

### Profile Attention Banner

Files: components/profile/ProfileAttention.tsx, components/profile/CompletionIndicator.tsx
Last updated: 2026-09-17

| Property         | Class                                                   |
| ---------------- | ------------------------------------------------------- |
| Background       | `bg-surface`                                            |
| Border           | Incomplete `border-error/20`, complete `border-success/25` |
| Border radius    | `rounded-2xl`, missing-field badges `rounded-sm`        |
| Text — primary   | `text-text-primary text-lg font-semibold`               |
| Text — secondary | `text-text-secondary text-sm leading-5`                 |
| Spacing          | Container `p-6`, badge row `mt-5 gap-2`                 |
| Hover state      | `none`                                                  |
| Shadow           | `shadow-sm`                                             |
| Accent usage     | Incomplete `stroke-error`, complete `stroke-success`, badges use matching semantic tokens |

**Pattern notes:** Profile status changes in place: incomplete profiles use a restrained error treatment and compact uppercase missing-field badges, while 100% completion switches the same card and SVG ring to success tokens and removes the badges. Ring progress is calculated dynamically in 10% increments.

### Resume Upload Card

File: components/profile/ResumeUpload.tsx
Last updated: 2026-09-18

| Property         | Class                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| Background       | Card `bg-surface`, drop zone `bg-surface-secondary`, success row `bg-success-lightest` |
| Border           | Card `border-border`; drop zone `border-dashed border-border-muted`, active `border-2 border-accent ring-4 ring-accent/15` |
| Border radius    | Card `rounded-2xl`, drop zone `rounded-xl`, actions `rounded-md`           |
| Text — primary   | `text-text-primary`, title `text-lg font-semibold`                         |
| Text — secondary | `text-text-secondary text-sm`                                              |
| Spacing          | Card `p-6`, drop zone `px-6 py-10`, footer `pt-5`                          |
| Hover state      | Secondary `hover:bg-surface-secondary`, review row `hover:border-success`, drag target `scale-[1.01] bg-accent-muted` |
| Shadow           | Card and upload action `shadow-sm`, active drop target `shadow-md`          |
| Accent usage     | Upload icon `stroke-accent`, primary `bg-accent text-accent-foreground`    |

**Pattern notes:** Resume upload begins immediately after picker selection or drop. Drag-active state uses a thicker accent border, ring, slight scale, stronger shadow, and inverted icon. Pending uploads show a spinner and pulsing progress bar for at least 1.2 seconds. A successful private upload or generation becomes a semantic success row linking to the on-demand signed review URL; validation failures remain inline. Once a resume exists, the nested `bg-surface-secondary` AI panel presents a filled accent action for safe fill-empty extraction and a bordered secondary replacement action. Replacement uses an inline semantic warning confirmation, extraction feedback uses accessible live regions, and Undo Extraction remains visible while a snapshot exists. Resume generation reuses the primary accent button, semantic live-region feedback, and inline `border-warning/30 bg-warning/10` confirmation pattern; it is disabled with a specific explanation for unsaved or resume-incomplete profiles.

### Generated Resume Document

File: components/profile/ResumeDocument.tsx
Last updated: 2026-09-18

| Property         | Class / value                                                    |
| ---------------- | ---------------------------------------------------------------- |
| Background       | White A4 document                                                |
| Border           | Full-width accent SVG rule                                       |
| Border radius    | `none`                                                           |
| Text â€” primary   | Helvetica, `rgb(16, 24, 40)`                                     |
| Text â€” secondary | Helvetica, `rgb(75, 85, 99)` / `rgb(107, 114, 128)`              |
| Spacing          | 34pt page padding, 8pt section spacing                            |
| Hover state      | `none`                                                           |
| Shadow           | `none`                                                           |
| Accent usage     | `rgb(124, 92, 252)` section headings, current title, and top rule |

**Pattern notes:** Generated resumes use a single-column ATS-safe reading order with compact typography, no icons or tables, and deterministic content caps. Complete education entries render in saved order with compact spacing. The PDF palette mirrors the application tokens in the only format available to the server renderer. A rendered page-count guard prevents multi-page files from replacing the canonical resume.

### Profile Information Form

File: components/profile/ProfileForm.tsx
Last updated: 2026-09-19

| Property         | Class                                                                               |
| ---------------- | ----------------------------------------------------------------------------------- |
| Background       | Card and inputs `bg-surface`, disabled inputs and role panels `bg-surface-secondary` |
| Border           | Card, fields, and section dividers `border-border`                                 |
| Border radius    | Card `rounded-2xl`, controls `rounded-md`, role panel `rounded-xl`                 |
| Text — primary   | Section titles `text-text-primary font-semibold`, controls `text-text-primary text-sm` |
| Text — secondary | Labels `text-text-secondary text-xs font-medium uppercase tracking-wide`           |
| Spacing          | Card `p-6`, form `space-y-10`, sections `pt-10`, grid `gap-x-5 gap-y-5`            |
| Hover state      | Primary `hover:bg-accent-dark`, add/remove controls use semantic text hover tokens   |
| Shadow           | Card and controls `shadow-sm`                                                       |
| Accent usage     | Controls `focus:border-accent focus:ring-1 focus:ring-accent`, primary `bg-accent`  |

**Pattern notes:** Long application forms use a responsive one-to-two-column grid, 44px controls, compact uppercase labels, and border-separated sections. Skills and industries use removable `bg-surface-tertiary` chips. Work history and education use the same repeatable `rounded-xl` panel pattern with right-aligned add/remove text actions; roles are capped at three and education at five. Extraction-supported controls are fully controlled and receive a temporary `border-accent ring-2 ring-accent/20` review highlight after AI population. Every editable control must also update the canonical profile state; after saving, the database-returned row becomes the saved baseline so success and unsaved-change states reflect persisted data. Pending save, upload, or extraction disables the editor and changes the relevant primary label. Save feedback appears directly above the submit action with semantic error, warning, or success tokens and an accessible live region.

### Job Details Cards

Files: components/job-details/*.tsx, app/(protected)/find-jobs/[id]/page.tsx
Last updated: 2026-09-20 (Feature 13)

| Property         | Class                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Background       | Page `bg-background` through the protected shell; cards `bg-surface`; icon wells use semantic light surfaces |
| Border           | Cards `border border-border`; recoverable failure `border-error`                              |
| Border radius    | Cards `rounded-xl`; icon wells `rounded-xl` or `rounded-full`; controls `rounded-md`          |
| Text — primary   | Titles `text-text-primary font-semibold` or `font-bold`; body `text-text-primary`             |
| Text — secondary | Labels `text-text-secondary text-sm uppercase tracking-wide`; supporting copy `text-text-muted` |
| Spacing          | Page stack `space-y-6`; cards `p-6 sm:p-8`; section content generally begins at `mt-5`       |
| Hover state      | Primary actions `hover:bg-accent-dark`; secondary actions `hover:bg-surface-secondary`       |
| Shadow           | Cards `shadow-sm`                                                                             |
| Accent usage     | Primary CTA `bg-accent`; matched skills use success tokens; gaps and research use accent tokens |

**Pattern notes:** Job-detail content uses a centered 1024px product canvas and a consistent stack of bordered, softly shadowed cards. Metadata collapses from four columns to two and then one. External actions always include visible keyboard focus, safe new-tab attributes, and screen-reader new-tab text. Skill badges use compact semantic pills; card headings pair a small tinted icon well with either an uppercase label or sentence-case title. Complete provider content keeps the standard heading; truncated provider content is explicitly labeled as a preview and ends with a nested `bg-surface-secondary` notice plus the standard accent CTA to the original listing. Company research retains existing dossier content during reruns, uses the standard disabled pending action and semantic live feedback, lays dossier sections into a responsive two-column grid, renders validated sources as safe new-tab links, and marks job/profile-only fallback with `border-warning/30 bg-warning/10` while omitting sources.

### Dashboard Cards and Charts

Files: app/(protected)/dashboard/page.tsx, components/dashboard/*.tsx
Last updated: 2026-09-24 (Feature 14)

| Property         | Class                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| Background       | Page `bg-background`; cards and banner `bg-surface`                                    |
| Border           | Cards `border border-border`; incomplete banner `border-warning/30`                    |
| Border radius    | Cards `rounded-xl`; trend labels `rounded-sm`; activity markers `rounded-full`         |
| Text — primary   | Titles `text-text-primary text-base font-semibold`; stats `text-3xl font-semibold`     |
| Text — secondary | Labels `text-text-secondary text-sm font-medium`; axes and timestamps `text-text-muted` |
| Spacing          | Page `space-y-6 px-5 py-8 sm:px-8 sm:py-10`; cards `p-6`; grid `gap-6`                |
| Hover state      | Banner CTA `hover:bg-accent-dark`                                                      |
| Shadow           | `shadow-sm`                                                                            |
| Accent usage     | Purple jobs trend; blue research bars; green match bars; semantic activity markers     |

**Pattern notes:** Dashboard sections use the 1440px authenticated canvas and white tokenized cards. Stats collapse from four columns to two and then one; chart pairs stack until desktop. Charts use responsive inline SVG with CSS-variable color tokens, dashed border-token grids, muted axes, rounded bars, and screen-reader summaries. Recent activity uses the established purple, blue, and green semantic dot treatments on a subtle vertical timeline. The incomplete-profile banner stays compact and uses the standard accent CTA without changing the white card surface.

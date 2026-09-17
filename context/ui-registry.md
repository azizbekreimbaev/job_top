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
| Border           | `border border-error/20`                                |
| Border radius    | `rounded-2xl`, missing-field badges `rounded-sm`        |
| Text — primary   | `text-text-primary text-lg font-semibold`               |
| Text — secondary | `text-text-secondary text-sm leading-5`                 |
| Spacing          | Container `p-6`, badge row `mt-5 gap-2`                 |
| Hover state      | `none`                                                  |
| Shadow           | `shadow-sm`                                             |
| Accent usage     | Error state `stroke-error`, `bg-error/10`, `text-error` |

**Pattern notes:** Incomplete-profile messaging uses a restrained error border and compact uppercase missing-field badges on a white card. The completion ring is an SVG progress treatment using tokenized strokes rather than component-level color values.

### Resume Upload Card

File: components/profile/ResumeUpload.tsx
Last updated: 2026-09-17

| Property         | Class                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| Background       | Card `bg-surface`, drop zone `bg-surface-secondary`                        |
| Border           | Card `border border-border`, drop zone `border-dashed border-border-muted` |
| Border radius    | Card `rounded-2xl`, drop zone `rounded-xl`, actions `rounded-md`           |
| Text — primary   | `text-text-primary`, title `text-lg font-semibold`                         |
| Text — secondary | `text-text-secondary text-sm`                                              |
| Spacing          | Card `p-6`, drop zone `px-6 py-10`, footer `pt-5`                          |
| Hover state      | Secondary `hover:bg-surface-secondary`, primary `hover:bg-accent-dark`     |
| Shadow           | Card and upload action `shadow-sm`                                         |
| Accent usage     | Upload icon `stroke-accent`, primary `bg-accent text-accent-foreground`    |

**Pattern notes:** Resume upload uses a large centered dashed drop zone followed by a border-separated action footer. Primary generation actions remain purple; file selection remains a quiet white secondary action.

### Profile Information Form

File: components/profile/ProfileForm.tsx
Last updated: 2026-09-17

| Property         | Class                                                                               |
| ---------------- | ----------------------------------------------------------------------------------- |
| Background       | Card and inputs `bg-surface`, filled/disabled inputs `bg-surface-secondary`        |
| Border           | Card, fields, and section dividers `border-border`                                 |
| Border radius    | Card `rounded-2xl`, controls `rounded-md`, role panel `rounded-xl`                 |
| Text — primary   | Section titles `text-text-primary font-semibold`, controls `text-text-primary text-sm` |
| Text — secondary | Labels `text-text-secondary text-xs font-medium uppercase tracking-wide`           |
| Spacing          | Card `p-6`, form `space-y-10`, sections `pt-10`, grid `gap-x-5 gap-y-5`            |
| Hover state      | Primary `hover:bg-accent-dark`, add controls `hover:text-text-primary`              |
| Shadow           | Card and controls `shadow-sm`                                                       |
| Accent usage     | Controls `focus:border-accent focus:ring-1 focus:ring-accent`, primary `bg-accent`  |

**Pattern notes:** Long application forms use a responsive one-to-two-column grid, 44px controls, compact uppercase labels, and border-separated sections. Filled mock values use the secondary surface while required empty fields remain white, matching the supplied profile reference.

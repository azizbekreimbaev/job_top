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

File: app/(protected)/layout.tsx
Last updated: 2026-09-16

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface` on `bg-background` application pages                    |
| Border           | `border-b border-border`                                              |
| Border radius    | Sign-out button `rounded-md`                                          |
| Text — primary   | `text-text-dark text-sm font-medium`                                  |
| Text — secondary | `none`                                                                |
| Spacing          | Header `h-20 px-5 sm:px-8`, navigation `gap-8`, button `px-4 py-2.5` |
| Hover state      | Links `hover:text-accent`, button `hover:bg-surface-secondary`        |
| Shadow           | `none`                                                                |
| Accent usage     | `focus-visible:outline-accent`                                        |

**Pattern notes:** The authenticated shell mirrors the marketing navbar dimensions and logo treatment while replacing the marketing CTA with a quiet bordered sign-out action. Product navigation remains hidden below the medium breakpoint until a mobile navigation pattern is introduced.

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

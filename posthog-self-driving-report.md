# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for this web app. Session Replay and Error Tracking were already enabled; Support was enabled in this setup. Health checks, Error Tracking, and Support ticket signal sources are enabled, and two Replay Vision monitors will feed corroborated findings into the inbox.

Fresh scouts and scanners begin producing findings within about 30 minutes, once recordings and relevant activity exist: [Self-driving inbox](https://us.posthog.com/project/610032/inbox).

## AI data processing

Approved. The organization-level approval gate was satisfied before this setup ran.

## GitHub

Connected before this setup. No additional GitHub source was enabled because GitHub Issues was not selected.

## Products enabled

| Product | Status | Notes |
|---|---|---|
| Session Replay | Already enabled | The `posthog-js` initialization does not disable session recording. No recordings were found yet. |
| Error Tracking | Already enabled | The browser initialization captures exceptions and the server client enables exception autocapture. |
| Support (Conversations) | Enabled | Tickets will begin arriving only after an inbound email, inbox, or Slack channel is connected in PostHog. |

## Signal sources

| Signal source | Action | Details |
|---|---|---|
| `health_checks` / `health_issue` | Enabled | Source config `01a0a944-9e5e-71a6-ab86-d7a5ecb6c34a`. |
| `error_tracking` / `issue_created` | Enabled | Source config `01a0a944-9e8c-78c5-ae4b-4636e7ffdd71`. |
| `error_tracking` / `issue_reopened` | Enabled | Source config `01a0a944-9e2e-7996-a1c4-306c27e6b4b4`. |
| `error_tracking` / `issue_spiking` | Enabled | Source config `01a0a944-9ecf-7c4f-a800-0764a43b0951`. |
| `conversations` / `ticket` | Enabled | Source config `01a0a944-9e66-7567-a361-e10e6aefb133`; dormant until a Support channel is connected. |
| `signals_scout` / `cross_source_issue` | Skipped | Scout findings are on by default and no opt-out row existed. |
| Session replay source row | Skipped | Replay coverage is provided by the Replay Vision scanners below; the retired session-analysis source was not created. |

## Connected tools

No external connected-tool responders were selected. GitHub Issues, Linear, Jira, Sentry, Zendesk, and the expanded catalog were left unused, so no warehouse sources or dormant responders were created.

## Scout troop

**Enabled (3):**

- `signals-scout-general` — watches cross-product patterns and surfaces not owned by a specialist.
- `signals-scout-product-analytics` — watches core behavior and conversion-flow regressions.
- `signals-scout-web-analytics` — watches traffic, attribution, and landing-page health.

**Disabled (24):**

- `signals-scout-ai-observability` — no application evidence of an LLM trace surface.
- `signals-scout-anomaly-detection` — no established dashboard or insight activity was available to monitor.
- `signals-scout-apm` — no APM or OpenTelemetry surface was detected.
- `signals-scout-conversations` — Support tickets are routed through the native ticket signal source.
- `signals-scout-csp-violations` — no CSP reporting configuration was detected.
- `signals-scout-customer-analytics` — no account or group analytics surface was detected.
- `signals-scout-data-pipelines` — no pipeline or export surface was detected.
- `signals-scout-data-warehouse` — no warehouse source was selected for monitoring.
- `signals-scout-error-tracking` — Error Tracking is routed through the native signal sources.
- `signals-scout-experiments` — no active experiment evidence was available.
- `signals-scout-feature-flags` — feature flags are set up in PostHog but no active code usage was found.
- `signals-scout-health-checks` — health findings are routed through the native health-check source.
- `signals-scout-inbox-validation` — disabled on this fresh setup because there are no resolved Self-driving reports to re-measure yet.
- `signals-scout-insight-alerts` — no configured insight-alert activity was available.
- `signals-scout-logs` — no application logging surface was detected.
- `signals-scout-mcp-tool-calls` — no product MCP-tool-call surface was detected.
- `signals-scout-observability-gaps` — not selected while the product analytics scout provides the focused behavior coverage.
- `signals-scout-replay-vision` — no prior scanner observations exist; Replay Vision monitors are now configured separately.
- `signals-scout-revenue-analytics` — no payments or revenue integration was detected.
- `signals-scout-session-replay` — Session Replay is routed through the Replay Vision monitors.
- `signals-scout-skills-store` — no team skills-store surface is in scope for the app.
- `signals-scout-surveys` — Surveys are not enabled and none exist.
- `signals-scout-tasks` — no PostHog Tasks surface was detected.
- `signals-scout-web-vitals` — Core Web Vitals monitoring was not selected for this focused initial troop.

The verified budget is **100 runs/day**, with **0 used today** and **100 remaining**. The current banner says: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

## Custom scouts

No custom scouts were created: the proposal was cancelled, leaving the built-in troop unchanged.

Two candidates were considered from the repository’s existing instrumentation:

- An OAuth sign-in handoff check, using the browser start and server completion events to identify a provider-specific completion drop. It would add a specific authentication discriminator beyond the general product-analytics scout.
- A marketing-to-sign-in check, using marketing CTA events and follow-on sign-in activity to identify a placement or intent that stops producing downstream engagement. It would partly overlap web analytics, which watches traffic and landing-page health rather than this journey.

If a future custom scout becomes noisy, set `emit: false` on its config in PostHog to change it to dry-run mode.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes unambiguous findings to the inbox. These are the only items in this setup that spend Replay Vision quota. Each finding arrives at half weight and needs corroboration before it is promoted into a report.

| Brief | Status | Query scope | Sampling | Estimate |
|---|---|---|---|---|
| Breakage monitor: **JobPilot dashboard breakage** | Created | Recordings that visited `/dashboard`, the destination after successful sign-in and therefore the key completion flow. | 0.5 | 0 observations/month; 0 credits/month at creation. |
| Frustration monitor: **JobPilot user frustration** | Created | Recordings containing `$rageclick` only; intentionally not URL-scoped to keep it distinct from the breakage monitor. | 1.0 | 0 observations/month; 0 credits/month at creation. |

The organization has 2,500 Replay Vision credits remaining and is not exhausted. No session recordings existed during setup, so both scanners are armed and will start working when recordings begin.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so the enabled Support ticket responder has ticket data to process.
- [ ] Generate real browser activity and confirm Session Replay recordings are arriving; the two Replay Vision scanners will then start observing matching sessions.
- [ ] Reauthorize the PostHog MCP connection with `property_definition:read` if you want future custom-scout work to validate the live event schema directly.

## Files modified or created

- Created `posthog-self-driving-report.md`.
- No application source files were modified.

## What happens next

The scout coordinator picks up fresh configs within about 30 minutes. Scout runs draw from the verified daily budget, reports are clustered in the [Self-driving inbox](https://us.posthog.com/project/610032/inbox), and immediately actionable findings can start coding tasks.

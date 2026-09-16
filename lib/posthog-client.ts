import posthog from "posthog-js";

export function isPostHogConfigured(): boolean {
  return Boolean(
    (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
      process.env.NEXT_PUBLIC_POSTHOG_KEY) &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST,
  );
}

export function initPostHog(): void {
  const projectToken =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
    process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!projectToken || !host) {
    return;
  }

  posthog.init(projectToken, {
    api_host: host,
    defaults: "2026-05-30",
  });
}

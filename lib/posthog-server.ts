import "server-only";

import { PostHog } from "posthog-node";

export function createPostHogServer(): PostHog | null {
  const posthogToken =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
    process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!posthogToken || !posthogHost) {
    return null;
  }

  return new PostHog(posthogToken, {
    host: posthogHost,
    flushAt: 1,
    flushInterval: 0,
  });
}

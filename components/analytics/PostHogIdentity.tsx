"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

import { isPostHogConfigured } from "@/lib/posthog-client";

type PostHogIdentityProps = {
  email: string;
  name?: string;
  userId: string;
};

export function PostHogIdentity({ email, name, userId }: PostHogIdentityProps) {
  useEffect(() => {
    if (!isPostHogConfigured()) {
      return;
    }

    const identifiedUserId = posthog.get_property("$user_id");
    if (identifiedUserId && identifiedUserId !== userId) {
      posthog.reset();
    }

    posthog.identify(userId, {
      email,
      ...(name ? { name } : {}),
    });

    return () => {
      posthog.reset();
    };
  }, [email, name, userId]);

  return null;
}

"use server";

import { createAuthActions } from "@insforge/sdk/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const OAUTH_VERIFIER_COOKIE = "insforge_code_verifier";

type OAuthProvider = "google" | "github";

async function getAppOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("[startOAuth] Unable to determine the application URL.");
  }

  return `${protocol}://${host}`;
}

export async function startOAuth(provider: OAuthProvider) {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const redirectTo = new URL("/callback", await getAppOrigin()).toString();
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo,
    skipBrowserRedirect: true,
  });

  if (error || !data?.url || !data.codeVerifier) {
    console.error("[startOAuth] Unable to start OAuth flow", {
      provider,
      code: error?.error,
      statusCode: error?.statusCode,
    });
    redirect("/login?error=oauth_start");
  }

  cookieStore.set(OAUTH_VERIFIER_COOKIE, data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(data.url);
}

export async function signOut() {
  const auth = createAuthActions({ cookies: await cookies() });
  const { error } = await auth.signOut();

  if (error) {
    console.error("[signOut] Unable to end session", {
      code: error.error,
      statusCode: error.statusCode,
    });
    redirect("/dashboard?error=sign_out");
  }

  redirect("/");
}

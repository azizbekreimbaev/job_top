import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata: Metadata = {
  title: "Sign in — JobPilot",
  description: "Sign in to continue to JobPilot.",
};

const errorMessages: Record<string, string> = {
  oauth: "We couldn’t complete that sign-in. Please try again.",
  oauth_start: "We couldn’t connect to that provider. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? errorMessages[error] : undefined;

  return (
    <main className="marketing-glow flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
      <section className="w-full max-w-md border border-border bg-surface px-6 py-8 sm:px-10 sm:py-10">
        <Link
          href="/"
          aria-label="JobPilot home"
          className="mx-auto block w-fit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Image src="/logo.png" alt="JobPilot" width={124} height={42} priority />
        </Link>

        <div className="mt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-slate">
            Sign in to JobPilot
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Continue with the account you use for your job search.
          </p>
        </div>

        {message ? (
          <p
            role="alert"
            className="mt-6 border border-error bg-surface-secondary px-4 py-3 text-sm text-text-dark"
          >
            {message}
          </p>
        ) : null}

        <div className="mt-8">
          <OAuthButtons />
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-text-muted">
          By continuing, you agree to use JobPilot responsibly.
        </p>
      </section>
    </main>
  );
}

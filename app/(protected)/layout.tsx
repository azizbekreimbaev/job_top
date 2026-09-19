import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { signOut } from "@/actions/auth";
import { ApplicationNavigation } from "@/components/layout/ApplicationNavigation";
import { ProtectedIdentity } from "@/components/layout/ProtectedIdentity";

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="JobPilot home" className="shrink-0">
            <Image src="/logo.png" alt="JobPilot" width={124} height={42} />
          </Link>

          <ApplicationNavigation />

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-dark transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <Suspense>
        <ProtectedIdentity />
      </Suspense>
      {children}
    </div>
  );
}

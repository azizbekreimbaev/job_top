import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/actions/auth";
import { PostHogIdentity } from "@/components/analytics/PostHogIdentity";
import { ApplicationNavigation } from "@/components/layout/ApplicationNavigation";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user) {
    if (error) {
      console.error("[ProtectedLayout] Session verification failed", {
        code: error.error,
        statusCode: error.statusCode,
      });
    }
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <PostHogIdentity
        userId={data.user.id}
        email={data.user.email}
        name={data.user.profile?.name}
      />
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
      {children}
    </div>
  );
}

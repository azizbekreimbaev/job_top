import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/actions/auth";
import { createInsforgeServer } from "@/lib/insforge-server";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

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
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/dashboard" aria-label="JobPilot dashboard" className="shrink-0">
            <Image src="/logo.png" alt="JobPilot" width={124} height={42} />
          </Link>

          <nav aria-label="Application navigation" className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-text-dark transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-dark transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}

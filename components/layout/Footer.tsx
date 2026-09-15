import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="px-4 sm:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 border-x border-t border-border px-6 py-10 sm:flex-row sm:justify-between sm:px-10">
        <Link href="/" aria-label="JobPilot home">
          <Image src="/logo.png" alt="JobPilot" width={124} height={42} />
        </Link>
        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          <Link href="/dashboard" className="text-sm font-medium text-text-dark hover:text-accent">
            Dashboard
          </Link>
          <Link href="/privacy" className="text-sm font-medium text-text-dark hover:text-accent">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm font-medium text-text-dark hover:text-accent">
            Terms &amp; Conditions
          </Link>
        </nav>
      </div>
    </footer>
  );
}

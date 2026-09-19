import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="JobPilot home" className="shrink-0">
          <Image src="/logo.png" alt="JobPilot" width={124} height={42} />
        </Link>

        <Link
          href="/login"
          className="rounded-md bg-overlay px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-text-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Start for free
        </Link>
      </div>
    </header>
  );
}

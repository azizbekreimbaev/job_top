"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function ApplicationNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Application navigation"
      className="hidden h-full items-center gap-8 md:flex"
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex h-full items-center gap-2 border-b-2 px-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive
                ? "border-accent text-accent"
                : "border-transparent text-text-dark hover:text-accent"
            }`}
          >
            {item.href === "/dashboard" ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4 fill-none stroke-current"
                strokeWidth="1.8"
              >
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
              </svg>
            ) : null}
            {item.href === "/find-jobs" ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4 fill-none stroke-current"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="6" />
                <path d="m16 16 4 4" />
              </svg>
            ) : null}
            {item.href === "/profile" ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4 fill-none stroke-current"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="3" />
                <path d="M6.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6" />
              </svg>
            ) : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

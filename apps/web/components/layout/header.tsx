"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShareButton } from "../ui/share-button";
import { ThemeSwitcher } from "../ui/theme-switcher";

const sectionHints: { test: RegExp; label: string; letter: string }[] = [
  { test: /^\/?$/, label: "Analysis", letter: "A" },
  { test: /^\/playground/, label: "Playground", letter: "B" },
  { test: /^\/(lessons|academy|budgeting)/, label: "Education", letter: "C" },
  { test: /^\/calculators/, label: "Calculators", letter: "D" },
  { test: /^\/(profile|settings)/, label: "Profile", letter: "E" },
];

function resolveSection(pathname: string | null): { label: string; letter: string } {
  if (!pathname) return sectionHints[0];
  const hit = sectionHints.find((section) => section.test.test(pathname));
  return hit ?? sectionHints[0];
}

export function Header() {
  const pathname = usePathname();

  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }

  const section = resolveSection(pathname ?? "/");

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-outline/15 bg-surface-base/95 backdrop-blur">
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-outline/20 bg-surface-card/80 px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          aria-label="Invest101 home"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary/20 text-base font-bold text-accent-primary">
            ✶
          </span>
          <span className="tracking-tight">Invest101</span>
        </Link>
        <div className="hidden flex-1 items-center gap-2 rounded-full border border-dashed border-outline/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-text-muted sm:flex">
          <span className="text-text-primary">{section.letter}</span>
          <span className="text-text-secondary">{section.label} View</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <ShareButton className="hidden sm:inline-flex" />
          <ThemeSwitcher className="max-w-[14rem]" />
        </div>
      </div>
    </header>
  );
}

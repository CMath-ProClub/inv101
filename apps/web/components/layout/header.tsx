"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShareButton } from "../ui/share-button";
import { ThemeSwitcher } from "../ui/theme-switcher";

export function Header() {
  const pathname = usePathname();

  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b border-outline/30 shadow-[0_12px_32px_-12px_rgba(8,15,35,0.45)] backdrop-blur supports-[backdrop-filter]:backdrop-blur"
      style={{
        background:
          "linear-gradient(115deg, rgba(var(--surface-card), 0.96), rgba(var(--surface-elevated), 0.92))",
      }}
    >
      <div className="flex h-[var(--header-height)] w-full items-center gap-6 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-full border border-outline/30 bg-surface-card/90 px-4 py-2 text-sm font-semibold text-text-primary shadow-card transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            aria-label="Invest101 home"
          >
            <span className="text-base font-bold tracking-tight">Invest101</span>
            <span className="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--accent-primary))]"
              style={{ backgroundColor: "rgba(var(--accent-primary), 0.12)" }}
            >
              Live
            </span>
          </Link>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-semibold text-text-primary">
              Market pilot workspace
            </span>
            <span className="text-xs font-medium text-text-secondary">
              Simulator · AI coach · Trading battles
            </span>
          </div>
        </div>
        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-outline/30 bg-surface-card/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-text-secondary shadow-card lg:flex">
            Market sync · 15 min cadence
          </div>
          <ShareButton className="hidden sm:inline-flex" />
          <ThemeSwitcher className="max-w-xs" />
        </div>
      </div>
    </header>
  );
}

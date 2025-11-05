import Link from "next/link";
import { ShareButton } from "../ui/share-button";
import { ThemeSwitcher } from "../ui/theme-switcher";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-outline/30 bg-surface-elevated/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-[0.4em] text-accent-secondary outline outline-2 outline-transparent transition hover:outline-black focus-visible:outline-black"
          >
            Invest101
          </Link>
          <span className="hidden text-sm font-medium text-text-secondary md:inline">
            Investor Intelligence Platform
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden text-xs uppercase tracking-[0.3em] text-text-muted lg:block">
            Market sync ~15 min cadence
          </div>
          <ShareButton />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

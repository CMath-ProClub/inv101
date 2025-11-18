"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShareButton } from "../ui/share-button";
import { SidebarToggle } from "./sidebar-toggle";

export function Header() {
  const pathname = usePathname();

  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-outline/30 bg-surface-elevated/95 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <SidebarToggle className="hidden lg:inline-flex" />
          <Link
            href="/"
            className="group inline-flex items-center gap-3 rounded-full border border-outline/40 bg-surface-card/80 px-3 py-1.5 text-sm font-semibold text-text-primary shadow-sm transition hover:border-accent-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            aria-label="Investing101 home"
          >
            <span className="relative flex items-center gap-2">
              <Image
                src="/investing101.png"
                alt="Investing101 brand"
                width={130}
                height={36}
                priority
                className="h-8 w-auto"
              />
            </span>
          </Link>
        </div>
        <div className="hidden flex-col text-left md:flex">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-text-muted">Investing101</p>
          <p className="text-xs font-medium text-text-secondary">Unified investing workspace</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] font-semibold text-text-muted">
          <ShareButton className="hidden sm:inline-flex border-outline/40 bg-surface-card/80 text-[11px]" />
        </div>
      </div>
    </header>
  );
}

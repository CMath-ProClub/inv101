"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

type SimpleNavItem = {
  href: Route;
  letter: "A" | "B" | "C" | "D" | "E";
  title: string;
  description: string;
};

const navItems: SimpleNavItem[] = [
  { href: "/" as Route, letter: "A", title: "Main", description: "Analysis" },
  { href: "/playground" as Route, letter: "B", title: "Playground", description: "Sims" },
  { href: "/lessons" as Route, letter: "C", title: "Education", description: "Lessons" },
  { href: "/calculators" as Route, letter: "D", title: "Calculators", description: "Tools" },
  { href: "/profile" as Route, letter: "E", title: "Profile", description: "Workspace" },
];

const storageKey = "invest101:sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAuthRoute = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setCollapsed(stored === "true");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, String(collapsed));
  }, [collapsed]);

  if (isAuthRoute) {
    return null;
  }

  const TAB_WIDTH_REM = 2.75;
  const EXPANDED_WIDTH_REM = 14;
  const panelBackground = collapsed
    ? "rgb(var(--surface-base) / 0.9)"
    : "rgb(var(--surface-card) / 0.9)";

  return (
    <aside
      className="sticky top-0 z-30 hidden h-screen shrink-0 border-r border-outline/15 bg-surface-card/80 px-3 pt-[var(--header-height)] transition-[width] duration-200 lg:flex"
      style={{ width: `${collapsed ? TAB_WIDTH_REM : EXPANDED_WIDTH_REM}rem` }}
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          "flex w-[11rem] flex-1 flex-col gap-6",
          collapsed && "items-center"
        )}
        style={{ background: panelBackground }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="mt-4 inline-flex h-8 w-12 items-center justify-center rounded-md border border-outline/30 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
        >
          []
        </button>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const content = (
              <>
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border text-base font-bold",
                    active
                      ? "border-accent-primary text-accent-primary"
                      : "border-outline/40 text-text-secondary",
                  )}
                >
                  {item.letter}
                </span>
                {!collapsed && (
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-text-primary">{item.title}</span>
                    <span className="text-xs uppercase tracking-[0.35em] text-text-muted">
                      {item.description}
                    </span>
                  </div>
                )}
              </>
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border border-outline/20 px-3 py-3 text-sm font-semibold shadow-sm transition hover:border-accent-primary/50",
                  active && "border-accent-primary/70 bg-accent-primary/5",
                  collapsed && "justify-center"
                )}
                aria-current={active ? "page" : undefined}
                title={collapsed ? `${item.letter} · ${item.title}` : undefined}
              >
                {content}
              </Link>
            );
          })}
        </nav>
        {!collapsed && (
          <p className="pb-6 text-center text-[10px] text-text-muted">
            A · B · C · D · E mirrors the provided prototype map for instant recall.
          </p>
        )}
      </div>
    </aside>
  );
}

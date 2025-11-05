"use client";

import {
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Compass,
  GraduationCap,
  Home,
  LineChart,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

type NavItem = {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/" as Route, label: "Home", icon: Home },
  { href: "/market" as Route, label: "Market", icon: LineChart },
  { href: "/portfolio" as Route, label: "Portfolio", icon: Briefcase },
  { href: "/research" as Route, label: "Research", icon: Compass },
  { href: "/lessons" as Route, label: "Lessons", icon: GraduationCap },
  { href: "/academy" as Route, label: "Academy", icon: BookOpen },
  { href: "/settings" as Route, label: "Settings", icon: Settings2 },
];

const storageKey = "invest101:sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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

  const TAB_WIDTH_REM = 1.75;
  const EXPANDED_WIDTH_REM = 18;
  const collapsedStyle = collapsed
    ? { transform: `translateX(calc(-100% + ${TAB_WIDTH_REM}rem))` }
    : undefined;

  return (
    <div
      className="relative hidden shrink-0 lg:flex"
      style={{ width: `${collapsed ? TAB_WIDTH_REM : EXPANDED_WIDTH_REM}rem` }}
      aria-label="Primary navigation"
    >
      <aside
        className={cn(
          "sticky top-0 z-30 flex h-screen w-[18rem] flex-col border-r border-outline/20 bg-surface-elevated/80 px-3 backdrop-blur transition-transform duration-300 ease-out supports-[backdrop-filter]:backdrop-blur",
        )}
        style={collapsedStyle}
      >
        <nav className="flex-1 space-y-2 overflow-y-auto pt-[var(--header-height)] pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-sm font-semibold text-text-secondary outline outline-2 outline-transparent transition hover:outline-black focus-visible:outline-black",
                  active &&
                    "bg-surface-card/80 text-text-primary outline-black shadow-card",
                )}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                data-active={active}
              >
                <Icon className="h-5 w-5 text-accent-primary" aria-hidden="true" />
                <span className={cn("truncate", collapsed ? "sr-only" : "block")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="absolute top-1/2 right-[-0.625rem] z-40 flex h-16 w-7 -translate-y-1/2 items-center justify-center rounded-r-2xl border border-outline/40 bg-surface-muted/70 text-text-secondary shadow-card transition hover:border-accent-primary/60 hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

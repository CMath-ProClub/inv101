"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import {
  Calculator,
  GraduationCap,
  LayoutDashboard,
  LucideIcon,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { readSidebarPreference, SIDEBAR_EVENT, type SidebarEventDetail } from "./sidebar-state";

type SimpleNavItem = {
  href: Route;
  title: string;
  description: string;
  icon: LucideIcon;
};

const navItems: SimpleNavItem[] = [
  {
    href: "/" as Route,
    title: "Analysis",
    description: "Command desk",
    icon: LayoutDashboard,
  },
  {
    href: "/playground" as Route,
    title: "Playground",
    description: "Simulators",
    icon: Trophy,
  },
  {
    href: "/lessons" as Route,
    title: "Education",
    description: "Lessons",
    icon: GraduationCap,
  },
  {
    href: "/calculators" as Route,
    title: "Calculators",
    description: "Tools",
    icon: Calculator,
  },
  {
    href: "/profile" as Route,
    title: "Profile",
    description: "Workspace",
    icon: UserCircle2,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAuthRoute = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  useEffect(() => {
    setCollapsed(readSidebarPreference(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleState = (event: Event) => {
      const detail = (event as CustomEvent<SidebarEventDetail>).detail;
      if (typeof detail?.collapsed === "boolean") {
        setCollapsed(detail.collapsed);
      }
    };

    window.addEventListener(SIDEBAR_EVENT, handleState as EventListener);
    return () => window.removeEventListener(SIDEBAR_EVENT, handleState as EventListener);
  }, []);

  if (isAuthRoute) {
    return null;
  }

  const EXPANDED_WIDTH_REM = 15;
  const computedWidth = collapsed ? "0rem" : `${EXPANDED_WIDTH_REM}rem`;

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-screen shrink-0 border-r border-outline/20 bg-surface-elevated/95 pt-[var(--header-height)] shadow-[8px_0_35px_rgba(5,10,25,0.25)] transition-all duration-300 lg:flex",
          collapsed && "pointer-events-none opacity-0",
        )}
        style={{ width: computedWidth }}
        aria-label="Primary navigation"
        aria-hidden={collapsed}
      >
        <div className="flex w-full flex-1 flex-col gap-5 overflow-hidden px-4">
          <nav className="flex-1 space-y-3 pt-6">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-3xl border border-outline/30 bg-surface-card/85 px-3 py-3 text-sm font-semibold text-text-secondary shadow-sm transition hover:-translate-y-0.5 hover:border-accent-primary/30 hover:text-text-primary",
                    active && "border-accent-primary/60 bg-[radial-gradient(circle_at_top_left,rgba(var(--accent-primary),0.18),rgba(var(--surface-card),0.92))] text-text-primary",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,rgba(var(--accent-secondary),0.22),rgba(var(--surface-card),0.85))] text-accent-primary shadow-inner">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-text-primary">{item.title}</span>
                    <span className="text-xs uppercase tracking-[0.4em] text-text-muted">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="mb-6 rounded-3xl border border-dashed border-outline/30 bg-surface-card/80 p-4 text-center text-[10px] font-semibold uppercase tracking-[0.35em] text-text-muted">
            Investing101 · Unified Workspace
          </div>
        </div>
      </aside>
    </>
  );
}

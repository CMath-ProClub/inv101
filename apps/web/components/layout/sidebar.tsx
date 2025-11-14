"use client";

import {
  BookOpen,
  Bot,
  Briefcase,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Compass,
  Gamepad2,
  GraduationCap,
  Home,
  LineChart,
  Settings2,
  Swords,
  Target,
  Trophy,
  UserCircle,
  Wallet,
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

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Information & Analysis",
    items: [
      { href: "/" as Route, label: "Home", icon: Home },
      { href: "/market" as Route, label: "Market", icon: LineChart },
      { href: "/portfolio" as Route, label: "Portfolio", icon: Briefcase },
      { href: "/research" as Route, label: "Research", icon: Compass },
    ],
  },
  {
    title: "Playground",
    items: [
      { href: "/playground" as Route, label: "Playground Hub", icon: Gamepad2 },
      { href: "/playground/simulator" as Route, label: "Market Simulator", icon: Target },
      { href: "/playground/ai-toolkit" as Route, label: "AI Toolkit", icon: Bot },
      { href: "/playground/trading-battles" as Route, label: "Trading Battles", icon: Swords },
      { href: "/playground/achievements" as Route, label: "Achievements", icon: Trophy },
    ],
  },
  {
    title: "Planning",
    items: [{ href: "/budgeting" as Route, label: "Budgeting Lab", icon: Wallet }],
  },
  {
    title: "Education",
    items: [
      { href: "/lessons" as Route, label: "Education", icon: GraduationCap },
      { href: "/academy" as Route, label: "Academy", icon: BookOpen },
    ],
  },
  {
    title: "Calculators",
    items: [{ href: "/calculators" as Route, label: "Calculator Hub", icon: Calculator }],
  },
  {
    title: "Workspace",
    items: [
      { href: "/profile" as Route, label: "Profile", icon: UserCircle },
      { href: "/settings" as Route, label: "Settings", icon: Settings2 },
    ],
  },
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

  const TAB_WIDTH_REM = 1.75;
  const EXPANDED_WIDTH_REM = 18;
  const collapsedStyle = collapsed
    ? { transform: `translateX(calc(-100% + ${TAB_WIDTH_REM}rem))` }
    : undefined;

  const panelBackground =
    "linear-gradient(180deg, rgba(var(--surface-card), 0.97), rgba(var(--surface-base), 0.92))";
  const panelStyle = collapsedStyle ? { ...collapsedStyle, background: panelBackground } : { background: panelBackground };

  return (
    <div
      className="relative hidden shrink-0 lg:flex"
      style={{ width: `${collapsed ? TAB_WIDTH_REM : EXPANDED_WIDTH_REM}rem` }}
      aria-label="Primary navigation"
    >
      <aside
        className={cn(
          "sticky top-0 z-30 flex h-screen w-[18rem] flex-col border-r border-outline/30 px-4 shadow-[12px_0_34px_-24px_rgba(5,10,25,0.55)] backdrop-blur-lg transition-transform duration-300 ease-out",
        )}
        style={panelStyle}
      >
        <div className="pt-[calc(var(--header-height)+0.75rem)] pb-4">
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.6em] text-text-muted",
              collapsed && "sr-only",
            )}
          >
            Navigation
          </p>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto pb-8">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p
                className={cn(
                  "px-3 text-[11px] font-semibold uppercase tracking-[0.45em] text-text-muted",
                  collapsed && "sr-only",
                )}
              >
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isRoot = item.href === ("/" as Route);
                  const active = isRoot
                    ? pathname === item.href
                    : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-3xl border border-outline/30 bg-surface-card/70 px-4 py-3 text-sm font-semibold text-text-secondary shadow-[0_18px_35px_rgba(5,10,25,0.22)] outline outline-2 outline-transparent transition hover:-translate-y-0.5 hover:border-accent-primary/40 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary",
                        active &&
                          "text-text-primary border-accent-primary/50 shadow-[0_28px_45px_rgba(5,10,25,0.32)]",
                      )}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      data-active={active}
                      style={
                        active
                          ? {
                              background:
                                "linear-gradient(110deg, rgba(var(--surface-card), 0.96), rgba(var(--surface-elevated), 0.9))",
                            }
                          : undefined
                      }
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: active
                            ? "rgba(var(--accent-primary), 0.95)"
                            : "rgba(var(--accent-primary), 0.15)",
                          color: active ? "rgb(var(--surface-card))" : "rgb(var(--accent-primary))",
                        }}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className={cn("truncate", collapsed ? "sr-only" : "block")}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="absolute top-1/2 right-[-0.625rem] z-40 flex h-16 w-7 -translate-y-1/2 items-center justify-center rounded-r-2xl border border-outline/30 bg-surface-card/90 text-text-secondary shadow-[0_10px_32px_rgba(5,10,25,0.25)] transition hover:-translate-y-[calc(50%-4px)] hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
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

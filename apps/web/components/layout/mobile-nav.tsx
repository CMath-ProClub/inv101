"use client";

import {
  Calculator,
  Gamepad2,
  GraduationCap,
  Home,
  LineChart,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

type NavItem = {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/" as Route, label: "Home", icon: Home },
  { href: "/market" as Route, label: "Market", icon: LineChart },
  { href: "/playground" as Route, label: "Play", icon: Gamepad2 },
  { href: "/lessons" as Route, label: "Education", icon: GraduationCap },
  { href: "/calculators" as Route, label: "Calc", icon: Calculator },
  { href: "/profile" as Route, label: "Profile", icon: UserCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-20 items-center justify-around border-t border-outline/30 bg-surface-card/90 shadow-[0_-20px_40px_rgba(5,10,25,0.55)] backdrop-blur supports-[backdrop-filter]:backdrop-blur lg:hidden">
      {navItems.map((item) => {
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
              "flex h-16 w-14 flex-col items-center justify-center gap-1 rounded-2xl border border-outline/30 bg-surface-card/70 text-[11px] font-semibold text-text-secondary shadow-[0_15px_30px_rgba(5,10,25,0.22)] outline outline-2 outline-transparent transition hover:-translate-y-0.5 hover:border-accent-primary/40 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary",
              active && "text-text-primary border-accent-primary/60",
            )}
            aria-current={active ? "page" : undefined}
            style={
              active
                ? {
                    background:
                      "linear-gradient(180deg, rgba(var(--surface-card), 0.96), rgba(var(--surface-elevated), 0.92))",
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
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

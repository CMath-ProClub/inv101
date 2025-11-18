"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Calculator, GraduationCap, LayoutDashboard, LucideIcon, Trophy, UserCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

type NavItem = {
  href: Route;
  label: string;
  description: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/" as Route, label: "Analysis", description: "Command", icon: LayoutDashboard },
  { href: "/playground" as Route, label: "Playground", description: "Sim", icon: Trophy },
  { href: "/lessons" as Route, label: "Education", description: "Learn", icon: GraduationCap },
  { href: "/calculators" as Route, label: "Calculators", description: "Tools", icon: Calculator },
  { href: "/profile" as Route, label: "Profile", description: "You", icon: UserCircle2 },
];

export function MobileNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-20 items-center justify-around border-t border-outline/40 bg-surface-elevated/95 shadow-[0_-25px_40px_rgba(5,10,25,0.3)] backdrop-blur supports-[backdrop-filter]:backdrop-blur lg:hidden">
      {navItems.map((item) => {
        const isRoot = item.href === ("/" as Route);
        const active = isRoot
          ? pathname === item.href
          : pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl border border-outline/40 bg-surface-card/90 text-[11px] font-semibold text-text-secondary shadow-[0_15px_30px_rgba(5,10,25,0.35)] outline outline-2 outline-transparent transition hover:-translate-y-0.5 hover:border-accent-primary/40 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary",
              active && "text-text-primary border-accent-primary/60",
            )}
            aria-current={active ? "page" : undefined}
            style={
              active
                ? {
                    background:
                      "linear-gradient(180deg, rgba(var(--surface-card),0.95), rgba(var(--surface-muted), 0.85))",
                  }
                : undefined
            }
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border"
              style={{
                borderColor: active
                  ? "rgba(var(--accent-primary), 0.7)"
                  : "rgba(var(--outline-color), 0.4)",
                color: active ? "rgb(var(--accent-primary))" : undefined,
              }}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-[10px] text-center leading-3">
              {item.label}
              <br />
              <span className="text-[9px] font-normal text-text-muted">{item.description}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

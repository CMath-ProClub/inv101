"use client";

import {
  BookOpen,
  Briefcase,
  Compass,
  GraduationCap,
  Home,
  LineChart,
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
  { href: "/portfolio" as Route, label: "Portfolio", icon: Briefcase },
  { href: "/research" as Route, label: "Research", icon: Compass },
  { href: "/lessons" as Route, label: "Lessons", icon: GraduationCap },
  { href: "/academy" as Route, label: "Academy", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-20 items-center justify-around border-t border-outline/30 bg-surface-elevated/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-16 w-14 flex-col items-center justify-center gap-1 rounded-2xl border border-transparent text-xs font-semibold text-text-secondary outline outline-2 outline-transparent transition hover:outline-black focus-visible:outline-black",
              active && "bg-surface-card/80 text-text-primary outline-black shadow-card",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-5 w-5 text-accent-primary" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

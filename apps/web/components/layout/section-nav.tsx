import Link from "next/link";
import type { Route } from "next";
import type { ComponentType } from "react";
import { cn } from "../../lib/utils";

export type SectionNavStatus = "live" | "beta" | "soon";

export type SectionNavItem = {
  title: string;
  description?: string;
  href: Route;
  status?: SectionNavStatus;
  icon?: ComponentType<{ className?: string }>;
};

interface SectionNavProps {
  items: SectionNavItem[];
  columns?: 2 | 3 | 4;
  dense?: boolean;
  className?: string;
}

const statusLabels: Record<Exclude<SectionNavStatus, "live">, string> = {
  beta: "Beta",
  soon: "Soon",
};

export function SectionNav({ items, columns = 3, dense = false, className }: SectionNavProps) {
  const columnClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid grid-cols-1 gap-4", columnClass, className)}>
      {items.map((item) => (
        <Link
          key={`${item.href}-${item.title}`}
          href={item.href}
          className={cn(
            "group flex items-center gap-3 rounded-3xl border border-outline/30 bg-surface-card/95 px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent-primary/50",
            dense && "px-2 py-2.5",
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_top,rgba(var(--accent-secondary),0.25),rgba(var(--surface-card),0.85))] text-base font-bold text-accent-primary shadow-inner">
            {item.icon ? (
              <item.icon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-accent-primary" aria-hidden="true" />
            )}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary">{item.title}</span>
            {item.description && (
              <span className="text-xs text-text-muted">{item.description}</span>
            )}
            {item.status && item.status !== "live" && (
              <span className="mt-1 inline-flex w-fit items-center rounded-full border border-outline/40 bg-surface-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-text-muted">
                {statusLabels[item.status]}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

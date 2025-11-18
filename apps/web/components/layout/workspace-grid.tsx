import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

export type WorkspaceNavHref = Route | { pathname: Route; hash?: string };

export type WorkspaceNavItem = {
  title: string;
  helper?: string;
  description?: string;
  href: WorkspaceNavHref;
  icon: LucideIcon;
  accent?: string;
  span?: string;
  meta?: string;
};

interface WorkspaceGridProps {
  items: WorkspaceNavItem[];
  className?: string;
}

export function WorkspaceGrid({ items, className }: WorkspaceGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 md:grid-cols-6 md:auto-rows-[minmax(160px,1fr)] md:grid-flow-dense",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={`${item.title}-${typeof item.href === "string" ? item.href : item.href.pathname}`}
          href={item.href}
          className={cn(
            "group flex h-full flex-col rounded-3xl border border-outline/30 bg-surface-card/95 p-4 text-left shadow-card transition hover:-translate-y-0.5",
            item.span ?? "md:col-span-3",
          )}
        >
          {item.helper ? (
            <span className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-outline/30 bg-surface-card/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-text-muted">
              {item.helper}
            </span>
          ) : null}
          <div className="flex flex-1 flex-col">
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl border border-outline/30 text-lg font-semibold text-text-primary",
                  item.accent ?? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),rgba(0,0,0,0))]",
                )}
              >
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xl font-semibold text-text-primary">{item.title}</p>
                  {item.meta ? (
                    <span className="rounded-full border border-outline/40 bg-surface-muted/60 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-text-muted">
                      {item.meta}
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="text-sm text-text-secondary">{item.description}</p>
                ) : null}
              </div>
              <ArrowUpRight className="h-5 w-5 text-accent-primary transition group-hover:translate-x-1 group-hover:text-accent-secondary" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

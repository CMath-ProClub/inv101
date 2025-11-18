import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface SimpleBoardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
}

export function SimpleBoard({ title, subtitle, badge, children, className }: SimpleBoardProps) {
  return (
    <section
      className={cn(
        "relative isolate space-y-4 overflow-hidden rounded-3xl border border-outline/30 bg-surface-card/95 p-6 shadow-[0_25px_55px_rgba(5,10,25,0.22)] backdrop-blur supports-[backdrop-filter]:backdrop-blur",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 -z-10 h-28 -translate-y-1/2 rounded-3xl bg-gradient-to-r from-accent-secondary/20 via-accent-tertiary/25 to-accent-primary/20 blur-3xl" />
      <header className="space-y-1">
        {badge && (
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">{badge}</p>
        )}
        <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

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
        "space-y-4 rounded-3xl border border-outline/15 bg-surface-base/60 p-6 shadow-[0_18px_35px_rgba(5,10,25,0.2)]",
        className,
      )}
    >
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

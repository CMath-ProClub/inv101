import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

export type SimpleTileTone = "default" | "accent" | "contrast" | "info";

export type SimpleTileAction = {
  label: string;
  href: string;
  external?: boolean;
};

interface SimpleTileProps {
  label?: string;
  title: string;
  description?: string;
  tone?: SimpleTileTone;
  action?: SimpleTileAction;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const toneClasses: Record<SimpleTileTone, string> = {
  default: "border-outline/25 bg-surface-card/70",
  accent: "border-accent-primary/40 bg-accent-primary/10",
  contrast: "border-outline/40 bg-surface-muted/60",
  info: "border-outline/25 bg-surface-base/70",
};

export function SimpleTile({
  label,
  title,
  description,
  tone = "default",
  action,
  footer,
  children,
  className,
}: SimpleTileProps) {
  const content = (
    <div
      className={cn(
        "flex h-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5",
        toneClasses[tone],
        className,
      )}
    >
      <div className="space-y-1">
        {label && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-text-muted">
            {label}
          </p>
        )}
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="text-sm text-text-secondary">{description}</p>}
      </div>
      {children}
      {action && (
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-primary">
          {action.label}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      {footer && <div className="mt-auto text-xs text-text-muted">{footer}</div>}
    </div>
  );

  if (action?.href) {
    if (action.external) {
      return (
        <a href={action.href} target="_blank" rel="noreferrer" className="block">
          {content}
        </a>
      );
    }
    return (
      <Link href={action.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

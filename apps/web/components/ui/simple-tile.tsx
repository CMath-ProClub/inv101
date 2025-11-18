import Link from "next/link";
import type { Route } from "next";
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
  visual?: ReactNode;
  className?: string;
}

const toneClasses: Record<SimpleTileTone, string> = {
  default: "border-outline/40 bg-surface-card/95",
  accent:
    "border-accent-primary/40 bg-[radial-gradient(circle_at_top,rgba(var(--accent-primary),0.18),rgba(var(--surface-card),0.9))]",
  contrast:
    "border-accent-tertiary/40 bg-[radial-gradient(circle_at_top,rgba(var(--accent-tertiary),0.22),rgba(var(--surface-card),0.92))]",
  info:
    "border-accent-secondary/40 bg-[radial-gradient(circle_at_top,rgba(var(--accent-secondary),0.2),rgba(var(--surface-card),0.92))]",
};

const toneVisualGradients: Record<SimpleTileTone, string> = {
  default: "linear-gradient(145deg, rgba(var(--surface-muted), 0.65), rgba(var(--surface-card), 0.85))",
  accent: "linear-gradient(145deg, rgba(var(--accent-primary), 0.22), rgba(var(--surface-card), 0.85))",
  contrast: "linear-gradient(145deg, rgba(var(--accent-tertiary), 0.25), rgba(var(--surface-card), 0.85))",
  info: "linear-gradient(145deg, rgba(var(--accent-secondary), 0.25), rgba(var(--surface-card), 0.85))",
};

const toneVisualDot: Record<SimpleTileTone, string> = {
  default: "bg-[rgb(var(--accent-primary))]",
  accent: "bg-[rgb(var(--accent-primary))]",
  contrast: "bg-[rgb(var(--accent-tertiary))]",
  info: "bg-[rgb(var(--accent-secondary))]",
};

const toneVisualStrokeColor: Record<SimpleTileTone, string> = {
  default: "rgb(var(--accent-primary))",
  accent: "rgb(var(--accent-primary))",
  contrast: "rgb(var(--accent-tertiary))",
  info: "rgb(var(--accent-secondary))",
};

export function SimpleTile({
  label,
  title,
  description,
  tone = "default",
  action,
  footer,
  children,
  visual,
  className,
}: SimpleTileProps) {
  const resolvedVisual = visual ?? (
    <DefaultVisual seed={`${title}-${label ?? ""}`} tone={tone} />
  );

  const content = (
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-3xl border px-4 py-5 text-left shadow-sm transition hover:-translate-y-0.5",
        toneClasses[tone],
        className,
      )}
    >
      <div className="relative">{resolvedVisual}</div>
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
    const internalHref = action.href as Route;
    return (
      <Link href={internalHref} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function DefaultVisual({ seed, tone }: { seed: string; tone: SimpleTileTone }) {
  const points = buildSparkline(seed);

  return (
    <div
      className="relative h-28 w-full overflow-hidden rounded-2xl border border-outline/20"
      style={{ backgroundImage: toneVisualGradients[tone] }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 64" className="h-full w-full">
        <polyline
          points={points}
          className="fill-none stroke-[2.5]"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: toneVisualStrokeColor[tone] }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0">
        <div className={cn("absolute bottom-1 right-3 h-3 w-3 rounded-full", toneVisualDot[tone])} />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(var(--surface-card), 0.65), transparent)" }}
        />
      </div>
    </div>
  );
}

function buildSparkline(seed: string) {
  const sanitizedSeed = seed || "investing101";
  let hash = 0;
  for (const char of sanitizedSeed) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997;
  }

  const points: string[] = [];
  for (let index = 0; index < 8; index += 1) {
    hash = (hash * 31 + index * 17) % 997;
    const x = (index / 7) * 100;
    const y = 50 - (hash / 997) * 30;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return points.join(" ");
}

"use client";

import { WifiOff } from "lucide-react";
import { useId, useMemo } from "react";
import { cn } from "../../lib/utils";

type SparklineStatus = "ready" | "loading" | "offline";

type SparklineProps = {
  changePercent?: number | null;
  points?: number[];
  status?: SparklineStatus;
  className?: string;
  label?: string;
};

function buildSeries(changePercent?: number | null, length = 16) {
  const change = typeof changePercent === "number" ? changePercent : 0;
  const base = Math.max(-8, Math.min(8, change));
  return Array.from({ length }, (_, index) => {
    const progress = index / Math.max(1, length - 1);
    const wave = Math.sin(progress * Math.PI);
    const drift = base >= 0 ? progress * (base / 6) : (1 - progress) * (base / 6);
    return wave * (base / 2 || 0.75) + drift;
  });
}

function toPointString(values: number[]) {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  });
  return coords.join(" ");
}

export function Sparkline({
  changePercent,
  points,
  status = "ready",
  className,
  label,
}: SparklineProps) {
  const data = useMemo(() => {
    if (points && points.length) return points;
    return buildSeries(changePercent);
  }, [points, changePercent]);

  const pointString = useMemo(() => toPointString(data), [data]);
  const gradientId = useId();
  const hasPoints = pointString.length > 0;

  return (
    <div
      className={cn(
        "relative flex h-12 w-24 items-center justify-center overflow-hidden rounded-xl border border-outline/20 bg-surface-muted/60",
        className,
      )}
      aria-label={label}
      role="img"
    >
      {status === "offline" ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] font-semibold text-text-muted">
          <WifiOff className="h-4 w-4 text-accent-secondary" aria-hidden="true" />
          Offline
        </div>
      ) : status === "loading" ? (
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.25),_transparent_60%)]" />
      ) : hasPoints ? (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full text-accent-primary"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={`rgb(var(--accent-primary) / 0.35)`} />
              <stop offset="100%" stopColor={`rgb(var(--accent-primary) / 0.05)`} />
            </linearGradient>
          </defs>
          <polyline
            points={pointString}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polygon
            points={`${pointString} 100,100 0,100`}
            fill={`url(#${gradientId})`}
            opacity={0.7}
          />
        </svg>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-text-muted">
          Awaiting data
        </div>
      )}
      {label ? (
        <span className="sr-only">{label}</span>
      ) : null}
    </div>
  );
}

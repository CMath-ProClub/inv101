import { BarChart3, Layers, Scale, ScrollText, Sparkles } from "lucide-react";
import type { Route } from "next";

import { WelcomeBanner } from "../components/layout/welcome-banner";
import { WorkspaceGrid, type WorkspaceNavItem } from "../components/layout/workspace-grid";

const navButtons: WorkspaceNavItem[] = [
  {
    title: "Market Analyzer",
    helper: "Live scanners",
    description: "Heatmaps, sector breadth, and alerting wired directly to the prototype feeds.",
    href: { pathname: "/market" as Route, hash: "analyzer" },
  accent: "bg-gradient-to-br from-sky-500/25 via-transparent to-surface-card/90",
    span: "md:col-span-4 md:row-span-2",
    icon: BarChart3,
  },
  {
    title: "Stock Recommendations",
    helper: "Signals desk",
    description: "AI-assisted filings plus conviction scoring.",
    href: { pathname: "/research" as Route, hash: "recommendations" },
  accent: "bg-gradient-to-br from-fuchsia-500/25 via-transparent to-surface-card/95",
    span: "md:col-span-2 md:row-span-2",
    icon: Sparkles,
  },
  {
    title: "Stock Analysis",
    helper: "Story cards",
    description: "Academy-grade breakdowns tied to lesson checkpoints.",
    href: { pathname: "/academy" as Route, hash: "stock-analysis" },
  accent: "bg-gradient-to-br from-indigo-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
    icon: ScrollText,
  },
  {
    title: "Index Comparison",
    helper: "Benchmarks",
    description: "Portfolio stackups and drift tracking.",
    href: { pathname: "/portfolio" as Route, hash: "index-comparison" },
  accent: "bg-gradient-to-br from-amber-400/25 via-transparent to-surface-card/95",
    span: "md:col-span-3",
    icon: Layers,
  },
  {
    title: "Politician Tracker",
    helper: "Public filings",
    description: "Realtime oversight synced to the profile tools.",
    href: { pathname: "/profile" as Route, hash: "politician-tracker" },
  accent: "bg-gradient-to-br from-emerald-400/25 via-transparent to-surface-card/95",
    span: "md:col-span-6",
    icon: Scale,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <WelcomeBanner />
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Analysis</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-text-primary">Investing101 command deck</h1>
            <p className="text-sm text-text-secondary">
              Every shortcut maps to a live prototype—no filler, just the five workspaces you asked for.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Always-on · synced</span>
        </div>
        <WorkspaceGrid items={navButtons} />
      </section>
    </div>
  );
}

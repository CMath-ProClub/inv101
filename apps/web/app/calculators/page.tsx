import { Metadata } from "next";
import type { Route } from "next";
import {
  Calculator as CalculatorIcon,
  Coins,
  Layers,
  PiggyBank,
  Receipt,
  Shield,
  TrendingUp,
} from "lucide-react";
import { WorkspaceGrid, type WorkspaceNavItem } from "../../components/layout/workspace-grid";

export const metadata: Metadata = {
  title: "Calculator Hub",
  description:
    "Central entry point for the calculator prototypes (core, risk, asset, retirement, tax, crypto).",
};

const calculatorNav: WorkspaceNavItem[] = [
  {
    title: "Core deck",
    helper: "Free",
    meta: "Open access",
    description: "Compound interest, ROI, and volatility basics.",
    href: "/calculators/core" as Route,
    icon: CalculatorIcon,
    accent: "bg-gradient-to-br from-sky-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-2",
  },
  {
    title: "Risk deck",
    helper: "Free",
    meta: "Open access",
    description: "Position sizing, VaR, and Kelly calculators.",
    href: "/calculators/risk" as Route,
    icon: Shield,
    accent: "bg-gradient-to-br from-amber-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-2",
  },
  {
    title: "Stock deck",
    helper: "Free",
    meta: "Open access",
    description: "Intrinsic value, dividend yield, and P/E tools.",
    href: "/calculators/stock" as Route,
    icon: TrendingUp,
    accent: "bg-gradient-to-br from-emerald-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-2",
  },
  {
    title: "Asset deck",
    helper: "Pro",
    meta: "Premium",
    description: "Rebalancer, MPT optimizer, and asset mix helper.",
    href: "/calculators/asset" as Route,
    icon: Layers,
    accent: "bg-gradient-to-br from-indigo-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Retire deck",
    helper: "Pro",
    meta: "Premium",
    description: "401(k) growth forecasts and readiness plans.",
    href: "/calculators/retire" as Route,
    icon: PiggyBank,
    accent: "bg-gradient-to-br from-rose-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Tax deck",
    helper: "Pro",
    meta: "Premium",
    description: "Capital gains and net income tax planners.",
    href: "/calculators/tax" as Route,
    icon: Receipt,
    accent: "bg-gradient-to-br from-purple-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Crypto deck",
    helper: "Pro",
    meta: "Premium",
    description: "Staking yield and mining profitability forms.",
    href: "/calculators/crypto" as Route,
    icon: Coins,
    accent: "bg-gradient-to-br from-cyan-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
];

export default function CalculatorsPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Calculators</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-text-primary">Seven calculator decks</h1>
            <p className="text-sm text-text-secondary">
              Top row stays free forever. Bottom row shows the premium decks—still clickable so you can preview flows.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Free vs. Premium</span>
        </div>
        <WorkspaceGrid items={calculatorNav} className="md:auto-rows-[minmax(180px,1fr)]" />
      </section>
    </div>
  );
}

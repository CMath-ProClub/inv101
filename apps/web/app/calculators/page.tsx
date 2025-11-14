import { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowUpRight,
  Banknote,
  BarChart2,
  Calculator,
  Coins,
  FileSpreadsheet,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export const metadata: Metadata = {
  title: "Calculator Hub",
  description:
    "Central entry point for the calculator prototypes (core, risk, asset, retirement, tax, crypto).",
};

type CalculatorCategory = {
  title: string;
  description: string;
  href: Route;
  icon: ComponentType<{ className?: string }>;
  tag: string;
};

const categories: CalculatorCategory[] = [
  {
    title: "Core",
    description: "Compound interest, ROI, and volatility calculators from calc-core*.html.",
    href: "/calculators/core" as Route,
    icon: Calculator,
    tag: "Essentials",
  },
  {
    title: "Risk",
    description: "Kelly sizing, VAR, and position sizing tools lifted from calc-risk*.html.",
    href: "/calculators/risk" as Route,
    icon: ShieldCheck,
    tag: "Risk",
  },
  {
    title: "Stock",
    description: "DCF, dividend yield, and intrinsic value panes from calc-stock*.html.",
    href: "/calculators/stock" as Route,
    icon: BarChart2,
    tag: "Equity",
  },
  {
    title: "Asset",
    description: "Allocation optimizers referencing calc-asset*.html and calc-asset-allocation.html.",
    href: "/calculators/asset" as Route,
    icon: FileSpreadsheet,
    tag: "Allocation",
  },
  {
    title: "Retire",
    description: "401k and savings planners from calc-retire*.html with timeline formatting intact.",
    href: "/calculators/retire" as Route,
    icon: PiggyBank,
    tag: "Retirement",
  },
  {
    title: "Tax",
    description: "Capital gains and net profit estimators pulled from calc-tax*.html.",
    href: "/calculators/tax" as Route,
    icon: Coins,
    tag: "Tax",
  },
  {
    title: "Crypto",
    description: "Mining and staking calculators derived from calc-crypto*.html.",
    href: "/calculators/crypto" as Route,
    icon: Banknote,
    tag: "Crypto",
  },
];

export default function CalculatorsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Calculators</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">
          Calculator hub powered by the prototype suite
        </h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          Every category here maps directly to the calculators in the prototype folder so formatting, copy, and workflows remain consistent.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.title}
              className="group border-outline/20 bg-surface-muted/60 transition hover:border-accent-primary/60 hover:bg-surface-card/80"
            >
              <CardHeader className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-secondary">
                      {category.tag}
                    </p>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                  <Icon className="h-10 w-10 text-accent-primary" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <Link
                  href={category.href}
                  aria-label={`Open ${category.title} calculators`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-primary transition hover:gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                >
                  Open calculators
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

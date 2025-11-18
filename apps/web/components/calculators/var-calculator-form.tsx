"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const confidenceOptions = [
  { label: "90% (1.28σ)", value: 90, z: 1.28 },
  { label: "95% (1.65σ)", value: 95, z: 1.65 },
  { label: "99% (2.33σ)", value: 99, z: 2.33 },
];

const horizonOptions = [
  { label: "1 day", value: 1 },
  { label: "1 week (5 days)", value: 5 },
  { label: "1 month (21 days)", value: 21 },
  { label: "1 year (252 days)", value: 252 },
];

type VarResult = {
  varAmount: number;
  varPercent: number;
  portfolioFloor: number;
  summary: string;
};

export function VarCalculatorForm({ className }: { className?: string }) {
  const [portfolioValue, setPortfolioValue] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [volatility, setVolatility] = useState(15);
  const [confidence, setConfidence] = useState(95);
  const [timeHorizon, setTimeHorizon] = useState(21);
  const [result, setResult] = useState<VarResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const zScore = useMemo(() => confidenceOptions.find((option) => option.value === confidence)?.z ?? 1.65, [confidence]);

  const handleNumberChange = (setter: (value: number) => void) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number(event.target.value);
    setter(Number.isFinite(value) ? value : 0);
  };

  const handleSelectChange = (setter: (value: number) => void) => (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = Number(event.target.value);
    setter(Number.isFinite(value) ? value : 0);
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (portfolioValue <= 0 || volatility < 0) {
      setError("Portfolio value must be positive and volatility cannot be negative.");
      setResult(null);
      return;
    }

    setError(null);
    const dailyReturn = expectedReturn / 100 / 252;
    const dailyVolatility = (volatility / 100) / Math.sqrt(252);
    const periodReturn = dailyReturn * timeHorizon;
    const periodVolatility = dailyVolatility * Math.sqrt(timeHorizon);
    const varPercent = periodReturn - zScore * periodVolatility;
    const varAmount = portfolioValue * Math.abs(varPercent);
    const portfolioFloor = portfolioValue + portfolioValue * varPercent;
    const tailChance = 100 - confidence;
    const horizonLabel = horizonOptions.find((option) => option.value === timeHorizon)?.label ?? `${timeHorizon} days`;

    setResult({
      varAmount,
      varPercent: Math.abs(varPercent),
      portfolioFloor,
      summary: `With ${confidence}% confidence, your portfolio should not lose more than ${formatCurrency(varAmount)} over ${horizonLabel}. There is a ${tailChance}% chance of exceeding this loss.`,
    });
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="portfolio-value">Portfolio value ($)</Label>
          <Input
            id="portfolio-value"
            type="number"
            min={0}
            step={1000}
            value={portfolioValue}
            onChange={handleNumberChange(setPortfolioValue)}
          />
        </div>
        <div>
          <Label htmlFor="expected-return">Expected annual return (%)</Label>
          <Input
            id="expected-return"
            type="number"
            step={0.1}
            value={expectedReturn}
            onChange={handleNumberChange(setExpectedReturn)}
          />
        </div>
        <div>
          <Label htmlFor="volatility">Annual volatility (%)</Label>
          <Input
            id="volatility"
            type="number"
            min={0}
            step={0.1}
            value={volatility}
            onChange={handleNumberChange(setVolatility)}
          />
          <p className="mt-1 text-xs text-text-muted">Typical equity portfolios: 15-20%. Bonds: 5-10%.</p>
        </div>
        <div>
          <Label htmlFor="confidence">Confidence level</Label>
          <select
            id="confidence"
            className="h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            value={confidence}
            onChange={handleSelectChange(setConfidence)}
          >
            {confidenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="horizon">Time horizon</Label>
          <select
            id="horizon"
            className="h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            value={timeHorizon}
            onChange={handleSelectChange(setTimeHorizon)}
          >
            {horizonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 md:flex md:justify-end">
          <Button type="submit" className="w-full md:w-auto">
            Calculate VaR
          </Button>
        </div>
      </form>

      {error ? <p className="text-sm text-accent-secondary">{error}</p> : null}

      {result ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Value at risk</p>
            <p className="mt-2 text-2xl font-semibold text-red-500">{formatCurrency(result.varAmount)}</p>
            <p className="text-sm text-text-secondary">{(result.varPercent * 100).toFixed(2)}% of the portfolio</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Portfolio floor</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(result.portfolioFloor)}</p>
          </div>
          <div className="md:col-span-2 rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-sm text-text-secondary">{result.summary}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
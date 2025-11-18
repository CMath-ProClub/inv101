"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const fractions = [
  { label: "Full Kelly (aggressive)", value: 1 },
  { label: "Half Kelly (recommended)", value: 0.5 },
  { label: "Quarter Kelly (conservative)", value: 0.25 },
];

type KellyResult = {
  kellyPercent: number;
  adjustedPercent: number;
  positionSize?: number;
  recommendation: string;
  recommendationColor: string;
};

export function KellyCalculatorForm({ className }: { className?: string }) {
  const [winProbability, setWinProbability] = useState(55);
  const [winLossRatio, setWinLossRatio] = useState(2);
  const [bankroll, setBankroll] = useState(10000);
  const [fraction, setFraction] = useState(0.5);
  const [result, setResult] = useState<KellyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNumberChange = (setter: (value: number) => void) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number(event.target.value);
    setter(Number.isFinite(value) ? value : 0);
  };

  function handleFractionChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = Number(event.target.value);
    setFraction(Number.isFinite(value) ? value : 0.5);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (winProbability <= 0 || winProbability >= 100) {
      setError("Win probability must be between 0 and 100%.\u00a0Try 55-60% for most playbooks.");
      setResult(null);
      return;
    }
    if (winLossRatio <= 0) {
      setError("Win/loss ratio must be greater than zero.");
      setResult(null);
      return;
    }

    setError(null);
    const p = winProbability / 100;
    const q = 1 - p;
    const kelly = (p * winLossRatio - q) / winLossRatio;
    const kellyPercent = Math.max(0, kelly * 100);
    const adjustedPercent = kellyPercent * fraction;

    let recommendation = "Neutral edge — verify your assumptions.";
    let recommendationColor = "text-text-secondary";

    if (kelly <= 0) {
      recommendation = "Negative edge — pass on this trade.";
      recommendationColor = "text-red-500";
    } else if (adjustedPercent < 1) {
      recommendation = "Tiny edge — size down and confirm data.";
      recommendationColor = "text-orange-400";
    } else if (adjustedPercent < 5) {
      recommendation = "Reasonable edge — position looks balanced.";
      recommendationColor = "text-accent-primary";
    } else if (adjustedPercent < 10) {
      recommendation = "Large position — double-check win probability.";
      recommendationColor = "text-orange-400";
    } else {
      recommendation = "Aggressive sizing — confirm liquidity and risk.";
      recommendationColor = "text-red-500";
    }

    const nextResult: KellyResult = {
      kellyPercent,
      adjustedPercent,
      recommendation,
      recommendationColor,
    };

    if (bankroll > 0) {
      nextResult.positionSize = (adjustedPercent / 100) * bankroll;
    }

    setResult(nextResult);
  }

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const formatCurrency = (value?: number) =>
    value === undefined ? "--" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="win-prob">Win probability (%)</Label>
          <Input
            id="win-prob"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={winProbability}
            onChange={handleNumberChange(setWinProbability)}
          />
          <p className="mt-1 text-xs text-text-muted">Use your historical hit-rate or signal confidence.</p>
        </div>
        <div>
          <Label htmlFor="win-loss">Win/loss ratio</Label>
          <Input
            id="win-loss"
            type="number"
            min={0}
            step={0.1}
            value={winLossRatio}
            onChange={handleNumberChange(setWinLossRatio)}
          />
          <p className="mt-1 text-xs text-text-muted">Average win divided by average loss.</p>
        </div>
        <div>
          <Label htmlFor="bankroll">Bankroll ($)</Label>
          <Input
            id="bankroll"
            type="number"
            min={0}
            step={100}
            value={bankroll}
            onChange={handleNumberChange(setBankroll)}
          />
          <p className="mt-1 text-xs text-text-muted">Optional—used to translate sizing into dollars.</p>
        </div>
        <div>
          <Label htmlFor="fraction">Fractional Kelly</Label>
          <select
            id="fraction"
            className="h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            value={fraction}
            onChange={handleFractionChange}
          >
            {fractions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 md:flex md:justify-end">
          <Button type="submit" className="w-full md:w-auto">
            Calculate position size
          </Button>
        </div>
      </form>

      {error ? <p className="text-sm text-accent-secondary">{error}</p> : null}

      {result ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Kelly percentage</p>
            <p className="mt-2 text-2xl font-semibold text-accent-primary">{formatPercent(result.kellyPercent)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">After fractional sizing</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{formatPercent(result.adjustedPercent)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Position size</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(result.positionSize)}</p>
          </div>
          <div className="md:col-span-3 rounded-2xl border border-outline/30 bg-surface-muted/60 p-4 text-center">
            <p className={cn("text-sm font-semibold", result.recommendationColor)}>{result.recommendation}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

type RoiResult = {
  totalGain: number;
  roiPercent: number;
  annualizedPercent?: number;
};

export function RoiCalculatorForm({ className }: { className?: string }) {
  const [initial, setInitial] = useState(10000);
  const [finalValue, setFinalValue] = useState(15000);
  const [years, setYears] = useState(3);
  const [result, setResult] = useState<RoiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNumberChange = (setter: (value: number) => void) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number(event.target.value);
    setter(Number.isFinite(value) ? value : 0);
  };

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  }

  function formatPercent(value: number) {
    return `${value.toFixed(2)}%`;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (initial <= 0) {
      setError("Initial investment must be greater than zero.");
      setResult(null);
      return;
    }
    setError(null);

    const gain = finalValue - initial;
    const roiPercent = (gain / initial) * 100;
    const computed: RoiResult = { totalGain: gain, roiPercent };

    if (years && years > 0 && finalValue > 0 && initial > 0) {
      computed.annualizedPercent = (Math.pow(finalValue / initial, 1 / years) - 1) * 100;
    }

    setResult(computed);
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="initial">Initial investment ($)</Label>
          <Input
            id="initial"
            type="number"
            min={0}
            step={100}
            value={initial}
            onChange={handleNumberChange(setInitial)}
          />
        </div>
        <div>
          <Label htmlFor="final">Final value ($)</Label>
          <Input
            id="final"
            type="number"
            min={0}
            step={100}
            value={finalValue}
            onChange={handleNumberChange(setFinalValue)}
          />
        </div>
        <div>
          <Label htmlFor="years">Holding period (years)</Label>
          <Input
            id="years"
            type="number"
            min={0}
            step={0.25}
            value={years}
            onChange={handleNumberChange(setYears)}
          />
          <p className="mt-1 text-xs text-text-muted">Optional. Provide to see an annualized ROI.</p>
        </div>
        <div className="md:col-span-3 md:flex md:justify-end">
          <Button type="submit" className="w-full md:w-auto">
            Calculate ROI
          </Button>
        </div>
      </form>

      {error ? <p className="text-sm text-accent-secondary">{error}</p> : null}

      {result ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Total gain / loss</p>
            <p
              className={cn(
                "mt-2 text-2xl font-semibold",
                result.totalGain >= 0 ? "text-text-primary" : "text-accent-secondary",
              )}
            >
              {formatCurrency(result.totalGain)}
            </p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">ROI</p>
            <p className="mt-2 text-2xl font-semibold text-accent-primary">{formatPercent(result.roiPercent)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Annualized ROI</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {result.annualizedPercent ? formatPercent(result.annualizedPercent) : "--"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
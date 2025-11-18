"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";

const periods = [
  { label: "Daily (252 trading days)", value: 252 },
  { label: "Weekly (52 weeks)", value: 52 },
  { label: "Monthly (12 months)", value: 12 },
];

type VolatilityResult = {
  dataPoints: number;
  meanReturn: number;
  standardDeviation: number;
  annualizedVolatility: number;
  interpretation: string;
  interpretationColor: string;
};

export function VolatilityCalculatorForm({ className }: { className?: string }) {
  const [prices, setPrices] = useState("100, 102, 98, 103, 101, 105, 99, 107");
  const [period, setPeriod] = useState(periods[0].value);
  const [result, setResult] = useState<VolatilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const placeholder = useMemo(
    () => "100, 102, 98, 103, 101, 105, 99, 107",
    [],
  );

  function parsePrices(input: string) {
    return input
      .split(/[,\n\s]+/)
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value));
  }

  function computeInterpretation(volPercent: number) {
    if (volPercent < 15) {
      return { message: "Low volatility — relatively stable asset", color: "text-accent-primary" };
    }
    if (volPercent < 30) {
      return { message: "Moderate volatility — average market risk", color: "text-accent-secondary" };
    }
    if (volPercent < 50) {
      return { message: "High volatility — significant price swings", color: "text-orange-400" };
    }
    return { message: "Very high volatility — extremely risky asset", color: "text-red-500" };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parsePrices(prices);

    if (parsed.length < 5) {
      setError("Enter at least five valid price points.");
      setResult(null);
      return;
    }

    setError(null);
    const returns: number[] = [];
    for (let i = 1; i < parsed.length; i += 1) {
      const prev = parsed[i - 1];
      const current = parsed[i];
      if (prev === 0) {
        returns.push(0);
        continue;
      }
      returns.push((current - prev) / prev);
    }

    const meanReturn = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    const squaredDiffs = returns.map((value) => Math.pow(value - meanReturn, 2));
    const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / returns.length;
    const standardDeviation = Math.sqrt(variance);
    const annualizedVolatility = standardDeviation * Math.sqrt(period);
    const { message, color } = computeInterpretation(annualizedVolatility * 100);

    setResult({
      dataPoints: parsed.length,
      meanReturn,
      standardDeviation,
      annualizedVolatility,
      interpretation: message,
      interpretationColor: color,
    });
  }

  const handlePricesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrices(event.target.value);
  };

  const handlePeriodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    setPeriod(Number.isFinite(value) ? value : periods[0].value);
  };

  const percentFormatter = (value: number, digits = 2) => `${(value * 100).toFixed(digits)}%`;

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="prices">Price data</Label>
          <Textarea
            id="prices"
            rows={4}
            value={prices}
            placeholder={placeholder}
            onChange={handlePricesChange}
          />
          <p className="mt-1 text-xs text-text-muted">Paste comma- or space-separated closes. Minimum five points.</p>
        </div>
        <div>
          <Label htmlFor="period">Sampling period</Label>
          <select
            id="period"
            className="h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            value={period}
            onChange={handlePeriodChange}
          >
            {periods.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full">
          Calculate volatility
        </Button>
      </form>

      {error ? <p className="text-sm text-accent-secondary">{error}</p> : null}

      {result ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Data coverage</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{result.dataPoints} prices · {result.dataPoints - 1} returns</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Average return</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{percentFormatter(result.meanReturn, 3)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Standard deviation</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{percentFormatter(result.standardDeviation, 3)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Annualized volatility</p>
            <p className="mt-2 text-2xl font-semibold text-accent-primary">{percentFormatter(result.annualizedVolatility)}</p>
          </div>
          <div className="md:col-span-2 rounded-2xl border border-outline/30 bg-surface-muted/60 p-4 text-center">
            <p className={cn("text-sm font-semibold", result.interpretationColor)}>{result.interpretation}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
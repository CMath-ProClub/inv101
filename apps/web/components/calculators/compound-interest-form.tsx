"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

type CompoundResult = {
  futureValue: number;
  totalContributions: number;
  interestEarned: number;
};

const frequencies = [
  { label: "Annually", value: 1 },
  { label: "Semi-annually", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
];

export function CompoundInterestForm({ className }: { className?: string }) {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [frequency, setFrequency] = useState(12);
  const [years, setYears] = useState(10);
  const [contribution, setContribution] = useState(0);
  const [result, setResult] = useState<CompoundResult | null>(null);

  const handleNumberChange = (setter: (value: number) => void) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number(event.target.value);
    setter(Number.isFinite(value) ? value : 0);
  };

  function handleFrequencyChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = Number(event.target.value);
    setFrequency(Number.isFinite(value) ? value : 1);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (years <= 0) {
      setResult(null);
      return;
    }

    const r = Math.max(rate, 0) / 100;
    const n = Math.max(frequency, 1);
    const t = years;
    const periods = n * t;
    const ratePerPeriod = n > 0 ? r / n : 0;
    const pmt = Math.max(contribution, 0);
    const startingPrincipal = Math.max(principal, 0);

    const fvPrincipal = startingPrincipal * Math.pow(1 + ratePerPeriod, periods);

    let fvContributions = 0;
    if (pmt > 0) {
      fvContributions = ratePerPeriod === 0 ? pmt * periods : pmt * ((Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod);
    }

    const totalFV = fvPrincipal + fvContributions;
    const totalContributions = startingPrincipal + pmt * periods;

    setResult({
      futureValue: totalFV,
      totalContributions,
      interestEarned: totalFV - totalContributions,
    });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="principal">Principal ($)</Label>
          <Input
            id="principal"
            type="number"
            min={0}
            step={100}
            value={principal}
            onChange={handleNumberChange(setPrincipal)}
          />
        </div>
        <div>
          <Label htmlFor="rate">Annual interest (%)</Label>
          <Input
            id="rate"
            type="number"
            min={0}
            step={0.1}
            value={rate}
            onChange={handleNumberChange(setRate)}
          />
        </div>
        <div>
          <Label htmlFor="frequency">Compounding frequency</Label>
          <select
            id="frequency"
            className="h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            value={frequency}
            onChange={handleFrequencyChange}
          >
            {frequencies.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="years">Years</Label>
          <Input
            id="years"
            type="number"
            min={0}
            step={0.5}
            value={years}
            onChange={handleNumberChange(setYears)}
          />
        </div>
        <div>
          <Label htmlFor="contribution">Contribution per period ($)</Label>
          <Input
            id="contribution"
            type="number"
            min={0}
            step={50}
            value={contribution}
            onChange={handleNumberChange(setContribution)}
          />
          <p className="mt-1 text-xs text-text-muted">Matches the compounding frequency you pick above.</p>
        </div>
        <div className="md:self-end">
          <Button type="submit" className="w-full">Run calculation</Button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Future value</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(result.futureValue)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Total contributions</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(result.totalContributions)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Interest earned</p>
            <p className="mt-2 text-2xl font-semibold text-accent-primary">{formatCurrency(result.interestEarned)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

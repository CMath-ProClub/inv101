"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

type PositionResult = {
  shares: number;
  positionValue: number;
  riskPerShare: number;
  totalRisk: number;
  accountPercent: number;
};

export function PositionSizingForm({ className }: { className?: string }) {
  const [accountSize, setAccountSize] = useState(50000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState(100);
  const [stopPrice, setStopPrice] = useState(95);
  const [result, setResult] = useState<PositionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNumberChange = (setter: (value: number) => void) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number(event.target.value);
    setter(Number.isFinite(value) ? value : 0);
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (accountSize <= 0 || riskPercent <= 0 || entryPrice <= 0 || stopPrice <= 0) {
      setError("Inputs must be greater than zero.");
      setResult(null);
      return;
    }
    if (stopPrice >= entryPrice) {
      setError("Stop loss must sit below the entry price.");
      setResult(null);
      return;
    }

    setError(null);
    const riskAmount = accountSize * (riskPercent / 100);
    const riskPerShare = entryPrice - stopPrice;
    const shares = Math.max(0, Math.floor(riskAmount / riskPerShare));
    const positionValue = shares * entryPrice;
    const totalRisk = shares * riskPerShare;
    const accountPercent = accountSize > 0 ? (positionValue / accountSize) * 100 : 0;

    setResult({ shares, positionValue, riskPerShare, totalRisk, accountPercent });
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="account-size">Account size ($)</Label>
          <Input
            id="account-size"
            type="number"
            min={0}
            step={500}
            value={accountSize}
            onChange={handleNumberChange(setAccountSize)}
          />
        </div>
        <div>
          <Label htmlFor="risk-percent">Risk per trade (%)</Label>
          <Input
            id="risk-percent"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={riskPercent}
            onChange={handleNumberChange(setRiskPercent)}
          />
          <p className="mt-1 text-xs text-text-muted">Common ranges: 1-2% (conservative) up to 5% (aggressive).</p>
        </div>
        <div>
          <Label htmlFor="entry-price">Entry price ($)</Label>
          <Input
            id="entry-price"
            type="number"
            min={0}
            step={0.01}
            value={entryPrice}
            onChange={handleNumberChange(setEntryPrice)}
          />
        </div>
        <div>
          <Label htmlFor="stop-price">Stop loss ($)</Label>
          <Input
            id="stop-price"
            type="number"
            min={0}
            step={0.01}
            value={stopPrice}
            onChange={handleNumberChange(setStopPrice)}
          />
        </div>
        <div className="md:col-span-2 md:flex md:justify-end">
          <Button type="submit" className="w-full md:w-auto">
            Calculate position
          </Button>
        </div>
      </form>

      {error ? <p className="text-sm text-accent-secondary">{error}</p> : null}

      {result ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Shares</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{result.shares.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Position value</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(result.positionValue)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Account exposure</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{result.accountPercent.toFixed(2)}%</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Risk per share</p>
            <p className="mt-2 text-2xl font-semibold text-accent-secondary">{formatCurrency(result.riskPerShare)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Total risk amount</p>
            <p className="mt-2 text-2xl font-semibold text-accent-secondary">{formatCurrency(result.totalRisk)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
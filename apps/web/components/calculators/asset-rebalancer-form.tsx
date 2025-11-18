"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

type AssetRow = {
  id: string;
  label: string;
  current: number;
  target: number;
};

type RebalanceAction = {
  id: string;
  label: string;
  currentPercent: number;
  targetPercent: number;
  targetValue: number;
  delta: number;
};

const defaultAssets: AssetRow[] = [
  { id: "stocks", label: "Stocks", current: 40000, target: 60 },
  { id: "bonds", label: "Bonds", current: 30000, target: 30 },
  { id: "realEstate", label: "Real estate", current: 20000, target: 5 },
  { id: "cash", label: "Cash", current: 10000, target: 5 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function AssetRebalancerForm({ className }: { className?: string }) {
  const [assets, setAssets] = useState<AssetRow[]>(defaultAssets);
  const [result, setResult] = useState<RebalanceAction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const portfolioTotal = useMemo(() => assets.reduce((sum, asset) => sum + Math.max(asset.current, 0), 0), [assets]);
  const targetTotal = useMemo(() => assets.reduce((sum, asset) => sum + Math.max(asset.target, 0), 0), [assets]);

  function handleNumberChange(index: number, field: keyof AssetRow) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      setAssets((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: Number.isFinite(value) ? value : 0 };
        return next;
      });
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (portfolioTotal <= 0) {
      setError("Enter current values so we can build a plan.");
      setResult(null);
      return;
    }

    if (Math.abs(targetTotal - 100) > 0.1) {
      setError("Target percentages must add up to 100%.");
      setResult(null);
      return;
    }

    const actions = assets.map((asset) => {
      const targetValue = (asset.target / 100) * portfolioTotal;
      const delta = targetValue - asset.current;
      const currentPercent = (asset.current / portfolioTotal) * 100;
      return {
        id: asset.id,
        label: asset.label,
        currentPercent,
        targetPercent: asset.target,
        targetValue,
        delta,
      };
    });

    setError(null);
    setResult(actions);
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {assets.map((asset, index) => (
            <div key={asset.id} className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">{asset.label}</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Allocation pair</p>
                </div>
                <span className="text-2xl font-semibold text-text-primary">{asset.target}%</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`${asset.id}-current`}>Current value ($)</Label>
                  <Input
                    id={`${asset.id}-current`}
                    type="number"
                    min={0}
                    step={100}
                    value={asset.current}
                    onChange={handleNumberChange(index, "current")}
                  />
                </div>
                <div>
                  <Label htmlFor={`${asset.id}-target`}>Target %</Label>
                  <Input
                    id={`${asset.id}-target`}
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={asset.target}
                    onChange={handleNumberChange(index, "target")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Portfolio total</dt>
              <dd className="text-2xl font-semibold text-text-primary">{formatCurrency(portfolioTotal)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Target sum</dt>
              <dd className="text-2xl font-semibold text-text-primary">{targetTotal.toFixed(1)}%</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Categories</dt>
              <dd className="text-2xl font-semibold text-text-primary">{assets.length}</dd>
            </div>
          </dl>
        </div>

        <Button type="submit" className="w-full md:w-auto">Generate rebalancing plan</Button>
      </form>

      {error ? (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Rebalancing steps</p>
              <p className="text-base text-text-secondary">{formatCurrency(portfolioTotal)} portfolio with targets applied.</p>
            </div>
          </div>
          <div className="grid gap-4">
            {result.map((action) => {
              const needsTrade = Math.abs(action.delta) >= portfolioTotal * 0.005;
              const direction = action.delta > 0 ? "Buy" : "Sell";
              const tone = action.delta > 0 ? "text-emerald-400" : "text-rose-400";
              return (
                <div key={action.id} className="rounded-2xl border border-outline/20 bg-surface-primary/40 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{action.label}</p>
                      <p className="text-xs text-text-muted">Current {action.currentPercent.toFixed(1)}% • Target {action.targetPercent.toFixed(1)}%</p>
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">Target value {formatCurrency(action.targetValue)}</span>
                  </div>
                  <div className="mt-4 rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                    {needsTrade ? (
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span className={tone}>{direction} {formatCurrency(Math.abs(action.delta))}</span>
                        <span className="text-text-secondary">
                          {action.delta > 0 ? "Underweight" : "Overweight"} by {(Math.abs(action.delta) / portfolioTotal * 100).toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-emerald-400">On target — no trade needed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

type FilingStatus = "single" | "married" | "separate" | "head";

type CapitalGainsResult = {
  gain: number;
  taxRate: number;
  taxOwed: number;
  netProfit: number;
  holdingPeriod: "short" | "long";
};

export function CapitalGainsCalculatorForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState({
    purchasePrice: 10000,
    salePrice: 15000,
    holdingPeriod: "short" as "short" | "long",
    filingStatus: "single" as FilingStatus,
    income: 75000,
  });
  const [result, setResult] = useState<CapitalGainsResult | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: event.target.type === "number" ? Number(value) : value }));
  }

  function resolveShortTermRate(status: FilingStatus, income: number) {
    const brackets: Record<FilingStatus, Array<{ max: number; rate: number }>> = {
      single: [
        { max: 11000, rate: 0.1 },
        { max: 44725, rate: 0.12 },
        { max: 95375, rate: 0.22 },
        { max: 182100, rate: 0.24 },
        { max: 231250, rate: 0.32 },
        { max: 578125, rate: 0.35 },
        { max: Infinity, rate: 0.37 },
      ],
      married: [
        { max: 22000, rate: 0.1 },
        { max: 89050, rate: 0.12 },
        { max: 190750, rate: 0.22 },
        { max: 364200, rate: 0.24 },
        { max: 462500, rate: 0.32 },
        { max: 693750, rate: 0.35 },
        { max: Infinity, rate: 0.37 },
      ],
      separate: [
        { max: 11000, rate: 0.1 },
        { max: 44725, rate: 0.12 },
        { max: 95375, rate: 0.22 },
        { max: 182100, rate: 0.24 },
        { max: 231250, rate: 0.35 },
        { max: Infinity, rate: 0.37 },
      ],
      head: [
        { max: 15700, rate: 0.1 },
        { max: 59850, rate: 0.12 },
        { max: 95350, rate: 0.22 },
        { max: 182100, rate: 0.24 },
        { max: 231250, rate: 0.32 },
        { max: 578100, rate: 0.35 },
        { max: Infinity, rate: 0.37 },
      ],
    };

    return brackets[status].find((bracket) => income <= bracket.max)?.rate ?? 0.22;
  }

  function resolveLongTermRate(status: FilingStatus, income: number) {
    const thresholds: Record<FilingStatus, [number, number]> = {
      single: [44625, 492300],
      married: [89250, 553850],
      separate: [44625, 276900],
      head: [59750, 523050],
    };
    const [tier1, tier2] = thresholds[status];
    if (income <= tier1) return 0;
    if (income <= tier2) return 0.15;
    return 0.2;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const gain = inputs.salePrice - inputs.purchasePrice;
    const taxRate = inputs.holdingPeriod === "short"
      ? resolveShortTermRate(inputs.filingStatus, inputs.income)
      : resolveLongTermRate(inputs.filingStatus, inputs.income);
    const taxOwed = gain * taxRate;
    const netProfit = gain - taxOwed;
    setResult({ gain, taxRate, taxOwed, netProfit, holdingPeriod: inputs.holdingPeriod });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="purchasePrice">Purchase price ($)</Label>
          <Input id="purchasePrice" type="number" min={0} step={100} value={inputs.purchasePrice} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="salePrice">Sale price ($)</Label>
          <Input id="salePrice" type="number" min={0} step={100} value={inputs.salePrice} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="holdingPeriod">Holding period</Label>
          <select
            id="holdingPeriod"
            value={inputs.holdingPeriod}
            onChange={handleChange}
            className="mt-1 h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            <option value="short">Short-term (≤ 1 year)</option>
            <option value="long">Long-term (&gt; 1 year)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="filingStatus">Filing status</Label>
          <select
            id="filingStatus"
            value={inputs.filingStatus}
            onChange={handleChange}
            className="mt-1 h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            <option value="single">Single</option>
            <option value="married">Married filing jointly</option>
            <option value="separate">Married filing separately</option>
            <option value="head">Head of household</option>
          </select>
        </div>
        <div>
          <Label htmlFor="income">Annual income ($)</Label>
          <Input id="income" type="number" min={0} step={1000} value={inputs.income} onChange={handleChange} />
          <p className="mt-1 text-xs text-text-muted">Used to approximate the tax bracket.</p>
        </div>
        <div className="md:self-end">
          <Button type="submit" className="w-full">Calculate tax</Button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Capital gain</p>
            <p className={cn("mt-3 text-2xl font-semibold", result.gain >= 0 ? "text-text-primary" : "text-rose-400")}>{currency.format(result.gain)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Tax rate</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{(result.taxRate * 100).toFixed(1)}%</p>
            <p className="mt-1 text-xs text-text-muted">{result.holdingPeriod === "short" ? "Short-term" : "Long-term"} bracket</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Tax owed</p>
            <p className="mt-3 text-2xl font-semibold text-rose-400">{currency.format(result.taxOwed)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Net profit</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-400">{currency.format(result.netProfit)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

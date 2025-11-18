"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

type NetProfitResult = {
  taxableIncome: number;
  taxOwed: number;
  netProfit: number;
  profitMargin: number;
};

export function NetProfitTaxForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState({
    grossProfit: 100000,
    expenses: 20000,
    taxRate: 25,
    filingStatus: "single",
    income: 85000,
  });
  const [result, setResult] = useState<NetProfitResult | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: event.target.type === "number" ? Number(value) : value }));
  }

  function estimateRate() {
    const taxableIncome = Math.max(inputs.income - inputs.expenses, 0);
    if (taxableIncome <= 0) return;
    const brackets: Record<string, Array<{ max: number; rate: number }>> = {
      single: [
        { max: 11925, rate: 10 },
        { max: 48475, rate: 12 },
        { max: 103350, rate: 22 },
        { max: 197300, rate: 24 },
        { max: 250525, rate: 32 },
        { max: 626350, rate: 35 },
        { max: Infinity, rate: 37 },
      ],
      married: [
        { max: 23850, rate: 10 },
        { max: 96950, rate: 12 },
        { max: 206700, rate: 22 },
        { max: 394600, rate: 24 },
        { max: 501050, rate: 32 },
        { max: 751600, rate: 35 },
        { max: Infinity, rate: 37 },
      ],
    };
    let remaining = taxableIncome;
    let effectiveTax = 0;
    let previousMax = 0;
    for (const bracket of brackets[inputs.filingStatus as "single" | "married"]) {
      const span = Math.min(bracket.max - previousMax, remaining);
      if (span <= 0) break;
      effectiveTax += span * (bracket.rate / 100);
      remaining -= span;
      previousMax = bracket.max;
    }
    const effectiveRate = (effectiveTax / Math.max(taxableIncome, 1)) * 100;
    setInputs((prev) => ({ ...prev, taxRate: Number(effectiveRate.toFixed(2)) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const taxableIncome = Math.max(inputs.grossProfit - inputs.expenses, 0);
    const taxOwed = taxableIncome * (inputs.taxRate / 100);
    const netProfit = taxableIncome - taxOwed;
    const profitMargin = (netProfit / Math.max(inputs.grossProfit, 1)) * 100;
    setResult({ taxableIncome, taxOwed, netProfit, profitMargin });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="grossProfit">Gross profit / revenue ($)</Label>
          <Input id="grossProfit" type="number" step={1000} value={inputs.grossProfit} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="expenses">Business expenses ($)</Label>
          <Input id="expenses" type="number" step={500} value={inputs.expenses} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="taxRate">Effective tax rate (%)</Label>
          <Input id="taxRate" type="number" step={0.1} value={inputs.taxRate} onChange={handleChange} />
        </div>
        <div className="rounded-2xl border border-outline/20 bg-surface-muted/50 p-4 md:col-span-3">
          <p className="text-sm font-semibold text-text-secondary">Need help with the tax rate?</p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
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
              </select>
            </div>
            <div>
              <Label htmlFor="income">Taxable income estimate ($)</Label>
              <Input id="income" type="number" step={1000} value={inputs.income} onChange={handleChange} />
            </div>
            <div className="flex items-end">
              <Button type="button" className="w-full" onClick={estimateRate}>
                Estimate tax rate
              </Button>
            </div>
          </div>
        </div>
        <div className="md:col-span-3 md:flex md:justify-end">
          <Button type="submit" className="w-full md:w-auto">Calculate net profit</Button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Taxable income</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{currency.format(result.taxableIncome)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Tax owed</p>
            <p className="mt-3 text-2xl font-semibold text-rose-400">{currency.format(result.taxOwed)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Net profit after tax</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-400">{currency.format(result.netProfit)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Net profit margin</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{result.profitMargin.toFixed(1)}%</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

type YieldResult = {
  dividendYield: number;
  annualDividend: number;
  quarterlyDividend: number;
  shares?: number;
  totalInvestment?: number;
  annualIncome?: number;
  monthlyIncome?: number;
  assessment: string;
  tone: "info" | "positive" | "warn" | "danger";
};

export function DividendYieldCalculatorForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState({ dividend: 2.5, price: 100, shares: 0 });
  const [result, setResult] = useState<YieldResult | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: Number(value) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inputs.price) return;
    const dividendYield = (inputs.dividend / inputs.price) * 100;
    const quarterlyDividend = inputs.dividend / 4;
    let assessment = "";
    let tone: YieldResult["tone"] = "info";
    if (dividendYield < 2) {
      assessment = "Low yield — common for growth names.";
      tone = "info";
    } else if (dividendYield < 4) {
      assessment = "Healthy yield with balanced profile.";
      tone = "positive";
    } else if (dividendYield < 6) {
      assessment = "High yield — verify payout ratio.";
      tone = "warn";
    } else if (dividendYield < 10) {
      assessment = "Very high yield — confirm sustainability.";
      tone = "warn";
    } else {
      assessment = "Extreme yield — potential red flag.";
      tone = "danger";
    }

    const payload: YieldResult = {
      dividendYield,
      annualDividend: inputs.dividend,
      quarterlyDividend,
      assessment,
      tone,
    };

    if (inputs.shares > 0) {
      const totalInvestment = inputs.price * inputs.shares;
      const annualIncome = inputs.dividend * inputs.shares;
      payload.shares = inputs.shares;
      payload.totalInvestment = totalInvestment;
      payload.annualIncome = annualIncome;
      payload.monthlyIncome = annualIncome / 12;
    }

    setResult(payload);
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="dividend">Annual dividend ($)</Label>
          <Input id="dividend" type="number" step={0.01} min={0} value={inputs.dividend} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="price">Stock price ($)</Label>
          <Input id="price" type="number" step={0.01} min={0} value={inputs.price} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="shares">Number of shares (optional)</Label>
          <Input id="shares" type="number" step={1} min={0} value={inputs.shares} onChange={handleChange} />
        </div>
        <div className="md:col-span-3 md:flex md:justify-end">
          <Button type="submit" className="w-full md:w-auto">Calculate</Button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Dividend yield</p>
            <p className="mt-2 text-3xl font-semibold text-text-primary">{result.dividendYield.toFixed(2)}%</p>
            <p className="mt-1 text-sm text-text-secondary">{currency.format(result.annualDividend)} annual • {currency.format(result.quarterlyDividend)} quarterly</p>
          </div>
          {result.totalInvestment ? (
            <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Portfolio income</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">Annual {currency.format(result.annualIncome ?? 0)}</p>
              <p className="mt-1 text-sm text-text-secondary">Monthly {currency.format(result.monthlyIncome ?? 0)} on {currency.format(result.totalInvestment ?? 0)}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-outline/30 bg-surface-muted/30 p-5 text-sm text-text-secondary">
              Add share count to see portfolio income callouts.
            </div>
          )}
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Assessment</p>
            <p
              className={cn("mt-3 text-lg font-semibold", {
                "text-sky-400": result.tone === "info",
                "text-emerald-400": result.tone === "positive",
                "text-amber-300": result.tone === "warn",
                "text-rose-400": result.tone === "danger",
              })}
            >
              {result.assessment}
            </p>
            <p className="mt-2 text-xs text-text-muted">Guidance mirrors <code>calc-stock-divyield.html</code>.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

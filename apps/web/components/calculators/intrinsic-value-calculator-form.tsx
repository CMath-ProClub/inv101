"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

type DcfInputs = {
  fcf: number;
  growthRate: number;
  wacc: number;
  shares: number;
  currentPrice: number;
  terminalGrowth: number;
  forecastYears: number;
  cash: number;
  debt: number;
};

type DcfResult = {
  intrinsicValue: number;
  enterpriseValue: number;
  presentTerminalValue: number;
  upside?: number;
  recommendation?: string;
  tone?: "positive" | "neutral" | "negative";
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatMillions(value: number) {
  return `${numberFormatter.format(value)}M`;
}

export function IntrinsicValueCalculatorForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState<DcfInputs>({
    fcf: 1000,
    growthRate: 15,
    wacc: 10,
    shares: 100,
    currentPrice: 150,
    terminalGrowth: 3,
    forecastYears: 5,
    cash: 0,
    debt: 0,
  });
  const [result, setResult] = useState<DcfResult | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: Number(value) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const growth = inputs.growthRate / 100;
    const discount = Math.max(inputs.wacc, 0.1) / 100;
    const terminalGrowth = Math.min(inputs.terminalGrowth / 100, discount - 0.005);
    const years = Math.min(Math.max(inputs.forecastYears, 1), 10);
    const shares = Math.max(inputs.shares, 1e-3);

    let presentValue = 0;
    let lastFcf = inputs.fcf;

    for (let year = 1; year <= years; year++) {
      lastFcf *= 1 + growth;
      const discountFactor = Math.pow(1 + discount, year);
      presentValue += lastFcf / discountFactor;
    }

    const terminalFcf = lastFcf * (1 + terminalGrowth);
    const rawTerminal = terminalFcf / Math.max(discount - terminalGrowth, 0.0001);
    const presentTerminalValue = rawTerminal / Math.pow(1 + discount, years);

    const enterpriseValue = presentValue + presentTerminalValue;
    const equityValue = enterpriseValue + inputs.cash - inputs.debt;
    const intrinsicValue = equityValue / shares;

    let recommendation: string | undefined;
    let tone: DcfResult["tone"] = "neutral";
    let upside: number | undefined;
    if (inputs.currentPrice > 0) {
      upside = ((intrinsicValue - inputs.currentPrice) / inputs.currentPrice) * 100;
      if (upside > 30) {
        recommendation = "Strong buy — materially undervalued";
        tone = "positive";
      } else if (upside > 10) {
        recommendation = "Buy — priced below intrinsic value";
        tone = "positive";
      } else if (upside > -10) {
        recommendation = "Hold — trading near fair value";
        tone = "neutral";
      } else if (upside > -30) {
        recommendation = "Trim — premium valuation";
        tone = "negative";
      } else {
        recommendation = "Strong sell — deeply overvalued";
        tone = "negative";
      }
    }

    setResult({
      intrinsicValue,
      enterpriseValue,
      presentTerminalValue,
      upside,
      recommendation,
      tone,
    });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-outline/20 bg-surface-muted/60 p-5">
          <div>
            <Label htmlFor="fcf">Current free cash flow ($M)</Label>
            <Input id="fcf" type="number" step={10} value={inputs.fcf} onChange={handleChange} />
            <p className="mt-1 text-xs text-text-muted">Annual free cash flow in millions.</p>
          </div>
          <div>
            <Label htmlFor="growthRate">Growth rate (%) — first horizon</Label>
            <Input id="growthRate" type="number" step={0.1} value={inputs.growthRate} onChange={handleChange} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="wacc">Discount rate (WACC %)</Label>
              <Input id="wacc" type="number" step={0.1} value={inputs.wacc} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="forecastYears">Forecast years (1-10)</Label>
              <Input id="forecastYears" type="number" min={1} max={10} value={inputs.forecastYears} onChange={handleChange} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="shares">Shares outstanding (M)</Label>
              <Input id="shares" type="number" step={1} value={inputs.shares} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="currentPrice">Current stock price ($)</Label>
              <Input id="currentPrice" type="number" step={0.01} value={inputs.currentPrice} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-outline/20 bg-surface-primary/40 p-5">
          <p className="text-sm font-semibold text-text-secondary">Advanced settings</p>
          <div>
            <Label htmlFor="terminalGrowth">Perpetual growth rate (%)</Label>
            <Input id="terminalGrowth" type="number" step={0.1} value={inputs.terminalGrowth} onChange={handleChange} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cash">Cash & equivalents ($M)</Label>
              <Input id="cash" type="number" step={1} value={inputs.cash} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="debt">Total debt ($M)</Label>
              <Input id="debt" type="number" step={1} value={inputs.debt} onChange={handleChange} />
            </div>
          </div>
          <Button type="submit" className="w-full">Calculate intrinsic value</Button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Intrinsic value / share</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{numberFormatter.format(result.intrinsicValue)}</p>
            {typeof result.upside === "number" ? (
              <p className="mt-2 text-sm text-text-secondary">
                Upside {result.upside >= 0 ? "+" : ""}
                {result.upside.toFixed(1)}%
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Enterprise value</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{formatMillions(result.enterpriseValue)}</p>
            <p className="mt-2 text-sm text-text-secondary">Terminal contribution {formatMillions(result.presentTerminalValue)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Recommendation</p>
            <p
              className={cn("mt-3 text-lg font-semibold", {
                "text-emerald-400": result.tone === "positive",
                "text-text-secondary": result.tone === "neutral",
                "text-rose-400": result.tone === "negative",
              })}
            >
              {result.recommendation ?? "Plug in a price to see guidance."}
            </p>
            <p className="mt-2 text-xs text-text-muted">Prototype phrasing preserved for continuity.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

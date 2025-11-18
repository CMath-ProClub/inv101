"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

type PeResult = {
  pe: number;
  earningsYield: number;
  peg?: number;
  valuation: string;
  tone: "positive" | "neutral" | "warn" | "danger";
};

export function PeRatioCalculatorForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState({ price: 150, eps: 10, growthRate: 15 });
  const [result, setResult] = useState<PeResult | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: Number(value) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inputs.eps) return;
    const pe = inputs.price / inputs.eps;
    const earningsYield = (1 / pe) * 100;
    let valuation = "";
    let tone: PeResult["tone"] = "neutral";

    if (pe < 0) {
      valuation = "Negative P/E — company is unprofitable.";
      tone = "danger";
    } else if (pe < 15) {
      valuation = "Low P/E — potentially undervalued.";
      tone = "positive";
    } else if (pe <= 25) {
      valuation = "Moderate P/E — fair valuation range.";
      tone = "neutral";
    } else if (pe <= 40) {
      valuation = "High P/E — premium priced growth.";
      tone = "warn";
    } else {
      valuation = "Very high P/E — frothy expectations.";
      tone = "danger";
    }

    let peg: number | undefined;
    if (inputs.growthRate > 0) {
      peg = pe / inputs.growthRate;
    }

    setResult({ pe, earningsYield, peg, valuation, tone });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="price">Stock price ($)</Label>
          <Input id="price" type="number" step={0.01} value={inputs.price} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="eps">Earnings per share ($)</Label>
          <Input id="eps" type="number" step={0.01} value={inputs.eps} onChange={handleChange} />
          <p className="mt-1 text-xs text-text-muted">Use TTM EPS for parity with prototype.</p>
        </div>
        <div>
          <Label htmlFor="growthRate">Expected growth rate (%)</Label>
          <Input id="growthRate" type="number" step={0.1} value={inputs.growthRate} onChange={handleChange} />
        </div>
        <div className="md:col-span-3 md:flex md:justify-end">
          <Button type="submit" className="w-full md:w-auto">Run valuation</Button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">P/E ratio</p>
            <p className="mt-2 text-3xl font-semibold text-text-primary">{result.pe.toFixed(2)}</p>
            <p className="mt-1 text-sm text-text-secondary">Earnings yield {result.earningsYield.toFixed(2)}%</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">PEG ratio</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {typeof result.peg === "number" ? result.peg.toFixed(2) : "Add growth rate"}
            </p>
            <p className="mt-1 text-sm text-text-secondary">PEG &lt; 1 ≈ undervalued • 1-2 ≈ fair • &gt; 2 ≈ overvalued</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Valuation read</p>
            <p
              className={cn("mt-3 text-lg font-semibold", {
                "text-emerald-400": result.tone === "positive",
                "text-text-secondary": result.tone === "neutral",
                "text-amber-300": result.tone === "warn",
                "text-rose-400": result.tone === "danger",
              })}
            >
              {result.valuation}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

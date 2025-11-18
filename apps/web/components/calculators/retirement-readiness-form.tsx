"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type RetirementResult = {
  finalSavings: number;
  yearsToRetire: number;
  totalContributed: number;
  growth: number;
  sustainableIncome: number;
  assessment: string;
  tone: "positive" | "warn" | "danger";
  shortfall?: number;
};

export function RetirementReadinessForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retireAge: 65,
    currentSavings: 50000,
    monthlyContribution: 500,
    returnRate: 7,
    desiredIncome: 50000,
  });
  const [result, setResult] = useState<RetirementResult | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: Number(value) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const yearsToRetire = Math.max(inputs.retireAge - inputs.currentAge, 1);
    const monthlyRate = inputs.returnRate / 100 / 12;
    const months = yearsToRetire * 12;

    const futureValueCurrent = inputs.currentSavings * Math.pow(1 + inputs.returnRate / 100, yearsToRetire);
    const fvContrib = monthlyRate === 0 ? inputs.monthlyContribution * months : inputs.monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const finalSavings = futureValueCurrent + fvContrib;
    const totalContributed = inputs.currentSavings + inputs.monthlyContribution * months;
    const growth = finalSavings - totalContributed;
    const sustainableIncome = finalSavings * 0.04;

    let assessment = "";
    let tone: RetirementResult["tone"] = "positive";
    let shortfall: number | undefined;

    if (inputs.desiredIncome <= sustainableIncome) {
      assessment = "On track — projected income covers your target.";
    } else {
      shortfall = inputs.desiredIncome - sustainableIncome;
      const gapPct = shortfall / inputs.desiredIncome;
      if (gapPct < 0.2) {
        assessment = `Close! Short ${currency.format(shortfall)} per year.`;
        tone = "warn";
      } else {
        assessment = `Shortfall of ${currency.format(shortfall)} per year. Increase savings or adjust the goal.`;
        tone = "danger";
      }
    }

    setResult({ finalSavings, yearsToRetire, totalContributed, growth, sustainableIncome, assessment, tone, shortfall });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="currentAge">Current age</Label>
          <Input id="currentAge" type="number" min={18} value={inputs.currentAge} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="retireAge">Retirement age</Label>
          <Input id="retireAge" type="number" min={40} value={inputs.retireAge} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="currentSavings">Current savings ($)</Label>
          <Input id="currentSavings" type="number" step={1000} value={inputs.currentSavings} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="monthlyContribution">Monthly contribution ($)</Label>
          <Input id="monthlyContribution" type="number" step={50} value={inputs.monthlyContribution} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="returnRate">Expected annual return (%)</Label>
          <Input id="returnRate" type="number" step={0.1} value={inputs.returnRate} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="desiredIncome">Desired annual retirement income ($)</Label>
          <Input id="desiredIncome" type="number" step={1000} value={inputs.desiredIncome} onChange={handleChange} />
        </div>
        <div className="md:col-span-3 md:flex md:justify-end">
          <Button type="submit" className="w-full md:w-auto">Run projection</Button>
        </div>
      </form>

      {result ? (
        <div className="space-y-4 rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Projected savings</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{currency.format(result.finalSavings)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Years to retirement</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{result.yearsToRetire}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Total contributed</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{currency.format(result.totalContributed)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Investment growth</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-400">+{currency.format(result.growth)}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-outline/20 bg-surface-primary/40 p-4">
              <p className="text-sm font-semibold text-text-secondary">Sustainable income (4% rule)</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{currency.format(result.sustainableIncome)}</p>
            </div>
            <div className="rounded-2xl border border-outline/20 bg-surface-primary/40 p-4">
              <p className="text-sm font-semibold text-text-secondary">Desired income</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{currency.format(inputs.desiredIncome)}</p>
            </div>
          </div>
          <div
            className={cn("rounded-2xl border p-4 text-sm font-semibold", {
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-200": result.tone === "positive",
              "border-amber-500/30 bg-amber-500/10 text-amber-200": result.tone === "warn",
              "border-rose-500/30 bg-rose-500/10 text-rose-100": result.tone === "danger",
            })}
          >
            {result.assessment}
          </div>
        </div>
      ) : null}
    </div>
  );
}

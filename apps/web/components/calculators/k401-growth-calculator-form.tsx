"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type K401Result = {
  finalBalance: number;
  annualContribution: number;
  employerAnnual: number;
  totalEmployer: number;
};

export function K401GrowthCalculatorForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState({
    currentBalance: 25000,
    salary: 75000,
    contribution: 6,
    employerMatch: 50,
    matchLimit: 6,
    returnRate: 7,
    years: 30,
  });
  const [result, setResult] = useState<K401Result | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: Number(value) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const salary = Math.max(inputs.salary, 0);
    const contributionPct = Math.max(inputs.contribution, 0) / 100;
    const employerMatchPct = Math.max(inputs.employerMatch, 0) / 100;
    const matchLimit = Math.max(inputs.matchLimit, 0) / 100;
    const returnRate = inputs.returnRate / 100;
    const years = Math.max(inputs.years, 1);

    const annualContribution = salary * contributionPct;
    const matchable = Math.min(salary * contributionPct, salary * matchLimit);
    const employerAnnual = matchable * employerMatchPct;
    const totalAnnual = annualContribution + employerAnnual;

    const monthlyContribution = totalAnnual / 12;
    const monthlyRate = returnRate / 12;
    const months = years * 12;

    const futureValueCurrent = inputs.currentBalance * Math.pow(1 + returnRate, years);
    const fvContrib = monthlyRate === 0 ? monthlyContribution * months : monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const finalBalance = futureValueCurrent + fvContrib;

    setResult({
      finalBalance,
      annualContribution,
      employerAnnual,
      totalEmployer: employerAnnual * years,
    });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="currentBalance">Current 401(k) balance ($)</Label>
          <Input id="currentBalance" type="number" step={100} value={inputs.currentBalance} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="salary">Annual salary ($)</Label>
          <Input id="salary" type="number" step={1000} value={inputs.salary} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="contribution">Your contribution (% of salary)</Label>
          <Input id="contribution" type="number" step={0.1} value={inputs.contribution} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="employerMatch">Employer match (%)</Label>
          <Input id="employerMatch" type="number" step={0.1} value={inputs.employerMatch} onChange={handleChange} />
          <p className="mt-1 text-xs text-text-muted">Entering 50 equals a 50% match.</p>
        </div>
        <div>
          <Label htmlFor="matchLimit">Match limit (% of salary)</Label>
          <Input id="matchLimit" type="number" step={0.1} value={inputs.matchLimit} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="returnRate">Expected annual return (%)</Label>
          <Input id="returnRate" type="number" step={0.1} value={inputs.returnRate} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="years">Years until retirement</Label>
          <Input id="years" type="number" min={1} value={inputs.years} onChange={handleChange} />
        </div>
        <div className="md:self-end">
          <Button type="submit" className="w-full">Project balance</Button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Total at retirement</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{currency.format(result.finalBalance)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Your annual contribution</p>
            <p className="mt-3 text-xl font-semibold text-text-primary">{currency.format(result.annualContribution)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Employer annual match</p>
            <p className="mt-3 text-xl font-semibold text-emerald-400">{currency.format(result.employerAnnual)}</p>
            <p className="mt-1 text-xs text-text-muted">{currency.format(result.totalEmployer)} total free money</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

type MiningResult = {
  coinsPerDay: number;
  dailyRevenue: number;
  dailyElectricity: number;
  dailyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
  assessment: string;
  tone: "positive" | "warn" | "danger";
};

export function MiningProfitabilityForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState({
    hashRate: 100,
    power: 500,
    electricityCost: 0.12,
    difficulty: 500,
    blockReward: 6.25,
    coinPrice: 30000,
    poolFee: 1,
  });
  const [result, setResult] = useState<MiningResult | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: Number(value) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hashRateTH = inputs.hashRate / 1_000_000;
    const blocksPerDay = 144;
    const share = hashRateTH / Math.max(inputs.difficulty, 1e-6);
    const coinsPerDay = share * blocksPerDay * inputs.blockReward * (1 - inputs.poolFee / 100);
    const dailyRevenue = coinsPerDay * inputs.coinPrice;
    const kWhPerDay = (inputs.power / 1000) * 24;
    const dailyElectricity = kWhPerDay * inputs.electricityCost;
    const dailyProfit = dailyRevenue - dailyElectricity;
    const monthlyProfit = dailyProfit * 30;
    const yearlyProfit = dailyProfit * 365;

    let assessment = "";
    let tone: MiningResult["tone"] = "danger";
    if (dailyProfit > 10) {
      assessment = "Highly profitable mining operation.";
      tone = "positive";
    } else if (dailyProfit > 2) {
      assessment = "Profitable — solid hashrate to cost ratio.";
      tone = "positive";
    } else if (dailyProfit > 0) {
      assessment = "Marginal profits — monitor power costs.";
      tone = "warn";
    } else {
      assessment = "Mining at a loss — tweak rig or rates.";
      tone = "danger";
    }

    setResult({ coinsPerDay, dailyRevenue, dailyElectricity, dailyProfit, monthlyProfit, yearlyProfit, assessment, tone });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="hashRate">Hash rate (MH/s)</Label>
          <Input id="hashRate" type="number" step={1} value={inputs.hashRate} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="power">Power consumption (watts)</Label>
          <Input id="power" type="number" step={10} value={inputs.power} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="electricityCost">Electricity cost ($/kWh)</Label>
          <Input id="electricityCost" type="number" step={0.01} value={inputs.electricityCost} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="difficulty">Network difficulty (TH)</Label>
          <Input id="difficulty" type="number" step={1} value={inputs.difficulty} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="blockReward">Block reward (coins)</Label>
          <Input id="blockReward" type="number" step={0.01} value={inputs.blockReward} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="coinPrice">Coin price ($)</Label>
          <Input id="coinPrice" type="number" step={10} value={inputs.coinPrice} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="poolFee">Pool fee (%)</Label>
          <Input id="poolFee" type="number" step={0.1} value={inputs.poolFee} onChange={handleChange} />
        </div>
        <div className="md:flex md:items-end">
          <Button type="submit" className="w-full">Run profitability</Button>
        </div>
      </form>

      {result ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Coins per day</p>
              <p className="mt-3 text-2xl font-semibold text-text-primary">{result.coinsPerDay.toFixed(6)}</p>
            </div>
            <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Daily revenue</p>
              <p className="mt-3 text-2xl font-semibold text-emerald-400">{currency.format(result.dailyRevenue)}</p>
            </div>
            <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Daily electricity</p>
              <p className="mt-3 text-2xl font-semibold text-rose-400">{currency.format(result.dailyElectricity)}</p>
            </div>
            <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Daily profit</p>
              <p className={cn("mt-3 text-2xl font-semibold", result.dailyProfit >= 0 ? "text-text-primary" : "text-rose-400")}>{currency.format(result.dailyProfit)}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Monthly profit</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{currency.format(result.monthlyProfit)}</p>
            </div>
            <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Yearly profit</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{currency.format(result.yearlyProfit)}</p>
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

"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

type StakingResult = {
  finalBalance: number;
  rewards: number;
  initialValue: number;
  rewardsValue: number;
  finalValue: number;
  effectiveApy: number;
};

export function StakingYieldCalculatorForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState({
    stakedAmount: 1000,
    coinPrice: 50,
    apy: 5,
    period: 365,
    compounding: 365,
  });
  const [result, setResult] = useState<StakingResult | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: event.target.type === "number" ? Number(value) : Number(value) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const years = inputs.period / 365;
    const rate = inputs.apy / 100;
    const n = inputs.compounding;
    const finalBalance = inputs.stakedAmount * Math.pow(1 + rate / n, n * years);
    const rewards = finalBalance - inputs.stakedAmount;
    const initialValue = inputs.stakedAmount * inputs.coinPrice;
    const rewardsValue = rewards * inputs.coinPrice;
    const finalValue = finalBalance * inputs.coinPrice;
    const effectiveApy = (Math.pow(1 + rate / n, n) - 1) * 100;
    setResult({ finalBalance, rewards, initialValue, rewardsValue, finalValue, effectiveApy });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="stakedAmount">Staked amount (coins)</Label>
          <Input id="stakedAmount" type="number" step={0.1} value={inputs.stakedAmount} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="coinPrice">Coin price ($)</Label>
          <Input id="coinPrice" type="number" step={0.01} value={inputs.coinPrice} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="apy">APY (%)</Label>
          <Input id="apy" type="number" step={0.1} value={inputs.apy} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="period">Staking period</Label>
          <select
            id="period"
            value={inputs.period}
            onChange={handleChange}
            className="mt-1 h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            <option value={30}>1 month</option>
            <option value={90}>3 months</option>
            <option value={180}>6 months</option>
            <option value={365}>1 year</option>
            <option value={730}>2 years</option>
            <option value={1825}>5 years</option>
          </select>
        </div>
        <div>
          <Label htmlFor="compounding">Compounding frequency</Label>
          <select
            id="compounding"
            value={inputs.compounding}
            onChange={handleChange}
            className="mt-1 h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            <option value={365}>Daily</option>
            <option value={52}>Weekly</option>
            <option value={12}>Monthly</option>
            <option value={4}>Quarterly</option>
            <option value={1}>Annually</option>
          </select>
        </div>
        <div className="md:flex md:items-end">
          <Button type="submit" className="w-full">Calculate rewards</Button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Initial investment</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {result.finalBalance.toFixed(4)} coins
            </p>
            <p className="text-sm text-text-secondary">{currency.format(result.initialValue)}</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Rewards</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">+{result.rewards.toFixed(4)} coins</p>
            <p className="text-sm text-text-secondary">{currency.format(result.rewardsValue)} in USD</p>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Final value</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{currency.format(result.finalValue)}</p>
            <p className="text-sm text-text-secondary">Effective APY {result.effectiveApy.toFixed(2)}%</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

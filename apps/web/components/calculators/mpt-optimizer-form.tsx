"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

type RiskTolerance = "conservative" | "moderate" | "aggressive";

type MptResult = {
  weight1: number;
  weight2: number;
  expectedReturn: number;
  risk: number;
  sharpe: number;
};

const riskCopy: Record<RiskTolerance, string> = {
  conservative: "Prioritize downside protection and smoother returns.",
  moderate: "Balanced mix of return-seeking and defense.",
  aggressive: "Lean into higher-growth assets despite volatility.",
};

export function MptOptimizerForm({ className }: { className?: string }) {
  const [inputs, setInputs] = useState({
    return1: 10,
    vol1: 18,
    return2: 5,
    vol2: 6,
    correlation: 0.3,
  });
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("moderate");
  const [result, setResult] = useState<MptResult | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { id, value } = event.target;
    setInputs((prev) => ({ ...prev, [id]: Number(value) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const r1 = inputs.return1 / 100;
    const r2 = inputs.return2 / 100;
    const v1 = Math.max(inputs.vol1, 0.1) / 100;
    const v2 = Math.max(inputs.vol2, 0.1) / 100;
    const corr = Math.min(Math.max(inputs.correlation, -1), 1);

    let weight1: number;
    if (riskTolerance === "conservative") {
      const var1 = v1 * v1;
      const var2 = v2 * v2;
      const cov = corr * v1 * v2;
      weight1 = (var2 - cov) / Math.max(var1 + var2 - 2 * cov, 1e-6);
      weight1 = Math.min(Math.max(weight1, 0), 1);
    } else if (riskTolerance === "aggressive") {
      weight1 = r1 >= r2 ? 0.8 : 0.2;
    } else {
      const riskFree = 0.02;
      const sharpe1 = (r1 - riskFree) / v1;
      const sharpe2 = (r2 - riskFree) / v2;
      const totalSharpe = Math.max(sharpe1 + sharpe2, 1e-6);
      weight1 = sharpe1 / totalSharpe;
    }

    const weight2 = 1 - weight1;
    const portfolioReturn = weight1 * r1 + weight2 * r2;
    const portfolioVariance = weight1 * weight1 * v1 * v1 + weight2 * weight2 * v2 * v2 + 2 * weight1 * weight2 * corr * v1 * v2;
    const portfolioRisk = Math.sqrt(Math.max(portfolioVariance, 0));
    const sharpe = (portfolioReturn - 0.02) / Math.max(portfolioRisk, 1e-6);

    setResult({ weight1, weight2, expectedReturn: portfolioReturn, risk: portfolioRisk, sharpe });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-outline/20 bg-surface-muted/60 p-5">
          <p className="text-sm font-semibold text-text-secondary">Asset 1 (e.g., US equities)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="return1">Expected return (%)</Label>
              <Input id="return1" type="number" step={0.1} value={inputs.return1} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="vol1">Volatility (σ %)</Label>
              <Input id="vol1" type="number" step={0.1} value={inputs.vol1} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-outline/20 bg-surface-muted/60 p-5">
          <p className="text-sm font-semibold text-text-secondary">Asset 2 (e.g., bonds)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="return2">Expected return (%)</Label>
              <Input id="return2" type="number" step={0.1} value={inputs.return2} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="vol2">Volatility (σ %)</Label>
              <Input id="vol2" type="number" step={0.1} value={inputs.vol2} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-outline/20 bg-surface-primary/40 p-5">
          <div>
            <Label htmlFor="correlation">Correlation (-1 to 1)</Label>
            <Input id="correlation" type="number" step={0.05} min={-1} max={1} value={inputs.correlation} onChange={handleChange} />
            <p className="mt-2 text-xs text-text-muted">Lower correlation unlocks better diversification.</p>
          </div>
          <div>
            <Label htmlFor="riskTolerance">Risk tolerance</Label>
            <select
              id="riskTolerance"
              className="mt-1 h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
              value={riskTolerance}
              onChange={(event) => setRiskTolerance(event.target.value as RiskTolerance)}
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
            <p className="mt-2 text-xs text-text-muted">{riskCopy[riskTolerance]}</p>
          </div>
          <Button type="submit" className="w-full">Optimize portfolio</Button>
        </div>
      </form>

      {result ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Asset weights</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center justify-between text-text-secondary">
                <span>Asset 1</span>
                <span className="font-semibold text-text-primary">{(result.weight1 * 100).toFixed(1)}%</span>
              </li>
              <li className="flex items-center justify-between text-text-secondary">
                <span>Asset 2</span>
                <span className="font-semibold text-text-primary">{(result.weight2 * 100).toFixed(1)}%</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Portfolio stats</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt>Expected return</dt>
                <dd className="font-semibold text-emerald-400">{(result.expectedReturn * 100).toFixed(2)}%</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Portfolio risk</dt>
                <dd className="font-semibold text-amber-300">{(result.risk * 100).toFixed(2)}%</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Sharpe ratio</p>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{result.sharpe.toFixed(2)}</p>
            <p className="mt-2 text-sm text-text-secondary">Return per unit of risk assuming a 2% risk-free rate.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

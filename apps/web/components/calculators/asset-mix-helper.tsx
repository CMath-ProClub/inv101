"use client";

import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

const goals = [
  { value: "growth", label: "Growth" },
  { value: "balanced", label: "Balanced" },
  { value: "income", label: "Income" },
] as const;

type Goal = (typeof goals)[number]["value"];

type Mix = {
  label: string;
  value: number;
  tone: string;
};

function buildMix(risk: number, years: number, goal: Goal): Mix[] {
  const horizonFactor = Math.min(Math.max(years, 1), 40) / 40;
  const riskFactor = Math.min(Math.max(risk, 1), 5) / 5;

  let equityWeight = 35 + riskFactor * 40 + horizonFactor * 15;
  if (goal === "income") {
    equityWeight -= 15;
  } else if (goal === "growth") {
    equityWeight += 10;
  }
  equityWeight = Math.min(Math.max(equityWeight, 20), 85);

  const realAssets = goal === "growth" ? 10 : 7;
  const alternatives = goal === "growth" ? 8 : 5;
  const bonds = Math.max(0, 100 - equityWeight - realAssets - alternatives);
  const cash = Math.max(3, 100 - equityWeight - realAssets - alternatives - bonds);

  const normalized = [
    { label: "Equities", value: equityWeight, tone: "text-emerald-400" },
    { label: "Bonds", value: bonds, tone: "text-sky-400" },
    { label: "Real assets", value: realAssets, tone: "text-amber-300" },
    { label: "Alternatives", value: alternatives, tone: "text-purple-300" },
    { label: "Cash", value: cash, tone: "text-text-secondary" },
  ];

  const total = normalized.reduce((sum, entry) => sum + entry.value, 0);
  return normalized.map((entry) => ({ ...entry, value: Number(((entry.value / total) * 100).toFixed(1)) }));
}

export function AssetMixHelper({ className }: { className?: string }) {
  const [risk, setRisk] = useState(3);
  const [years, setYears] = useState(20);
  const [goal, setGoal] = useState<Goal>("balanced");

  const mix = useMemo(() => buildMix(risk, years, goal), [risk, years, goal]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
          <Label htmlFor="riskTolerance">Risk tolerance</Label>
          <Input
            id="riskTolerance"
            type="range"
            min={1}
            max={5}
            step={1}
            value={risk}
            onChange={(event) => setRisk(Number(event.target.value))}
            className="mt-3"
          />
          <p className="mt-2 text-sm text-text-secondary">Level {risk} of 5</p>
        </div>
        <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
          <Label htmlFor="years">Time horizon (years)</Label>
          <Input
            id="years"
            type="number"
            min={1}
            max={40}
            value={years}
            onChange={(event) => setYears(Number(event.target.value))}
            className="mt-2"
          />
          <p className="mt-2 text-sm text-text-secondary">Keeps the 110-minus-age heuristic in mind.</p>
        </div>
        <div className="rounded-2xl border border-outline/30 bg-surface-muted/60 p-4">
          <Label htmlFor="goal">Primary objective</Label>
          <select
            id="goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value as Goal)}
            className="mt-2 h-12 w-full rounded-2xl border border-outline/30 bg-transparent px-4 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {goals.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-text-secondary">Dial in the prototype-friendly presets.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-outline/30 bg-surface-primary/40 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Suggested allocation</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {mix.map((entry) => (
            <div key={entry.label} className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-secondary">{entry.label}</p>
                <span className={`text-2xl font-semibold ${entry.tone}`}>{entry.value}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-outline/20">
                <div className="h-full rounded-full bg-accent-primary" style={{ width: `${entry.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import type { Route } from "next";
import { Bot, Gamepad2, Swords } from "lucide-react";
import { WorkspaceGrid, type WorkspaceNavItem } from "../../components/layout/workspace-grid";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Interactive simulators, challenges, and XP-driven experiences inspired by the prototype playground.",
};

const playgroundNav: WorkspaceNavItem[] = [
  {
    title: "Simulator Deck",
    description: "Daily drills + reviews",
    href: "/playground/simulator" as Route,
    helper: "Practice",
    accent: "bg-gradient-to-br from-sky-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
    icon: Gamepad2,
  },
  {
    title: "AI Toolkit",
    description: "Coach & sparring",
    href: "/playground/ai-toolkit" as Route,
    helper: "Guidance",
    accent: "bg-gradient-to-br from-fuchsia-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
    icon: Bot,
  },
  {
    title: "Trading Battles",
    description: "Versus ladder",
    href: "/playground/trading-battles" as Route,
    helper: "Compete",
    accent: "bg-gradient-to-br from-amber-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
    icon: Swords,
  },
];

export default function PlaygroundPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Playground</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-text-primary">Game plan launchpad</h1>
            <p className="text-sm text-text-secondary">
              Three arenas cover repetition, coaching, and competitive ladders. Pick one and the layout stretches to fit.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">XP synced</span>
        </div>
        <WorkspaceGrid items={playgroundNav} className="md:auto-rows-[minmax(180px,1fr)]" />
      </section>
    </div>
  );
}

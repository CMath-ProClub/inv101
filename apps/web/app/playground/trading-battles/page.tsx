import { Metadata } from "next";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { StatusBanner } from "../../../components/ui/status-banner";
import { leagueTiers } from "../../../lib/league-tiers";

export const metadata: Metadata = {
  title: "Trading Battles",
  description:
    "Competitive queues, streak logic, and leaderboard formatting adapted from the trading battles prototypes.",
};

const features = [
  "Queue + matchmaking lifted from battle.html and matchmaking.js.",
  "Live streak, XP, and badge surfaces cloned from trading battles HUD elements.",
  "Post-match recap matching battle-history.html layouts with Clerk aware sharing.",
];

export default function TradingBattlesPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Playground • Competitive</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Head-to-head trading battles</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          The production upgrade keeps the same queue cadence, streak warnings, and recap cards so the competitive flow matches the prototype down to typography and spacing.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ported systems</CardTitle>
          <CardDescription>
            Every battle phase references <code>prototype/battle*.html</code>, <code>battle.js</code>, and <code>battle-history.js</code> for parity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4 text-sm text-text-secondary"
              >
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard integration</CardTitle>
          <CardDescription>
            Leaderboard rendering migrates from leaderboards.html with Clerk protected profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Competitive overlays syncing"
            description="We&apos;re finalizing score submission hooks to mirror the prototype flow before opening the queues."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>League tiers</CardTitle>
          <CardDescription>
            Rankings map 1:1 with the Achievements + Profile ladder so promotions feel consistent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {leagueTiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent-secondary">{tier.name}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{tier.xpRange}</p>
                <p className="mt-2 text-sm text-text-secondary">{tier.highlights}</p>
                <div className="mt-3 rounded-xl border border-dashed border-outline/30 bg-surface-base/60 p-3 text-xs text-text-secondary">
                  {tier.movement}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

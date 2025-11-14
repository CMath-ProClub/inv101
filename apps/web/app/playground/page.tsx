import { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowUpRight,
  Bot,
  GaugeCircle,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Interactive simulators, challenges, and XP-driven experiences inspired by the prototype playground.",
};

type Experience = {
  title: string;
  blurb: string;
  href: Route;
  tag: string;
  icon: ComponentType<{ className?: string }>;
};

const experiences: Experience[] = [
  {
    title: "Market Simulator",
    blurb:
      "Trade through adaptive scenarios with the same flow the prototype simulator showcased, including risk prompts and recap overlays.",
  href: "/playground/simulator" as Route,
    tag: "Daily drill",
    icon: Target,
  },
  {
    title: "Play the AI",
    blurb:
      "Face off against the AI coach pulled from the prototype battle screens to pressure-test conviction and timing.",
  href: "/playground/ai-toolkit" as Route,
    tag: "AI co-pilot",
    icon: Bot,
  },
  {
    title: "Trading Battles",
    blurb:
      "Queue into head-to-head matchups with leaderboard and streak logic lifted from the prototype trading battles suite.",
  href: "/playground/trading-battles" as Route,
    tag: "Competitive",
    icon: Swords,
  },
  {
    title: "Achievements & XP",
    blurb:
      "Track badge unlocks, streaks, and level-ups just like the achievements prototype, all wired into the unified XP ledger.",
  href: "/playground/achievements" as Route,
    tag: "Progress",
    icon: Trophy,
  },
];

const telemetry = [
  "XP bridges market drills, AI sparring, and calculator usage.",
  "Prototype widgets for streak warnings and bonus rounds carry forward.",
  "Progress sync is Clerk-aware so sessions persist across devices.",
];

export default function PlaygroundPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Playground Hub</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">
          Practice, compete, and level up with prototype-driven experiences
        </h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          The playground centralizes the simulator, AI sparring partner, and gamified trials from the legacy prototype so the production app keeps the same momentum and formatting.
        </p>
      </header>

      <Card className="border-dashed border-outline/30 bg-surface-muted/60">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle>Progress telemetry</CardTitle>
            <CardDescription>
              XP, streaks, and placement badges mirror the prototype widgets, now centralized through Clerk profiles.
            </CardDescription>
          </div>
          <GaugeCircle className="h-12 w-12 text-accent-primary" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {telemetry.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-outline/20 bg-surface-base/80 p-4 text-sm text-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        {experiences.map((experience) => {
          const Icon = experience.icon;
          return (
            <Card
              key={experience.title}
              className="group border-outline/20 bg-surface-muted/60 transition hover:border-accent-primary/60 hover:bg-surface-card/80"
            >
              <CardHeader className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-secondary">
                      {experience.tag}
                    </p>
                    <CardTitle>{experience.title}</CardTitle>
                    <CardDescription>{experience.blurb}</CardDescription>
                  </div>
                  <Icon className="h-10 w-10 text-accent-primary" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <Link
                  href={experience.href}
                  aria-label={`Open ${experience.title}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-primary transition hover:gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                >
                  Open workspace
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Sparkles className="h-5 w-5 text-accent-secondary opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

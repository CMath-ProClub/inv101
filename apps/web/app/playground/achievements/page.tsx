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
import { fetchAuthedApi } from "../../../lib/api";
import { leagueTiers } from "../../../lib/league-tiers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Achievements & XP",
  description:
    "Unified XP, streaks, and badge art migrated from achievements.html and calculator-xp-tracker.js.",
};

type AchievementItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  rarity: string;
  points: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
};

type AchievementsResponse = {
  success: boolean;
  achievements: AchievementItem[];
  stats: {
    total: number;
    unlocked: number;
    completion: number;
    totalPoints: number;
  };
};

const milestones = [
  "Badge art, gradients, and glow states originate from achievements.html.",
  "XP tracker logic comes from calculator-xp-tracker.js with Clerk persistence.",
  "Streak notifications reuse the toast styling from gamification-widget.js.",
];

const xpCaps = [
  {
    title: "Daily soft cap",
    detail: "500 XP before boosts; overflow stores as Prestige XP and unlocks Friday recap rewards.",
  },
  {
    title: "Weekly focus",
    detail: "Education completions earn 2× XP until 1,500 XP per week to prioritize structured learning.",
  },
  {
    title: "Lesson priority",
    detail: "If you hit the daily cap, new XP only counts from Education, budgeting labs, or onboarding replays.",
  },
];

const energyMatrix = [
  { action: "Education checkpoint", cost: "1 energy", note: "Covers budgeting lab steps and foundation lessons." },
  { action: "Simulator or battle", cost: "2 energy", note: "Refunds 1 energy on wins or perfect accuracy." },
  { action: "AI toolkit deep dive", cost: "3 energy", note: "Advises to queue after streak-safe tasks." },
  { action: "Calculator burst", cost: "½ energy", note: "Automatically batches every two calculations." },
];


function formatDate(value?: string) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export default async function AchievementsPage() {
  const data = await fetchAuthedApi<AchievementsResponse>("/api/achievements", {
    revalidateSeconds: 60,
  });

  const achievements = data?.achievements ? [...data.achievements] : [];
  const stats = data?.stats ?? { total: 0, unlocked: 0, completion: 0, totalPoints: 0 };
  const sortedAchievements = achievements
    .sort((left, right) => {
      if (left.isUnlocked !== right.isUnlocked) {
        return left.isUnlocked ? -1 : 1;
      }
      return (right.progress ?? 0) - (left.progress ?? 0);
    })
    .slice(0, 6);

  const hasLiveData = Boolean(data?.success && sortedAchievements.length > 0 && data?.stats);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Playground • Progress</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Track every win</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          The achievements hub pulls formatting, badge tiers, and XP math from the prototype so players instantly recognize the progression loop.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Prototype parity</CardTitle>
          <CardDescription>
            Visuals, copy, and animation curves remain true to the prototype assets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {milestones.map((milestone) => (
              <li
                key={milestone}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4 text-sm text-text-secondary"
              >
                {milestone}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>XP leveling + energy rules</CardTitle>
          <CardDescription>
            Caps, boosts, and energy costs mirror the legacy progression loop so players know exactly how to climb.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.32em] text-accent-secondary">Caps & boosts</h3>
            <ul className="mt-3 grid gap-3 md:grid-cols-3">
              {xpCaps.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
                >
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.32em] text-accent-secondary">Energy system</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {energyMatrix.map((entry) => (
                <div
                  key={entry.action}
                  className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.32em] text-text-muted">
                    <span>{entry.action}</span>
                    <span>{entry.cost}</span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{entry.note}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            Energy regenerates 1 point every 6 hours (4 hours for Rocket Platinum+) and fully refills every Monday alongside the weekly XP focus reset.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>League ladder</CardTitle>
          <CardDescription>
            Promotion and demotion rules that tie XP rankings to the Bullish Bronze through Wall Street Official journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
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

      {hasLiveData ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Progress snapshot</CardTitle>
              <CardDescription>
                Live achievement metrics synced from the production XP ledger.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Unlocked</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">
                    {stats.unlocked}
                    <span className="ml-2 text-xs font-normal text-text-muted">/ {stats.total}</span>
                  </dd>
                </div>
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Completion</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">{stats.completion}%</dd>
                </div>
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">XP banked</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">{stats.totalPoints}</dd>
                </div>
                <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">In flight</dt>
                  <dd className="mt-2 text-2xl font-semibold text-text-primary">
                    {sortedAchievements.filter((item) => !item.isUnlocked).length}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievement highlights</CardTitle>
              <CardDescription>
                The most recent unlocks and highest-progress targets pulled straight from the achievements service.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sortedAchievements.map((achievement) => {
                  const completion = Math.min(Math.round(achievement.progress ?? 0), 100);
                  const unlockedOn = formatDate(achievement.unlockedAt);

                  return (
                    <li
                      key={achievement._id}
                      className="space-y-3 rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">
                            {achievement.category}
                          </p>
                          <p className="text-base font-semibold text-text-primary">{achievement.title}</p>
                          <p className="text-xs text-text-muted">{achievement.description}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {achievement.points} XP
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-text-muted">
                          <span>{achievement.isUnlocked ? "Unlocked" : "Progress"}</span>
                          <span>{achievement.isUnlocked ? "100%" : `${completion}%`}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-outline/10">
                          <div
                            className={`h-full rounded-full ${achievement.isUnlocked ? "bg-accent-primary" : "bg-accent-secondary/80"}`}
                            style={{ width: `${achievement.isUnlocked ? 100 : completion}%` }}
                          />
                        </div>
                        {achievement.isUnlocked && unlockedOn ? (
                          <p className="text-xs text-text-muted">Unlocked on {unlockedOn}</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Rollout status</CardTitle>
          <CardDescription>
            Achievement sync hooks are routed to Clerk-backed profiles. When unavailable, we fall back to prototype messaging.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasLiveData ? (
            <p className="text-sm text-text-secondary">
              Live data is flowing from <code className="rounded bg-surface-muted/80 px-1.5 py-0.5 text-xs">/api/achievements</code>. Unlocks update in real time as XP posts to the ledger.
            </p>
          ) : (
            <StatusBanner
              status="offline"
              title="XP ledger temporarily unavailable"
              description="We&apos;ll surface the badge cabinet as soon as the achievements service responds."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

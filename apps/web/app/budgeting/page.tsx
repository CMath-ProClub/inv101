import { Metadata } from "next";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatusBanner } from "../../components/ui/status-banner";
import { fetchAuthedApi } from "../../lib/api";

export const metadata: Metadata = {
  title: "Budgeting Lab",
  description:
    "Production placeholder for the budgeting prototypes, keeping formatting ready for cashflow and goals modules.",
};

type ProfileSummary = {
  id: string;
  displayName: string;
  username: string;
  preferredTopics?: string[];
  learningGoals?: string[];
  riskTolerance?: string;
  subscriptionTier?: string;
  calculationsRun?: number;
  skillLevel?: string;
  level?: number;
  xp?: number;
};

type ProfileResponse = {
  success: boolean;
  user: ProfileSummary;
};

type GamificationResponse = {
  success: boolean;
  user: {
    stats: {
      lessonsCompleted: number;
      lessonsInProgress: number;
      quizzesPassed: number;
      totalTimeSpent: number;
      averageQuizScore: number;
    };
    xpForNextLevel: number;
  };
};

const roadmap = [
  "Cashflow heatmaps and envelope goals lifted from forthcoming budgeting prototypes.",
  "Recurring task cadence that ties into XP and streak logic.",
  "Connections to calculators (savings, retirement) to reuse shared UI chips.",
];

function formatHours(minutes?: number) {
  if (!minutes || minutes <= 0) return "0h";
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}

export default async function BudgetingPage() {
  const profileResponse = await fetchAuthedApi<ProfileResponse>("/api/profile/me", {
    revalidateSeconds: 60,
  });

  const profile = profileResponse?.success ? profileResponse.user : null;

  const gamificationResponse = profile
    ? await fetchAuthedApi<GamificationResponse>(`/api/user-profile/users/${profile.id}/gamification`, {
        revalidateSeconds: 180,
      })
    : null;

  const gamificationStats = gamificationResponse?.success ? gamificationResponse.user.stats : null;

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Planning</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Budgeting lab (coming soon)</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          This placeholder keeps the production slot ready for the budgeting and cash planning prototypes without losing the original layout or typography.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Roadmap highlights</CardTitle>
          <CardDescription>
            Each item aligns with planned migrations from the prototype budgeting stack.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {roadmap.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4 text-sm text-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Planning snapshot</CardTitle>
            <CardDescription>
              Budgeting preferences translated from your live profile and learning signals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Subscription tier</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{profile.subscriptionTier ?? "free"}</dd>
                <dd className="text-xs text-text-muted">Budgeting automations unlock with higher tiers.</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Risk tolerance</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{profile.riskTolerance ?? "moderate"}</dd>
                <dd className="text-xs text-text-muted">Used to shape envelope buffers.</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Skill level</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{profile.skillLevel ?? "new"}</dd>
                <dd className="text-xs text-text-muted">Level {profile.level ?? 1} · {profile.xp ?? 0} XP</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Calculations run</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{profile.calculationsRun ?? 0}</dd>
                <dd className="text-xs text-text-muted">Feeds budgeting projections.</dd>
              </div>
            </dl>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-accent-secondary">Preferred topics</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.preferredTopics ?? ["cashflow", "saving"]).map((topic) => (
                    <Badge key={topic} variant="soft" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-accent-secondary">Learning goals</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.learningGoals ?? ["build-wealth", "retirement"]).map((goal) => (
                    <Badge key={goal} variant="outline" className="text-xs">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {gamificationStats ? (
        <Card>
          <CardHeader>
            <CardTitle>Readiness metrics</CardTitle>
            <CardDescription>
              Lessons and quizzes already completed, informing budgeting onboarding modules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Lessons completed</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{gamificationStats.lessonsCompleted}</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Lessons in progress</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{gamificationStats.lessonsInProgress}</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Quizzes passed</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{gamificationStats.quizzesPassed}</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Study time</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{formatHours(gamificationStats.totalTimeSpent)}</dd>
                <dd className="text-xs text-text-muted">Avg score {gamificationStats.averageQuizScore}%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Implementation status</CardTitle>
          <CardDescription>
            Budgeting widgets activate as soon as calculator and goal endpoints finalize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                Your budgeting lab will preload with the preferences shown above so envelope targets, cadence reminders, and XP boosts mirror the prototype logic.
              </p>
              <p>
                Calculator and task hooks pull from <code className="rounded bg-surface-muted/80 px-1.5 py-0.5 text-xs">/api/profile/me</code> and <code className="rounded bg-surface-muted/80 px-1.5 py-0.5 text-xs">/api/user-profile/users/{profile.id}/gamification</code>.
              </p>
            </div>
          ) : (
            <StatusBanner
              status="offline"
              title="Budgeting data not yet available"
              description="We&apos;ll enable the planning widgets once the profile and gamification services respond."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

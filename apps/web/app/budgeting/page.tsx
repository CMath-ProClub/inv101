import type { Route } from "next";
import { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Calculator, Sparkles, Wallet } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { WorkspaceGrid, type WorkspaceNavItem } from "../../components/layout/workspace-grid";
import { StatusBanner } from "../../components/ui/status-banner";
import { fetchAuthedApi } from "../../lib/api";
import {
  budgetingQuickFlows,
  budgetingCalculatorShortcuts,
} from "../../lib/education-content";

export const dynamic = "force-dynamic";

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

type BudgetingQuickFlowResponse = {
  success: boolean;
  flows: typeof budgetingQuickFlows;
};

type BudgetingCalculatorShortcutResponse = {
  success: boolean;
  shortcuts: typeof budgetingCalculatorShortcuts;
};

const roadmap = [
  "Cashflow heatmaps and envelope goals lifted from forthcoming budgeting prototypes.",
  "Recurring task cadence that ties into XP and streak logic.",
  "Connections to calculators (savings, retirement) to reuse shared UI chips.",
];

const budgetingNav: WorkspaceNavItem[] = [
  {
    title: "Quick flows",
    helper: "Cashflow",
    description: "One-tap envelope presets wired into lessons.",
    href: { pathname: "/budgeting" as Route, hash: "quick-flows" },
    icon: Wallet,
    accent: "bg-gradient-to-br from-emerald-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Calculator bridges",
    helper: "Planning",
    description: "Savings, retirement, and ROI calculators stay in sync.",
    href: { pathname: "/budgeting" as Route, hash: "calculator-shortcuts" },
    icon: Calculator,
    accent: "bg-gradient-to-br from-sky-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Automation queue",
    helper: "Roadmap",
    description: "Status, rollout, and readiness checklist.",
    href: { pathname: "/budgeting" as Route, hash: "automation" },
    icon: CalendarCheck,
    accent: "bg-gradient-to-br from-amber-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Streak boosts",
    helper: "XP",
    description: "Profile + gamification metrics fuel automations.",
    href: { pathname: "/budgeting" as Route, hash: "readiness" },
    icon: Sparkles,
    accent: "bg-gradient-to-br from-fuchsia-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
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

  const [quickFlowsResponse, shortcutsResponse] = await Promise.all([
    fetchAuthedApi<BudgetingQuickFlowResponse>("/api/budgeting/quick-flows", {
      revalidateSeconds: 120,
      requireAuth: false,
    }),
    fetchAuthedApi<BudgetingCalculatorShortcutResponse>("/api/budgeting/calculator-shortcuts", {
      revalidateSeconds: 120,
      requireAuth: false,
    }),
  ]);

  const quickFlows = quickFlowsResponse?.success ? quickFlowsResponse.flows : budgetingQuickFlows;
  const calculatorShortcuts = shortcutsResponse?.success
    ? shortcutsResponse.shortcuts
    : budgetingCalculatorShortcuts;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Budgeting</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="soft">Planning</Badge>
            <h1 className="text-4xl font-semibold text-text-primary">Budgeting lab</h1>
            <p className="max-w-3xl text-sm text-text-secondary">
              Launch interactive cash planning flows, tie XP boosts to calculators, and preview the automation loops we mapped for you.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">4 workspaces</span>
        </div>
        <WorkspaceGrid items={budgetingNav} className="md:auto-rows-[minmax(160px,1fr)]" />
      </section>

      <section id="quick-flows">
        <Card>
          <CardHeader>
            <CardTitle>Quick launch flows</CardTitle>
            <CardDescription>
              One-click actions pair Education lessons with budgeting-specific tooling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {quickFlows.map((flow) => (
              <div
                key={flow.name}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">
                  <span>{flow.name}</span>
                  <span
                    className={
                      flow.status === "live"
                        ? "text-accent-primary"
                        : flow.status === "beta"
                          ? "text-accent-secondary"
                          : "text-text-muted"
                    }
                    aria-label={`Status: ${flow.status}`}
                  >
                    {flow.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{flow.summary}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-text-secondary">
            Live flows sync XP immediately; beta and upcoming flows keep formatting placeholders while backend automation finalizes.
          </p>
          </CardContent>
        </Card>
      </section>

      <section id="calculator-shortcuts">
        <Card>
          <CardHeader>
            <CardTitle>Calculator shortcuts</CardTitle>
            <CardDescription>
              Open the production calculators pre-wired for budgeting envelopes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
          {calculatorShortcuts.map((shortcut) => (
            <div
              key={shortcut.title}
              className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
            >
              <p className="text-sm font-semibold text-text-primary">{shortcut.title}</p>
              <p className="mt-1 text-sm text-text-secondary">{shortcut.description}</p>
              <Link
                href={shortcut.href}
                aria-label={`Launch ${shortcut.title}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent-primary transition hover:gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
              >
                Launch calculator
              </Link>
            </div>
          ))}
          </CardContent>
        </Card>
      </section>

      <section id="automation" className="grid gap-6 lg:grid-cols-2">
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
      </section>

      <section id="readiness" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Planning snapshot</CardTitle>
            <CardDescription>
              Budgeting preferences translated from your live profile and learning signals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile ? (
              <>
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
              </>
            ) : (
              <StatusBanner
                status="offline"
                title="Profile data not yet available"
                description="Connect your Investing101 account to preload budgeting preferences."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness metrics</CardTitle>
            <CardDescription>
              Lessons and quizzes already completed, informing budgeting onboarding modules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gamificationStats ? (
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
            ) : (
              <p className="text-sm text-text-secondary">
                XP streaks and drill stats will surface here once the gamification service responds.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

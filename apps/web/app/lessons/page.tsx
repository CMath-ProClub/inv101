import Link from "next/link";
import type { Route } from "next";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatusBanner } from "../../components/ui/status-banner";
import {
  featuredLesson,
  budgetingPlanSteps,
  budgetingTools,
} from "../../lib/education-content";

const budgetingRoute = "/budgeting" as Route;

export default function EducationPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Education</Badge>
        <h2 className="text-4xl font-semibold text-text-primary">Education hub</h2>
        <p className="max-w-3xl text-lg text-text-secondary">
          Preview refreshed lessons that pair fundamentals with real workflows. Every module now lists XP rewards, energy costs, and connected tools so learners can keep momentum.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Featured sample lesson</CardTitle>
          <CardDescription>
            A free preview learners can complete today while the full catalog migrates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
              <span>Sample · Free</span>
              <span>Duration · {featuredLesson.duration}</span>
              <span>Reward · {featuredLesson.xpReward} XP</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-text-primary">{featuredLesson.title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{featuredLesson.summary}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {featuredLesson.outcomes.map((outcome) => (
              <li
                key={outcome}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-3 text-sm text-text-secondary"
              >
                {outcome}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>Budgeting mini lesson plan · free</CardTitle>
            <CardDescription>
              A self-serve curriculum that pairs education with actionable tools. Each step costs 1 energy for free members and remains unlimited for subscribers.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-secondary">
              Lesson flow
            </h3>
            <ol className="mt-3 space-y-3 text-sm text-text-secondary">
              {budgetingPlanSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">
                      Step {index + 1}
                    </p>
                    <span className="text-xs font-semibold text-accent-secondary">+{step.xp} XP</span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-text-primary">{step.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {budgetingTools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                  Tool
                </p>
                <p className="mt-1 text-base font-semibold text-text-primary">{tool.name}</p>
                <p className="mt-1 text-sm text-text-secondary">{tool.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-outline/30 bg-surface-muted/50 p-4 text-sm text-text-secondary">
            <p className="flex-1">
              Ready to keep going? Continue inside the Budgeting Lab to unlock streak bonuses, connect envelopes to calculators, and sync XP directly to your league standings.
            </p>
            <Link
              href={budgetingRoute}
              aria-label="Open the budgeting lab"
              className="inline-flex items-center gap-2 rounded-full border border-accent-primary/40 bg-accent-primary/10 px-4 py-2 text-sm font-semibold text-accent-primary outline outline-2 outline-transparent transition hover:-translate-y-0.5 hover:border-accent-primary hover:outline-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              Open budgeting lab
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full catalog status</CardTitle>
          <CardDescription>
            The remaining Education modules are migrating from the prototype library with checkpoints, flash cards, and drill-down tabs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBanner
            status="loading"
            title="Education hub synchronizing"
            description="Interactive lesson modules will unlock after the knowledge base migration completes."
          />
        </CardContent>
      </Card>
    </div>
  );
}

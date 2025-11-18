import type { Route } from "next";
import { CalendarDays, BookOpenCheck } from "lucide-react";
import { WorkspaceGrid, type WorkspaceNavItem } from "../../components/layout/workspace-grid";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatusBanner } from "../../components/ui/status-banner";

const academyNav: WorkspaceNavItem[] = [
  {
    title: "Live workshops",
    helper: "Cohorts",
    description: "Office hours, firesides, and breakout drills.",
    href: { pathname: "/academy" as Route, hash: "workshops" },
    icon: CalendarDays,
    accent: "bg-gradient-to-br from-sky-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Resource library",
    helper: "On-demand",
    description: "Replays, transcripts, and study templates.",
    href: { pathname: "/academy" as Route, hash: "library" },
    icon: BookOpenCheck,
    accent: "bg-gradient-to-br from-emerald-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
];

const workshopSchedule = [
  {
    title: "Macro pulse office hours",
    cadence: "Mondays · 45 min",
    focus: "Catalysts, risk ranges, and sentiment cues",
  },
  {
    title: "Playbook build labs",
    cadence: "Wednesdays · 60 min",
    focus: "Hands-on walkthroughs with calculators + simulators",
  },
  {
    title: "Community guest sessions",
    cadence: "Fridays · 30 min",
    focus: "Member case studies and feedback loops",
  },
];

const resourceBuckets = [
  {
    title: "Deep dives",
    detail: "Multi-part walkthroughs with slides, templates, and reading prompts.",
  },
  {
    title: "Replays & transcripts",
    detail: "Indexed video chapters plus AI summaries for every session.",
  },
  {
    title: "Templates & briefs",
    detail: "Google Doc + Notion bundles so teams can remix workshop outputs instantly.",
  },
];

export default function AcademyPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Education</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="soft">Investing101 Academy</Badge>
            <h1 className="text-4xl font-semibold text-text-primary">Workshops, office hours, and deep dives</h1>
            <p className="max-w-3xl text-sm text-text-secondary">
              Two shortcuts keep the academy aligned with the new workspace grid—live programming on the left, on-demand resources on the right.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">2 shortcuts</span>
        </div>
        <WorkspaceGrid items={academyNav} className="md:auto-rows-[minmax(160px,1fr)]" />
      </section>

      <section id="workshops" className="grid gap-6 lg:grid-cols-[1.4fr,0.6fr]">
        <Card>
          <CardHeader>
            <CardTitle>Live workshop lineup</CardTitle>
            <CardDescription>Pick a cadence, reserve a seat, and sync notes to your profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workshopSchedule.map((session) => (
              <div key={session.title} className="rounded-3xl border border-outline/20 bg-surface-muted/50 p-4">
                <p className="text-sm font-semibold text-text-primary">{session.title}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">{session.cadence}</p>
                <p className="mt-1 text-sm text-text-secondary">{session.focus}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/10">
          <CardHeader>
            <CardTitle>Cohort roadmap</CardTitle>
            <CardDescription>Enrollment toggles live once the event portal is wired up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-text-secondary">
            <p>• Cohort 002 · “Market Stories” · Target launch: Dec 5</p>
            <p>• Cohort 003 · “Options Foundations” · Target launch: Jan 9</p>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-secondary">Status: Calendar wiring in progress</p>
          </CardContent>
        </Card>
      </section>

      <section id="library" className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Resource library</CardTitle>
            <CardDescription>Everything from replays to reusable templates lives here.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {resourceBuckets.map((bucket) => (
              <div key={bucket.title} className="rounded-3xl border border-outline/20 bg-surface-muted/50 p-4">
                <p className="text-sm font-semibold text-text-primary">{bucket.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{bucket.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portal status</CardTitle>
            <CardDescription>Registration, replays, and transcripts finalize after the next deploy.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBanner
              status="loading"
              title="Academy portal onboarding"
              description="Event registration and replays will appear here soon."
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

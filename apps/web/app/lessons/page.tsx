import type { Route } from "next";
import { WorkspaceGrid, type WorkspaceNavItem } from "../../components/layout/workspace-grid";
import {
  Activity,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Compass,
  GraduationCap,
  Layers,
  Trophy,
  Wallet,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { LessonIdeaForm } from "../../components/lessons/lesson-idea-form";
import { cn } from "../../lib/utils";

const lessonNav: WorkspaceNavItem[] = [
  {
    title: "Tracks & playlists",
    helper: "Pathways",
    description: "Foundations, instruments, market intel, and more.",
    href: { pathname: "/lessons" as Route, hash: "tracks" },
    icon: BookOpen,
    accent: "bg-gradient-to-br from-emerald-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Checkpoint drills",
    helper: "Accountability",
    description: "Timed quizzes, streak tracking, and skill checks.",
    href: { pathname: "/lessons" as Route, hash: "drills" },
    icon: Activity,
    accent: "bg-gradient-to-br from-sky-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Study hall",
    helper: "Community",
    description: "Templates, spotlights, and remix-ready guides.",
    href: { pathname: "/lessons" as Route, hash: "community" },
    icon: GraduationCap,
    accent: "bg-gradient-to-br from-indigo-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Idea lab",
    helper: "Feedback",
    description: "Submit lesson requests and earn creator XP.",
    href: { pathname: "/lessons" as Route, hash: "ideas" },
    icon: Trophy,
    accent: "bg-gradient-to-br from-amber-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
];

const educationNav: WorkspaceNavItem[] = [
  {
    title: "Lessons hub",
    helper: "Education",
    description: "Guided playlists, tracks, and checkpoints.",
    href: "/lessons" as Route,
    icon: BookOpen,
    accent: "bg-gradient-to-br from-emerald-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
  {
    title: "Budgeting lab",
    helper: "Planning",
    description: "Cashflow prototyping, goals, and calculator ties.",
    href: "/budgeting" as Route,
    icon: Wallet,
    accent: "bg-gradient-to-br from-sky-500/20 via-transparent to-surface-card/95",
    span: "md:col-span-3",
  },
];

const heroStats = [
  { label: "Micro-lessons", value: "60+", detail: "Ready to remix" },
  { label: "Interactive drills", value: "12", detail: "Per lesson track" },
  { label: "Completion boost", value: "3×", detail: "Faster with checkpoints" },
];

const lessonTracks = [
  {
    title: "Foundations",
    summary: "Mindset, money habits, and compounding power-ups for level zero investors.",
    highlights: [
      "Lightning-round glossary missions",
      "Animated explainers for risk and reward",
      "Instant-feedback checkpoint quizzes",
    ],
    cta: "Resume track",
    icon: GraduationCap,
    accent: "from-emerald-500/15 to-emerald-500/5",
  },
  {
    title: "Instruments & Accounts",
    summary: "Understand IRAs, 401(k)s, ETFs, and options with hands-on toolkits.",
    highlights: [
      "Account comparison builder",
      "Interactive trade ticket walkthroughs",
      "Scenario polls: what would you do?",
    ],
    cta: "Explore toolkit",
    icon: Layers,
    accent: "from-sky-500/15 to-sky-500/5",
  },
  {
    title: "Practical Investing",
    summary: "Portfolio rules, rebalance windows, and tax-aware execution drills.",
    highlights: [
      "Drag-and-drop portfolio lab",
      "Momentum, value, and income playbooks",
      "Community challenges to swap strategies",
    ],
    cta: "Open lab",
    icon: BarChart3,
    accent: "from-orange-500/15 to-orange-500/5",
  },
  {
    title: "Market Understanding",
    summary: "Decode macro signals, global flows, and sentiment to stay ready.",
    highlights: [
      "Interactive yield curve visualizer",
      "Macro bingo linking news to action",
      "Weekly “what changed?” recaps",
    ],
    cta: "Study the market",
    icon: Compass,
    accent: "from-indigo-500/15 to-indigo-500/5",
  },
];

const progressMilestones = [
  {
    title: "Primer complete",
    detail: "5 quests done",
    status: "done" as const,
    icon: BookOpenCheck,
  },
  {
    title: "Live drills",
    detail: "2 of 6 active",
    status: "active" as const,
    icon: Activity,
  },
  {
    title: "Certification",
    detail: "Unlocks when drills finish",
    status: "up-next" as const,
    icon: Trophy,
  },
];

const communitySpotlights = [
  {
    name: "@Alyssa",
    highlight: "Shared a risk-adjusted 401(k) mix downloaded 240 times.",
  },
  {
    name: "@KJ",
    highlight: "Posted an earnings-season checklist with audio summaries.",
  },
  {
    name: "@Mina",
    highlight: "Hit a 100% streak on macro flash-card drills.",
  },
];

export default function LessonsPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Lessons</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-text-primary">Investing101 lesson HQ</h1>
            <p className="text-sm text-text-secondary">
              Four shortcuts cover tracks, drills, study hall, and the idea lab so every education surface matches the
              new workspace look.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">4 shortcuts</span>
        </div>
        <WorkspaceGrid items={lessonNav} className="md:auto-rows-[minmax(170px,1fr)]" />
      </section>

      <section className="grid gap-10 rounded-[32px] border border-outline/20 bg-surface-card/70 p-8 lg:grid-cols-[1.6fr,1fr]">
        <div className="space-y-6">
          <Badge variant="soft">Interactive academy</Badge>
          <div className="space-y-3">
            <h2 className="text-4xl font-semibold text-text-primary">Learning that feels like a game plan.</h2>
            <p className="text-lg text-text-secondary">
              Pick a track, collect badges, and revisit lessons as they evolve with each market cycle. Quick wins,
              downloadable cheat sheets, and interactive checkpoints keep momentum high.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <Card key={stat.label} className="border-none bg-surface-muted/60">
                <CardContent className="space-y-1 p-5">
                  <p className="text-3xl font-semibold text-text-primary">{stat.value}</p>
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-text-muted">{stat.label}</p>
                  <p className="text-xs text-text-secondary">{stat.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Card className="h-full bg-gradient-to-br from-accent-primary/15 via-transparent to-accent-secondary/15">
            <CardHeader>
              <CardTitle>Education quick links</CardTitle>
              <CardDescription>
                Lessons, labs, and briefing hubs stay pinned to this canvas for instant launching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkspaceGrid items={educationNav} className="md:auto-rows-[minmax(140px,1fr)]" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="tracks" className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Lesson tracks</p>
          <h2 className="text-3xl font-semibold text-text-primary">Pick a path or rotate weekly.</h2>
          <p className="text-sm text-text-secondary">Every playlist includes checkpoints, drills, and community templates.</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          {lessonTracks.map((track) => (
            <article
              key={track.title}
              className={cn(
                "group flex h-full flex-col rounded-3xl border border-outline/30 bg-surface-base/70 p-6 shadow-card transition hover:-translate-y-0.5",
                "bg-gradient-to-br",
                track.accent,
              )}
            >
              <header className="flex items-start gap-3">
                <div className="rounded-2xl bg-surface-card/80 p-3 shadow-card">
                  <track.icon className="h-6 w-6 text-text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-text-primary">{track.title}</h3>
                  <p className="text-sm text-text-secondary">{track.summary}</p>
                </div>
              </header>
              <ul className="mt-6 list-disc space-y-2 pl-6 text-sm text-text-secondary">
                {track.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center text-sm font-semibold text-accent-primary">
                {track.cta}
                <span aria-hidden="true" className="ml-1">→</span>
              </span>
            </article>
          ))}
        </div>
      </section>

      <section id="drills" className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Progress map</CardTitle>
              <CardDescription>Visual checkpoints so you always know what’s next.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressMilestones.map((milestone, index) => (
              <div key={milestone.title} className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl border text-lg",
                    milestone.status === "done" &&
                      "border-emerald-200 bg-emerald-50/80 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10",
                    milestone.status === "active" &&
                      "border-accent-primary/30 bg-accent-primary/10 text-accent-primary",
                    milestone.status === "up-next" &&
                      "border-outline/30 bg-surface-muted/40 text-text-secondary",
                  )}
                >
                  <milestone.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-text-primary">{milestone.title}</p>
                  <p className="text-sm text-text-secondary">{milestone.detail}</p>
                </div>
                {index < progressMilestones.length - 1 ? (
                  <span className="text-xs uppercase tracking-[0.3em] text-text-muted">→</span>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community spotlights</CardTitle>
              <CardDescription>Remix the strategies your peers publish each week.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {communitySpotlights.map((spotlight) => (
                <div key={spotlight.name} className="rounded-2xl border border-outline/20 bg-surface-muted/40 p-4">
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">{spotlight.name}</span> {spotlight.highlight}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <div id="ideas">
            <LessonIdeaForm />
          </div>
        </div>
      </section>

      <section id="community" className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Study hall updates</CardTitle>
            <CardDescription>Bring lesson notes, recap cards, and peer challenges into one workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-text-secondary">
            <p>Upcoming integrations will pin your favorite lesson templates next to calculator exports for faster review.</p>
            <p>Create remixable briefs, drop them in the community spotlight, and watch the XP roll in as peers copy them.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Community calendar</CardTitle>
            <CardDescription>Weekly office hours and fireside chats synced to your timezone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-text-secondary">
            <p>Macro Mondays · Tactical walkthrough focused on the latest market shifts.</p>
            <p>Workshop Wednesdays · Build a lesson kit live with other members.</p>
            <p>Feedback Fridays · Share streak data and get coach tips.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

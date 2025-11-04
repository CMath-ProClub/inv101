import {
  ArrowUpRight,
  BarChart2,
  BrainCircuit,
  Globe2,
  LineChart,
  Newspaper,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Link from "next/link";

const spotlightCards = [
  {
    title: "Daily Market Pulse",
    description:
      "Macro headlines distilled with actionable next steps for investors.",
    icon: Globe2,
    href: "/market",
  },
  {
    title: "AI-assisted Research",
    description:
      "Summarize filings, earnings calls, and alternative data in seconds.",
    icon: BrainCircuit,
    href: "/research",
  },
  {
    title: "Portfolio Intelligence",
    description:
      "Autopilot insights that highlight risk, drift, and opportunities.",
    icon: LineChart,
    href: "/portfolio",
  },
];

const metrics = [
  { label: "Tracked equities", value: "2,480", change: "+36" },
  { label: "Data ingestion jobs", value: "112", change: "+8" },
  { label: "Members this week", value: "1,294", change: "+12%" },
  { label: "Signals delivered", value: "3.2k", change: "+21%" },
];

const stories = [
  {
    title: "The algorithms outperforming the S&P in 2025",
    tag: "Quant trends",
    href: "/articles/quant-trends",
  },
  {
    title: "Eight alternative data feeds to watch this quarter",
    tag: "Data & AI",
    href: "/articles/alt-data",
  },
  {
    title: "How to rebalance confidently with factor tilts",
    tag: "Portfolio design",
    href: "/articles/rebalance",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-10 py-12 shadow-card">
        <div className="max-w-3xl space-y-6">
          <Badge variant="soft">Version 2 Launch Preview</Badge>
          <h2 className="text-4xl font-semibold tracking-tight text-white">
            A modern command center for learning, researching, and outperforming
            the market.
          </h2>
          <p className="text-lg text-slate-300">
            Invest101 brings together education, live analytics, and AI-assisted
            insights so motivated investors can move from novice to confident
            operator without leaving the platform.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-brand-400 bg-brand-500/10 px-5 py-2 text-sm font-semibold text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/20"
              href="/signup"
            >
              Get started
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
              href="/demo"
            >
              Explore interactive demo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/5 bg-white/5 p-4"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {metric.label}
              </dt>
              <dd className="mt-2 flex items-baseline gap-2 text-2xl font-semibold text-white">
                {metric.value}
                <span className="text-xs font-medium text-brand-200">
                  {metric.change}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card className="bg-slate-950/80">
            <CardHeader>
              <div>
                <CardTitle>Investor Spotlight</CardTitle>
                <CardDescription>
                  Curated workflows to accelerate analysis, education, and
                  execution.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              {spotlightCards.map((spotlight) => (
                <Link
                  key={spotlight.title}
                  href={spotlight.href}
                  className="group space-y-4"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-400/30 bg-brand-400/10 text-brand-100 shadow-card transition group-hover:border-brand-300 group-hover:text-brand-50">
                    <spotlight.icon className="h-6 w-6" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-brand-100">
                      {spotlight.title}
                    </h3>
                    <p className="text-sm text-slate-300">
                      {spotlight.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
                    View playbook
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-950/80">
            <CardHeader>
              <div>
                <CardTitle>Latest from the Academy</CardTitle>
                <CardDescription>
                  Deep-dive lessons and calculators refined for Version 2
                  launch.
                </CardDescription>
              </div>
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
                href="/lessons"
              >
                See all lessons
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {stories.map((story) => (
                <Link
                  key={story.title}
                  href={story.href}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-brand-300/60 hover:bg-brand-400/10"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
                      {story.tag}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-white group-hover:text-brand-100">
                      {story.title}
                    </h3>
                  </div>
                  <Newspaper className="h-6 w-6 text-brand-200 group-hover:text-brand-50" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-950/80">
          <CardHeader className="flex-col items-start gap-4">
            <Badge variant="outline">Live now</Badge>
            <div className="space-y-2">
              <CardTitle>Signal Monitor</CardTitle>
              <CardDescription>
                Real-time alerts generated from multi-source market
                intelligence.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  US Tech Momentum
                </p>
                <p className="text-xs text-slate-400">
                  Detecting divergence across top 50 growth tickers.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-100">
                <BarChart2 className="h-3 w-3" />
                Elevated
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Commodities Upswing
                </p>
                <p className="text-xs text-slate-400">
                  Sustained accumulation in energy & industrial metals.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-100">
                <LineChart className="h-3 w-3" />
                Watch
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

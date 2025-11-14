import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, BarChart2, BrainCircuit, Globe2, LineChart } from "lucide-react";

import { fetchApi } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { SimpleBoard } from "../components/layout/simple-board";
import { SimpleTile } from "../components/ui/simple-tile";

type TickerResponse = {
  success: boolean;
  count: number;
  tickers: string[];
};

type ArticleStatsResponse = {
  stats?: {
    total?: number;
    last3DaysPercent?: number | string;
    lastWeekPercent?: number | string;
  };
};

type Article = {
  title: string;
  source?: string;
  url?: string;
  publishDate?: string;
  summary?: string;
};

type ArticleMarketResponse = {
  groups?: Record<string, Article[]>;
};

type Recommendation = {
  symbol: string;
  name?: string;
  quote?: {
    price?: number;
    regularMarketPrice?: number;
    regularMarketChangePercent?: number;
  };
  recommendation?: {
    rating?: "bullish" | "neutral" | "bearish";
    score?: number;
    confidence?: number;
    priceNow?: number | null;
  };
};

type RecommendationResponse = {
  count?: number;
  recommendations?: Recommendation[];
};
type ArticleHighlight = {
  title: string;
  tag: string;
  href: string;
};

type SpotlightWorkflow = {
  label: string;
  title: string;
  description: string;
  href: Route;
};

function toNumber(value: number | string | undefined | null) {
  if (value === undefined || value === null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function pickPrice(quote?: Recommendation["quote"], fallback?: number | null) {
  if (!quote) return fallback ?? null;
  const candidates = [quote.price, quote.regularMarketPrice, fallback];
  for (const candidate of candidates) {
    const numeric = toNumber(candidate);
    if (numeric !== null && numeric > 0) {
      return numeric;
    }
  }
  return fallback ?? null;
}

const heroFeatures = [
  {
    icon: BarChart2,
    text: "Market dashboards surface breadth, sentiment, and sparkline trends in real time.",
  },
  {
    icon: BrainCircuit,
    text: "AI-assisted research condenses filings and news into ready-to-act playbooks.",
  },
  {
    icon: Globe2,
    text: "Multi-theme layouts keep accessibility dialed in from desktop command desks to mobile check-ins.",
  },
  {
    icon: LineChart,
    text: "Education tracks, simulators, and calculators stay linked to your saved progress.",
  },
];

const fallbackHighlights: ArticleHighlight[] = [
  { title: "The algorithms outperforming the S&P in 2025", tag: "Quant trends", href: "/articles/quant-trends" },
  { title: "Eight alternative data feeds to watch this quarter", tag: "Data & AI", href: "/articles/alt-data" },
  { title: "How to rebalance confidently with factor tilts", tag: "Portfolio design", href: "/articles/rebalance" },
];

const spotlightWorkflows: SpotlightWorkflow[] = [
  {
    label: "A",
    title: "Daily market pulse",
    description: "Macro headlines distilled with actionable next steps.",
    href: "/market",
  },
  {
    label: "B",
    title: "AI-assisted research",
    description: "Summaries of filings, earnings calls, and alternative data.",
    href: "/research",
  },
  {
    label: "C",
    title: "Portfolio intelligence",
    description: "Autopilot insights that highlight risk, drift, and opportunities.",
    href: "/portfolio",
  },
];

const navShortcuts: Array<{ letter: string; label: string; href: Route }> = [
  { letter: "A", label: "Overview", href: "/" },
  { letter: "B", label: "Playground", href: "/playground" },
  { letter: "C", label: "Lessons", href: "/lessons" },
  { letter: "D", label: "Calculators", href: "/calculators" },
  { letter: "E", label: "Profile", href: "/profile" },
];

const comparisonRows = [
  { label: "Mega-cap momentum vs SPX", note: "Intraday leadership", diff: "+1.4%" },
  { label: "Growth basket vs QQQ", note: "AI-heavy tilt", diff: "+0.8%" },
  { label: "Financials vs XLF", note: "Credit stabilization", diff: "-0.3%" },
];

const politicianHoldings = [
  { name: "Rep. Alvarez", focus: "Defense modernization", delta: "+$42k disclosed" },
  { name: "Sen. Carver", focus: "Broadband rollout", delta: "+$18k disclosed" },
  { name: "Rep. Nune", focus: "Energy transition", delta: "-$7k trimmed" },
];

const signUpRoute = "/sign-up" as Route;
const signInRoute = "/sign-in" as Route;
const demoRoute = "/demo" as Route;

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function collectHighlights(feed: ArticleMarketResponse | null): ArticleHighlight[] {
  const articles = Object.values(feed?.groups ?? {})
    .flat()
    .filter((article) => Boolean(article?.title))
    .sort((a, b) => {
      const aDate = new Date(a?.publishDate ?? 0).getTime();
      const bDate = new Date(b?.publishDate ?? 0).getTime();
      return bDate - aDate;
    })
    .slice(0, 3)
    .map((article) => ({
      title: article.title ?? "Untitled",
      tag: article.source ?? "Market",
      href: article.url ?? "#",
    }));

  return articles.length ? articles : fallbackHighlights;
}

export default async function HomePage() {
  const [tickerData, articleStats, recommendationsData, articlesData] = await Promise.all([
    fetchApi<TickerResponse>("/api/stocks/tickers", 600),
    fetchApi<ArticleStatsResponse>("/api/articles/stats", 600),
    fetchApi<RecommendationResponse>("/api/stocks/recommendations?limit=6", 300),
    fetchApi<ArticleMarketResponse>("/api/articles/market?limit=120", 300),
  ]);

  const recommendations = recommendationsData?.recommendations ?? [];
  const trackedEquities = tickerData?.count ?? null;
  const analyzerUniverse = (tickerData?.tickers ?? []).slice(0, 10);

  const stats = articleStats?.stats ?? {};
  const totalArticles = toNumber(stats.total ?? null);
  const recentCoverage = toNumber(stats.last3DaysPercent ?? null);
  const weeklyLift = toNumber(stats.lastWeekPercent ?? null);

  const signals = recommendations.slice(0, 3).map((entry) => ({
    symbol: entry.symbol,
    name: entry.name ?? entry.symbol,
    rating: entry.recommendation?.rating ?? "neutral",
    score: entry.recommendation?.score ?? 0,
    price: pickPrice(entry.quote, entry.recommendation?.priceNow ?? null),
  }));
  const signalsCount = recommendationsData?.count ?? signals.length;

  const highlights = collectHighlights(articlesData ?? null);

  const metrics = [
    {
      label: "Tracked equities",
      value: trackedEquities ? trackedEquities.toLocaleString() : "—",
      change: trackedEquities ? "live universe" : "sync pending",
    },
    {
      label: "Articles indexed",
      value: totalArticles ? totalArticles.toLocaleString() : "—",
      change: weeklyLift !== null ? `${weeklyLift.toFixed(1)}% past 7d` : "refill in progress",
    },
    {
      label: "Fresh coverage",
      value: recentCoverage !== null ? `${recentCoverage.toFixed(1)}%` : "—",
      change: "≤3 days",
    },
    {
      label: "Signals in rotation",
      value: signalsCount ? signalsCount.toString() : "—",
      change: signalsCount ? "auto refreshed" : "warming up",
    },
  ];

  return (
    <div className="space-y-10">
      <SimpleBoard
        badge="A · Command desk"
        title="Invest smarter with a simple, lettered layout"
        subtitle="Authenticate once, learn faster, and keep every workflow in a consistent frame."
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <Badge variant="soft">Version 2 preview</Badge>
            <p className="text-lg text-text-secondary">
              The homepage mirrors the diagram for rows A–E so you can always see where you are and what comes next.
            </p>
            <ul className="grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
              {heroFeatures.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 rounded-2xl border border-outline/10 bg-surface-muted/60 p-3">
                  <Icon className="mt-0.5 h-4 w-4 text-accent-primary" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-accent-primary/40 bg-accent-primary/10 px-5 py-2 text-sm font-semibold text-accent-primary outline outline-2 outline-transparent transition hover:outline-black"
                href={signUpRoute}
              >
                Create your account
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary outline outline-2 outline-transparent transition hover:text-text-primary hover:outline-black"
                href={demoRoute}
              >
                Explore the demo workspace
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-outline/20 bg-surface-muted/60 p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text-primary">Sign in with Clerk</h3>
              <p className="text-sm text-text-secondary">
                Resume saved workspaces, simulators, and personalized alerts on any device.
              </p>
            </div>
            <div className="grid gap-3 text-sm font-semibold">
              <Link
                href={signInRoute}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent-primary/40 bg-accent-primary/10 px-4 py-3 text-accent-primary outline outline-2 outline-transparent transition hover:border-accent-primary hover:outline-black"
              >
                Access your account
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href={signUpRoute}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline/30 bg-surface-base/90 px-4 py-3 text-text-primary outline outline-2 outline-transparent transition hover:border-accent-primary/60 hover:bg-accent-primary/10 hover:outline-black"
              >
                Create an account
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="rounded-xl border border-dashed border-outline/30 bg-surface-muted/80 p-4 text-xs text-text-secondary">
              Clerk handles passkeys, MFA, and session management. You can always manage devices from your Clerk profile after signing in.
            </p>
          </div>
        </div>
      </SimpleBoard>

      <SimpleBoard
        badge="B · Metrics"
        title="Market snapshot and workflows"
        subtitle="Stats stay pinned to the left, while spotlight workflows occupy the right column."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <dl className="grid gap-4 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">{metric.label}</dt>
                <dd className="mt-2 flex items-baseline gap-2 text-2xl font-semibold text-text-primary">
                  {metric.value}
                  <span className="text-xs font-medium text-accent-secondary">{metric.change}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-4 sm:grid-cols-2">
            {spotlightWorkflows.map((workflow) => (
              <SimpleTile
                key={workflow.title}
                label={`${workflow.label} · Workflow`}
                title={workflow.title}
                description={workflow.description}
                action={{ label: "View playbook", href: workflow.href }}
              />
            ))}
          </div>
        </div>
      </SimpleBoard>

      <SimpleBoard
        badge="C · Analyzer"
        title="Live analyzer and signals desk"
        subtitle="Tiles mimic the prototype labels z, y, and x within the same grid."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <SimpleTile
            label="z · Market analyzer"
            title="Universe snapshot"
            description="Live list seeded from the ticker API feed."
            tone="contrast"
          >
            <ul className="grid grid-cols-2 gap-2 text-sm text-text-secondary">
              {analyzerUniverse.map((ticker) => (
                <li key={ticker} className="rounded-xl border border-outline/20 px-3 py-2">
                  <span className="text-text-primary">{ticker}</span>
                  <span className="block text-[11px] uppercase tracking-[0.35em] text-text-muted">Tracked</span>
                </li>
              ))}
              {!analyzerUniverse.length && (
                <li className="col-span-2 rounded-xl border border-dashed border-outline/30 px-3 py-4 text-center text-sm">
                  Waiting on sync · data fallback in use
                </li>
              )}
            </ul>
          </SimpleTile>

          <SimpleTile
            label="y · Signals desk"
            title="Recommendations in rotation"
            description="Top ideas refresh as the backend delivers new scores."
          >
            <ul className="space-y-3 text-sm">
              {signals.length ? (
                signals.map((signal) => (
                  <li key={signal.symbol} className="rounded-xl border border-outline/20 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text-primary">{signal.symbol}</p>
                        <p className="text-xs text-text-secondary">{signal.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="soft" className="capitalize">
                          {signal.rating}
                        </Badge>
                        {signal.price && (
                          <p className="text-sm font-semibold text-text-primary">
                            {priceFormatter.format(signal.price)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text-muted">Score {signal.score.toFixed(1)}</p>
                  </li>
                ))
              ) : (
                <li className="rounded-xl border border-dashed border-outline/30 px-3 py-4 text-center text-sm text-text-secondary">
                  Signals warming up
                </li>
              )}
            </ul>
          </SimpleTile>
        </div>
      </SimpleBoard>

      <SimpleBoard
        badge="D · Research"
        title="Stories, comparisons, and public filings"
        subtitle="These tiles map to x, w, and v from the original diagram."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <SimpleTile
            label="x · Stock analysis"
            title="Story-driven focus"
            description="Latest three stories (or fallbacks) become the analysis tiles."
            tone="contrast"
          >
            <ul className="space-y-2 text-sm">
              {highlights.map((story) => (
                <li key={story.title} className="rounded-xl border border-outline/20 px-3 py-2">
                  <p className="font-semibold text-text-primary">{story.title}</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-text-muted">{story.tag}</p>
                </li>
              ))}
            </ul>
          </SimpleTile>

          <SimpleTile
            label="w · Stock vs index"
            title="Comparison ladder"
            description="Quick glance at how thematic baskets stack against benchmarks."
          >
            <ul className="space-y-2 text-sm">
              {comparisonRows.map((row) => (
                <li key={row.label} className="flex items-center justify-between rounded-xl border border-outline/20 px-3 py-2">
                  <div>
                    <p className="font-semibold text-text-primary">{row.label}</p>
                    <p className="text-xs text-text-secondary">{row.note}</p>
                  </div>
                  <span className="text-sm font-semibold text-accent-primary">{row.diff}</span>
                </li>
              ))}
            </ul>
          </SimpleTile>

          <SimpleTile
            label="v · Politician tracker"
            title="Public filing pulse"
            description="Static sample that mirrors the prototype layout."
            tone="info"
          >
            <ul className="space-y-2 text-sm">
              {politicianHoldings.map((holding) => (
                <li key={holding.name} className="rounded-xl border border-outline/20 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-text-primary">{holding.name}</p>
                    <span className="text-xs text-accent-secondary">{holding.delta}</span>
                  </div>
                  <p className="text-xs text-text-secondary">Focus · {holding.focus}</p>
                </li>
              ))}
            </ul>
          </SimpleTile>
        </div>
      </SimpleBoard>

      <SimpleBoard
        badge="E · Aux"
        title="Status, themes, and shortcuts"
        subtitle="Mirrors the footer row from the ASCII diagram to close out the loop."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <SimpleTile
            label="Aux · Shortcuts"
            title="Jump to other rows"
            description="Letters mirror the sidebar for muscle memory."
          >
            <div className="flex flex-wrap gap-2">
              {navShortcuts.map(({ letter, label, href }) => (
                <Link
                  key={letter}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border border-outline/30 px-3 py-1 text-xs font-semibold text-text-secondary"
                >
                  {letter} · {label}
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </SimpleTile>

          <SimpleTile
            label="Status"
            title="Data cadence"
            description={`${trackedEquities ? "Ticker universe live" : "Mock data"} · Signals refresh every few minutes.`}
            tone="contrast"
          />

          <SimpleTile
            label="Themes"
            title="Preview modes"
            description="Use the header theme switcher to keep the simple layout feeling fresh."
            tone="accent"
          />
        </div>
      </SimpleBoard>
    </div>
  );
}

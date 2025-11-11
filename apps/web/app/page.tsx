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
import type { Route } from "next";
import { fetchApi } from "../lib/api";
import { cn } from "../lib/utils";

type TickerResponse = {
  success: boolean;
  count: number;
  tickers: string[];
};

type ArticleStatsResponse = {
  success: boolean;
  stats: {
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
  success: boolean;
  groups: Record<string, Article[]>;
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
  success: boolean;
  count?: number;
  recommendations: Recommendation[];
};

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

const ratingClassMap: Record<string, string> = {
  bullish: "bg-emerald-500/20 text-emerald-300",
  bearish: "bg-rose-500/20 text-rose-300",
  neutral: "bg-surface-muted/70 text-text-secondary",
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

const defaultStories = [
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

const signUpRoute = "/sign-up" as Route;
const signInRoute = "/sign-in" as Route;
const demoRoute = "/demo" as Route;
const lessonsRoute = "/lessons" as Route;

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export default async function HomePage() {
  const [tickerData, articleStats, recommendationsData, articlesData] =
    await Promise.all([
      fetchApi<TickerResponse>("/api/stocks/tickers", 600),
      fetchApi<ArticleStatsResponse>("/api/articles/stats", 600),
      fetchApi<RecommendationResponse>("/api/stocks/recommendations?limit=6", 300),
      fetchApi<ArticleMarketResponse>("/api/articles/market?limit=120", 300),
    ]);

  const trackedEquities = tickerData?.count ?? null;
  const newsStats = articleStats?.stats;
  const totalArticles = toNumber(newsStats?.total ?? null);
  const recentPercent = toNumber(newsStats?.last3DaysPercent ?? null);
  const weekPercent = toNumber(newsStats?.lastWeekPercent ?? null);

  const recommendations = recommendationsData?.recommendations ?? [];
  const articleGroups = articlesData?.groups ?? {};
  const articleList = Object.values(articleGroups)
    .flat()
    .sort((a, b) => {
      const aDate = new Date(a.publishDate ?? 0).getTime();
      const bDate = new Date(b.publishDate ?? 0).getTime();
      return bDate - aDate;
    });
  const storyItems = articleList.length
    ? articleList.slice(0, 3).map((article) => ({
        title: article.title,
        tag: article.source || "Market",
        href: article.url || "#",
      }))
    : defaultStories;

  const signalTotal = recommendations.length || recommendationsData?.count || 0;
  const metrics = [
    {
      label: "Tracked equities",
      value: trackedEquities ? trackedEquities.toLocaleString() : "—",
      change: trackedEquities ? "live universe" : "sync pending",
    },
    {
      label: "Articles indexed",
      value: totalArticles ? totalArticles.toLocaleString() : "—",
      change:
        weekPercent !== null ? `${weekPercent.toFixed(1)}% past 7d` : "refill in progress",
    },
    {
      label: "Fresh coverage",
      value: recentPercent !== null ? `${recentPercent.toFixed(1)}%` : "—",
      change: "≤3 days",
    },
    {
      label: "Signals in rotation",
      value: signalTotal ? signalTotal.toString() : "—",
      change: signalTotal ? "auto refreshed" : "warming up",
    },
  ];

  const signals = recommendations.slice(0, 3).map((item) => {
    const rating = item.recommendation?.rating ?? "neutral";
    const price = pickPrice(item.quote, item.recommendation?.priceNow ?? null);
    return {
      symbol: item.symbol,
      name: item.name || item.symbol,
      rating,
      score: item.recommendation?.score ?? 0,
      price,
    };
  });

  return (
    <div className="space-y-12">
      <section className="grid gap-10 rounded-3xl border border-outline/20 bg-[radial-gradient(circle_at_top,_rgb(var(--surface-card))_0%,_rgb(var(--surface-base))_90%)] px-8 py-12 shadow-card sm:px-10 lg:grid-cols-[1.15fr_minmax(0,0.95fr)]">
        <div className="space-y-8">
          <Badge variant="soft">Version 2 Launch Preview</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              Invest smarter with a workspace built for action.
            </h1>
            <p className="text-lg text-text-secondary">
              Invest101 unifies onboarding, education, and market intelligence so you can authenticate once, learn faster, and execute with confidence.
            </p>
          </div>
          <ul className="grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
            <li className="flex items-start gap-3 rounded-2xl border border-outline/10 bg-surface-muted/60 p-3">
              <BarChart2 className="mt-0.5 h-4 w-4 text-accent-primary" />
              <span>Market dashboards surface breadth, sentiment, and sparkline trends in real time.</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl border border-outline/10 bg-surface-muted/60 p-3">
              <BrainCircuit className="mt-0.5 h-4 w-4 text-accent-primary" />
              <span>AI-assisted research condenses filings and news into ready-to-act playbooks.</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl border border-outline/10 bg-surface-muted/60 p-3">
              <Globe2 className="mt-0.5 h-4 w-4 text-accent-primary" />
              <span>Multi-theme layouts keep accessibility dialed in from desktop command desks to mobile check-ins.</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl border border-outline/10 bg-surface-muted/60 p-3">
              <LineChart className="mt-0.5 h-4 w-4 text-accent-primary" />
              <span>Lessons, simulators, and calculators stay linked to your saved progress and personalized alerts.</span>
            </li>
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
              Explore interactive demo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-6 shadow-inner">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-text-primary">Sign in with Clerk</h2>
              <p className="text-sm text-text-secondary">
                Securely authenticate with Clerk to resume saved workspaces, simulator runs, and personalized alerts on any device.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href={signInRoute}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-accent-primary/40 bg-accent-primary/10 px-4 py-3 text-sm font-semibold text-accent-primary outline outline-2 outline-transparent transition hover:border-accent-primary hover:bg-accent-primary/20 hover:outline-black"
              >
                Access your account
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={signUpRoute}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline/30 bg-surface-base/90 px-4 py-3 text-sm font-semibold text-text-primary outline outline-2 outline-transparent transition hover:border-accent-primary/60 hover:bg-accent-primary/10 hover:outline-black"
              >
                Create an account
              </Link>
            </div>
            <p className="mt-4 rounded-xl border border-dashed border-outline/30 bg-surface-muted/80 p-4 text-xs text-text-secondary">
              Clerk handles passwordless links, passkeys, and MFA for you. You can always manage sessions and devices from your Clerk profile after signing in.
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
              >
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {metric.label}
                </dt>
                <dd className="mt-2 flex items-baseline gap-2 text-2xl font-semibold text-text-primary">
                  {metric.value}
                  <span className="text-xs font-medium text-accent-secondary">
                    {metric.change}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] xl:gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Investor Spotlight</CardTitle>
                <CardDescription>
                  Curated workflows to accelerate analysis, education, and execution.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {spotlightCards.map((spotlight) => {
                const internal = spotlight.href.startsWith("/");
                const content = (
                  <>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent-primary/40 bg-accent-primary/10 text-accent-primary shadow-card transition group-hover:border-black group-hover:text-accent-primary">
                      <spotlight.icon className="h-6 w-6" />
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-primary">
                        {spotlight.title}
                      </h3>
                      <p className="text-sm text-text-secondary">{spotlight.description}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-secondary">
                      View playbook
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </>
                );

                return !internal ? (
                  <a
                    key={spotlight.title}
                    href={spotlight.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group space-y-4 outline outline-2 outline-transparent transition hover:outline-black"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={spotlight.title}
                    href={spotlight.href as Route}
                    className="group space-y-4 outline outline-2 outline-transparent transition hover:outline-black"
                  >
                    {content}
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Latest from the Academy</CardTitle>
                <CardDescription>
                  Deep-dive lessons and calculators refined for Version 2 launch.
                </CardDescription>
              </div>
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary outline outline-2 outline-transparent transition hover:text-text-primary hover:outline-black"
                href={lessonsRoute}
              >
                See all lessons
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {storyItems.map((story) => {
                const href = story.href || "#";
                const internal = href.startsWith("/");
                const body = (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-secondary">
                        {story.tag}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-text-primary group-hover:text-accent-primary">
                        {story.title}
                      </h3>
                    </div>
                    <Newspaper className="h-6 w-6 text-accent-primary group-hover:text-accent-secondary" />
                  </>
                );

                return !internal ? (
                  <a
                    key={story.title}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-outline/20 bg-surface-muted/60 p-4 outline outline-2 outline-transparent transition hover:outline-black"
                  >
                    {body}
                  </a>
                ) : (
                  <Link
                    key={story.title}
                    href={href as Route}
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-outline/20 bg-surface-muted/60 p-4 outline outline-2 outline-transparent transition hover:outline-black"
                  >
                    {body}
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col items-start gap-4">
            <Badge variant="outline">Live now</Badge>
            <div className="space-y-2">
              <CardTitle>Signal Monitor</CardTitle>
              <CardDescription>
                Real-time alerts generated from multi-source market intelligence.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {signals.length ? (
              signals.map((signal) => {
                const badgeClass = ratingClassMap[signal.rating] || ratingClassMap.neutral;
                const priceText =
                  typeof signal.price === "number" ? priceFormatter.format(signal.price) : "—";
                return (
                  <div
                    key={signal.symbol}
                    className="flex items-center justify-between rounded-2xl border border-outline/20 bg-surface-muted/60 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {signal.symbol} · {signal.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        Score {signal.score.toFixed(1)} · Price {priceText}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]",
                        badgeClass,
                      )}
                    >
                      {signal.rating === "bullish" ? (
                        <BarChart2 className="h-3 w-3" />
                      ) : signal.rating === "bearish" ? (
                        <LineChart className="h-3 w-3" />
                      ) : (
                        <Globe2 className="h-3 w-3" />
                      )}
                      {signal.rating.charAt(0).toUpperCase() + signal.rating.slice(1)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-outline/40 bg-surface-muted/60 p-4 text-sm text-text-secondary">
                Signals will populate once the recommendation engine completes its initial run. Check
                back shortly.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Sparkline } from "../../components/ui/sparkline";
import { StatusBanner } from "../../components/ui/status-banner";
import { Tabs } from "../../components/ui/tabs";
import { fetchApi } from "../../lib/api";
import { cn } from "../../lib/utils";

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: "always",
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

type Performer = {
  ticker: string;
  name: string;
  price?: number;
  changePercent?: number;
};

type PerformerResponse = {
  success: boolean;
  performers: Performer[];
  sp500?: {
    changePercent?: number;
  };
};

type SectorLeader = {
  symbol: string;
  name: string;
  changePercent: number;
};

type SectorSummary = {
  sector: string;
  count: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  avgChangePercent: number;
  totalMarketCap: number;
  topGainer: SectorLeader | null;
  topLoser: SectorLeader | null;
};

type SectorSummaryResponse = {
  success: boolean;
  sectors: SectorSummary[];
};

type Recommendation = {
  symbol: string;
  name?: string;
  recommendation?: {
    rating?: "bullish" | "neutral" | "bearish";
    score?: number;
    confidence?: number;
    priceNow?: number | null;
  };
  quote?: {
    price?: number;
    regularMarketPrice?: number;
    regularMarketChangePercent?: number;
  };
};

type RecommendationResponse = {
  success: boolean;
  recommendations: Recommendation[];
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

type DataStatus = "ready" | "loading" | "offline";

function formatPercent(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return percentFormatter.format(value / 100);
}

function formatPrice(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return priceFormatter.format(value);
}

function formatMarketCap(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "—";
  return compactCurrencyFormatter.format(value);
}

function pickQuotePrice(quote?: Recommendation["quote"], fallback?: number | null) {
  if (!quote) return fallback ?? null;
  const candidates = [quote.price, quote.regularMarketPrice, fallback];
  for (const candidate of candidates) {
    const num = typeof candidate === "number" ? candidate : Number(candidate);
    if (Number.isFinite(num) && num > 0) return num;
  }
  return fallback ?? null;
}

function extractArticles(data?: ArticleMarketResponse | null) {
  if (!data?.groups) return [] as Article[];
  return Object.values(data.groups)
    .flat()
    .sort((a, b) => {
      const aDate = new Date(a.publishDate ?? 0).getTime();
      const bDate = new Date(b.publishDate ?? 0).getTime();
      return bDate - aDate;
    });
}

function summarizeBreadth(sectors?: SectorSummary[]) {
  if (!sectors || sectors.length === 0) {
    return {
      totalStocks: 0,
      advancers: 0,
      decliners: 0,
      unchanged: 0,
    };
  }
  return sectors.reduce(
    (acc, sector) => {
      acc.totalStocks += sector.count || 0;
      acc.advancers += sector.advancers || 0;
      acc.decliners += sector.decliners || 0;
      acc.unchanged += sector.unchanged || 0;
      return acc;
    },
    { totalStocks: 0, advancers: 0, decliners: 0, unchanged: 0 },
  );
}

function confidenceLabel(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  const pct = Math.round(value * 100);
  if (pct >= 75) return `${pct}% · High`;
  if (pct >= 50) return `${pct}% · Medium`;
  return `${pct}% · Emerging`;
}

const ratingCopy: Record<string, string> = {
  bullish: "Upside momentum is building",
  neutral: "Balanced or indecisive price action",
  bearish: "Downside pressure is dominant",
};

function resolveStatus<T extends { success?: boolean }>(
  response: T | null | undefined,
  hasData: boolean,
): DataStatus {
  if (!response) return "offline";
  if (typeof response.success === "boolean" && response.success === false) {
    return "offline";
  }
  return hasData ? "ready" : "loading";
}

function MarketBreadthGauge({
  advancers,
  decliners,
  unchanged,
}: {
  advancers: number;
  decliners: number;
  unchanged: number;
}) {
  const total = advancers + decliners + unchanged;
  const advPct = total ? (advancers / total) * 100 : 0;
  const decPct = total ? (decliners / total) * 100 : 0;
  const advDeg = advPct * 3.6;
  const decDeg = decPct * 3.6;
  const gradient = `conic-gradient(rgb(var(--accent-primary)) ${advDeg}deg, rgb(var(--accent-secondary)) ${advDeg}deg ${advDeg + decDeg}deg, rgb(var(--outline-color)) ${advDeg + decDeg}deg 360deg)`;

  return (
    <div className="relative h-32 w-32">
      <div
        className="absolute inset-0 rounded-full border border-outline/30"
        style={{ backgroundImage: gradient }}
        aria-hidden="true"
      />
      <div className="absolute inset-3 flex flex-col items-center justify-center gap-1 rounded-full border border-outline/40 bg-surface-base/90 text-center">
        <span className="text-lg font-semibold text-text-primary">
          {advPct.toFixed(0)}%
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">
          Adv
        </span>
      </div>
    </div>
  );
}

export default async function MarketPage() {
  const [topResp, bottomResp, sectorResp, recResp, newsResp] = await Promise.all([
    fetchApi<PerformerResponse>("/api/stocks/top-performers?limit=12", 180),
    fetchApi<PerformerResponse>("/api/stocks/worst-performers?limit=12", 180),
    fetchApi<SectorSummaryResponse>("/api/stocks/sectors/summary", 300),
    fetchApi<RecommendationResponse>("/api/stocks/recommendations?limit=9", 300),
    fetchApi<ArticleMarketResponse>("/api/articles/market?limit=90", 300),
  ]);

  const topPerformers = topResp?.performers ?? [];
  const bottomPerformers = bottomResp?.performers ?? [];
  const sectors = sectorResp?.sectors ?? [];
  const recommendations = recResp?.recommendations ?? [];
  const articles = extractArticles(newsResp).slice(0, 15);

  const topStatus = resolveStatus(topResp, topPerformers.length > 0);
  const bottomStatus = resolveStatus(bottomResp, bottomPerformers.length > 0);
  const sectorsStatus = resolveStatus(sectorResp, sectors.length > 0);
  const recStatus = resolveStatus(recResp, recommendations.length > 0);
  const newsStatus = resolveStatus(newsResp, articles.length > 0);

  const breadth = summarizeBreadth(sectors);
  const advancerRatio = breadth.totalStocks
    ? (breadth.advancers / breadth.totalStocks) * 100
    : 0;
  const declinerRatio = breadth.totalStocks
    ? (breadth.decliners / breadth.totalStocks) * 100
    : 0;

  const tabItems = [
    {
      id: "overview",
      label: "Overview",
      description: "Daily breadth & movers",
      content: (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Leaders</CardTitle>
              <CardDescription>
                Top advancing equities across the Invest101 coverage universe.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {topStatus !== "ready" ? (
                <StatusBanner
                  status={topStatus === "offline" ? "offline" : "loading"}
                  title={
                    topStatus === "offline"
                      ? "Leaders feed temporarily offline"
                      : "Refreshing leaders"
                  }
                  description="We&apos;ll restore the table as soon as the intraday cache responds."
                  className="mb-4"
                />
              ) : null}
              {topPerformers.length ? (
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                      <th scope="col" className="py-2 pr-3">Symbol</th>
                      <th scope="col" className="py-2 pr-3">Name</th>
                      <th scope="col" className="py-2 pr-3 text-right">Price</th>
                      <th scope="col" className="py-2 pr-3 text-right">Change</th>
                      <th scope="col" className="py-2 pr-3 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/20 text-text-secondary">
                    {topPerformers.slice(0, 12).map((stock) => (
                      <tr key={stock.ticker} className="align-middle">
                        <th scope="row" className="py-2 pr-3 text-sm font-semibold text-text-primary">
                          {stock.ticker}
                        </th>
                        <td className="py-2 pr-3 text-text-secondary">{stock.name}</td>
                        <td className="py-2 pr-3 text-right text-text-primary">
                          {formatPrice(stock.price)}
                        </td>
                        <td className="py-2 pr-3 text-right font-semibold text-emerald-400">
                          {formatPercent(stock.changePercent)}
                        </td>
                        <td className="py-2 pl-3 text-right">
                          <Sparkline
                            changePercent={stock.changePercent}
                            status={topStatus}
                            label={`${stock.ticker} intraday drift`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : topStatus === "ready" ? (
                <p className="text-sm text-text-muted">
                  We&apos;re ready to populate this view as soon as symbols begin to trade today.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Breadth</CardTitle>
              <CardDescription>
                Participation snapshot across {breadth.totalStocks} tracked symbols.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="flex items-center justify-center">
                <MarketBreadthGauge
                  advancers={breadth.advancers}
                  decliners={breadth.decliners}
                  unchanged={breadth.unchanged}
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-secondary">
                    Advancers
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-text-primary">
                    {breadth.advancers.toLocaleString()} <span className="text-sm font-medium text-text-muted">({advancerRatio.toFixed(1)}%)</span>
                  </p>
                </div>
                <Badge variant="soft">
                  {topResp?.sp500?.changePercent !== undefined
                    ? `S&P ${formatPercent(topResp.sp500.changePercent)}`
                    : "Market Watch"}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
                    Decliners
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-text-primary">
                    {breadth.decliners.toLocaleString()} <span className="text-sm font-medium text-text-muted">({declinerRatio.toFixed(1)}%)</span>
                  </p>
                </div>
                <span className="text-xs text-text-muted">
                  Unchanged: {breadth.unchanged.toLocaleString()}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Under pressure
                </p>
                <ul className="mt-2 space-y-2 text-text-secondary">
                  {bottomStatus !== "ready" ? (
                    <StatusBanner
                      status={bottomStatus === "offline" ? "offline" : "loading"}
                      title={
                        bottomStatus === "offline"
                          ? "Losers feed temporarily offline"
                          : "Refreshing underperformers"
                      }
                      description="We highlight laggards once the next dataset arrives."
                    />
                  ) : (
                    bottomPerformers.slice(0, 4).map((stock) => (
                      <li key={stock.ticker} className="flex items-center justify-between gap-3 rounded-xl border border-outline/20 bg-surface-muted/60 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-text-primary">{stock.ticker}</span>
                          <Sparkline
                            changePercent={stock.changePercent}
                            status={bottomStatus}
                            label={`${stock.ticker} drawdown`}
                            className="h-10 w-20"
                          />
                        </div>
                        <span className="text-sm font-semibold text-rose-400">
                          {formatPercent(stock.changePercent)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "sectors",
      label: "Sectors",
      description: "Rotation & leadership",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Sector rotation dashboard</CardTitle>
            <CardDescription>
              Overview of performance, breadth, and capital concentration by sector.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {sectorsStatus !== "ready" ? (
              <StatusBanner
                status={sectorsStatus === "offline" ? "offline" : "loading"}
                title={
                  sectorsStatus === "offline"
                    ? "Sector analytics offline"
                    : "Crunching sector breadth"
                }
                description="Aggregating sector snapshots requires the latest cache run."
              />
            ) : null}
            {sectors.length ? (
              <table className="mt-4 min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th scope="col" className="py-2 pr-4">Sector</th>
                    <th scope="col" className="py-2 pr-4 text-right">Avg ±%</th>
                    <th scope="col" className="py-2 pr-4 text-right">Adv / Dec</th>
                    <th scope="col" className="py-2 pr-4 text-right">Market Cap</th>
                    <th scope="col" className="py-2 pr-4">Leaders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20 text-text-secondary">
                  {sectors.slice(0, 20).map((sector) => (
                    <tr key={sector.sector}>
                      <th scope="row" className="py-3 pr-4 font-semibold text-text-primary">
                        {sector.sector}
                      </th>
                      <td
                        className={cn(
                          "py-3 pr-4 text-right font-semibold",
                          sector.avgChangePercent >= 0
                            ? "text-emerald-400"
                            : "text-rose-400",
                        )}
                      >
                        {formatPercent(sector.avgChangePercent)}
                      </td>
                      <td className="py-3 pr-4 text-right text-text-secondary">
                        {sector.advancers}/{sector.decliners}
                      </td>
                      <td className="py-3 pr-4 text-right text-text-secondary">
                        {formatMarketCap(sector.totalMarketCap)}
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-secondary">
                        <div className="flex flex-col gap-1">
                          {sector.topGainer ? (
                            <span className="flex items-center gap-2">
                              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                                {sector.topGainer.symbol}
                              </span>
                              <span className="text-emerald-300">
                                {formatPercent(sector.topGainer.changePercent)}
                              </span>
                              <span className="truncate text-xs text-text-muted">
                                {sector.topGainer.name}
                              </span>
                            </span>
                          ) : null}
                          {sector.topLoser ? (
                            <span className="flex items-center gap-2">
                              <span className="rounded bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-300">
                                {sector.topLoser.symbol}
                              </span>
                              <span className="text-rose-300">
                                {formatPercent(sector.topLoser.changePercent)}
                              </span>
                              <span className="truncate text-xs text-text-muted">
                                {sector.topLoser.name}
                              </span>
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : sectorsStatus === "ready" ? (
              <p className="text-sm text-text-muted">
                Market breadth is loading. Check back in a few minutes for sector rotation detail.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "signals",
      label: "Signals",
      description: "AI recommendation stack",
      content: (
        <div className="grid gap-6 lg:grid-cols-3">
          {recStatus !== "ready" ? (
            <Card>
              <CardContent className="p-8">
                <StatusBanner
                  status={recStatus === "offline" ? "offline" : "loading"}
                  title={
                    recStatus === "offline"
                      ? "Signals temporarily offline"
                      : "Training recommendation stack"
                  }
                  description="AI rankings refresh in batches once live intraday inputs arrive."
                />
              </CardContent>
            </Card>
          ) : null}
          {recStatus === "ready" && recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-text-muted">
                Recommendation engine warming up. Check back shortly for live ranked ideas.
              </CardContent>
            </Card>
          ) : null}
          {recommendations.map((item) => {
            const rating = item.recommendation?.rating ?? "neutral";
            const price = pickQuotePrice(item.quote, item.recommendation?.priceNow ?? null);
            return (
              <Card key={item.symbol}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{item.symbol}</CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        rating === "bullish"
                          ? "border-emerald-400/70 text-emerald-400"
                          : rating === "bearish"
                            ? "border-rose-400/70 text-rose-400"
                            : "border-outline/50 text-text-secondary",
                      )}
                    >
                      {rating.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>{item.name || item.symbol}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-text-secondary">
                  <div className="flex items-center justify-between rounded-xl border border-outline/20 bg-surface-muted/60 px-3 py-2">
                    <span className="text-xs uppercase tracking-[0.25em] text-text-muted">
                      Confidence
                    </span>
                    <span className="font-semibold text-text-primary">
                      {confidenceLabel(item.recommendation?.confidence)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-text-muted">
                      Snapshot
                    </p>
                    <p className="text-sm text-text-primary">
                      {ratingCopy[rating]}
                    </p>
                    <p className="text-xs text-text-muted">
                      Price: {price ? formatPrice(price) : "—"} · Change: {formatPercent(item.quote?.regularMarketChangePercent)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ),
    },
    {
      id: "news",
      label: "News",
      description: "Fresh market intelligence",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Latest market coverage</CardTitle>
            <CardDescription>
              Curated headlines from premium sources covering notable flows, events, and disclosures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {newsStatus !== "ready" ? (
                <li>
                  <StatusBanner
                    status={newsStatus === "offline" ? "offline" : "loading"}
                    title={
                      newsStatus === "offline"
                        ? "Headlines paused"
                        : "Refreshing curated sources"
                    }
                    description="We collect cross-market stories continuously. Check back after the cache warms up."
                  />
                </li>
              ) : null}
              {articles.length === 0 ? (
                <li className="rounded-xl border border-dashed border-outline/40 bg-surface-muted/60 px-4 py-6 text-sm text-text-muted">
                  News cache is refreshing. Try again in a moment.
                </li>
              ) : (
                articles.map((article) => {
                  const published = article.publishDate
                    ? new Date(article.publishDate).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                  const href = article.url || "#";
                  const isExternal = href.startsWith("http");
                  const body = (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-secondary">
                        {article.source || "Market"}
                      </p>
                      <p className="text-base font-semibold text-text-primary">
                        {article.title}
                      </p>
                      {article.summary ? (
                        <p className="text-sm text-text-secondary">{article.summary}</p>
                      ) : null}
                      {published ? (
                        <p className="text-xs text-text-muted">{published}</p>
                      ) : null}
                    </div>
                  );
                  return (
                    <li
                      key={`${article.title}-${article.url || "local"}`}
                      className="rounded-xl border border-outline/30 bg-surface-muted/60 p-4 transition hover:outline hover:outline-2 hover:outline-black"
                    >
                      <a
                        href={href}
                        className="block space-y-1"
                        {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                      >
                        {body}
                      </a>
                    </li>
                  );
                })
              )}
            </ul>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Badge variant="soft">Market Command Center</Badge>
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary">
          Live market telemetry and rotation insights
        </h2>
        <p className="max-w-3xl text-lg text-text-secondary">
          Track leadership, breadth, and signal intelligence across the full Invest101 coverage universe.
          Tabs break down daily performance, sector flows, AI-driven ideas, and curated headlines so you can act with clarity.
        </p>
      </header>

      <Tabs items={tabItems} ariaLabel="Market analysis sections" />
    </div>
  );
}

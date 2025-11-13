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

export const metadata: Metadata = {
  title: "Market Simulator",
  description:
    "The production-ready version of the prototype market simulator, keeping the same drills, recaps, and streak logic.",
};

type SimulatorPosition = {
  symbol: string;
  companyName?: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
};

type PortfolioResponse = {
  success: boolean;
  portfolio: {
    id: string;
    cash: number;
    totalValue: number;
    totalPL: number;
    totalPLPercent: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    positions: SimulatorPosition[];
  };
};

type SimulatorStatsResponse = {
  success: boolean;
  stats: {
    totalTrades: number;
    buyTrades: number;
    sellTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalRealizedPL: number;
    totalVolume: number;
    averageTradeSize: number;
    winRate: number;
  };
};

const modules = [
  "Adaptive scenarios that remix bull, bear, and sideways flows pulled from market-simulator.html.",
  "Risk prompts and journaling checkpoints mirrored from simulator-invest101.html.",
  "Recap overlays that highlight P&L, XP, and suggested lessons just like the prototype ending cards.",
];

function formatCurrency(value?: number) {
  const safeValue = Number.isFinite(value) ? value! : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(safeValue);
}

function formatPercent(value?: number) {
  const safeValue = Number.isFinite(value) ? value! : 0;
  return `${safeValue.toFixed(2)}%`;
}

export default async function MarketSimulatorPage() {
  const [portfolioResponse, statsResponse] = await Promise.all([
    fetchAuthedApi<PortfolioResponse>("/api/simulator/portfolio", { revalidateSeconds: 30 }),
    fetchAuthedApi<SimulatorStatsResponse>("/api/simulator/stats", { revalidateSeconds: 30 }),
  ]);

  const portfolio = portfolioResponse?.success ? portfolioResponse.portfolio : null;
  const stats = statsResponse?.success ? statsResponse.stats : null;
  const positions = portfolio?.positions ?? [];
  const hasLiveData = Boolean(portfolio);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="soft">Playground • Simulator</Badge>
        <h1 className="text-4xl font-semibold text-text-primary">Market simulator migration</h1>
        <p className="max-w-3xl text-lg text-text-secondary">
          This workspace ports the interactive flows from the prototype simulator into the production stack so every drill, recap, and XP hook behaves the same way.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Feature parity checklist</CardTitle>
          <CardDescription>
            Each module directly references the markup and scripts from <code>prototype/market-simulator*.html</code> and <code>simulator-invest101.js</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-3">
            {modules.map((module) => (
              <li
                key={module}
                className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4 text-sm text-text-secondary"
              >
                {module}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {hasLiveData ? (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio snapshot</CardTitle>
            <CardDescription>
              Live simulator balances pulled directly from <code className="rounded bg-surface-muted/80 px-1.5 py-0.5 text-xs">/api/simulator/portfolio</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Cash available</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(portfolio!.cash)}</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Total value</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(portfolio!.totalValue)}</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Total P&amp;L</dt>
                <dd className={`mt-2 text-2xl font-semibold ${portfolio!.totalPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(portfolio!.totalPL)}
                  <span className="ml-2 text-xs font-normal text-text-muted">{formatPercent(portfolio!.totalPLPercent)}</span>
                </dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Trades executed</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{portfolio!.totalTrades}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      {hasLiveData ? (
        <Card>
          <CardHeader>
            <CardTitle>Open positions</CardTitle>
            <CardDescription>
              Current holdings with real-time pricing from the simulator engine.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {positions.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-secondary">
                  <span>Ticker</span>
                  <span className="text-right">Shares</span>
                  <span className="text-right">Avg cost</span>
                  <span className="text-right">Unrealized</span>
                </div>
                <ul className="space-y-3">
                  {positions.slice(0, 6).map((position) => {
                    const plClass = position.unrealizedPL >= 0 ? "text-emerald-400" : "text-rose-400";
                    return (
                      <li
                        key={position.symbol}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 rounded-2xl border border-outline/20 bg-surface-muted/60 p-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-text-primary">{position.symbol}</p>
                          <p className="text-xs text-text-muted">{position.companyName || ""}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-text-primary">{position.shares}</p>
                          <p className="text-xs text-text-muted">{formatCurrency(position.totalValue)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-text-primary">{formatCurrency(position.averageCost)}</p>
                          <p className="text-xs text-text-muted">Now {formatCurrency(position.currentPrice)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${plClass}`}>{formatCurrency(position.unrealizedPL)}</p>
                          <p className="text-xs text-text-muted">{formatPercent(position.unrealizedPLPercent)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {positions.length > 6 ? (
                  <p className="text-xs text-text-muted">Showing first six positions</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No active positions yet. Execute a trade to populate this list.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Current status</CardTitle>
          <CardDescription>
            Simulator stats are synced from Clerk-authenticated sessions to keep drills and recaps aligned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasLiveData && stats ? (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Win rate</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{formatPercent(stats.winRate)}</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Realized P&amp;L</dt>
                <dd className={`mt-2 text-2xl font-semibold ${stats.totalRealizedPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(stats.totalRealizedPL)}
                </dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Volume traded</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(stats.totalVolume)}</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Buy orders</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{stats.buyTrades}</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Sell orders</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{stats.sellTrades}</dd>
              </div>
              <div className="rounded-2xl border border-outline/20 bg-surface-muted/60 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">Avg trade size</dt>
                <dd className="mt-2 text-2xl font-semibold text-text-primary">{formatCurrency(stats.averageTradeSize)}</dd>
              </div>
            </dl>
          ) : (
            <StatusBanner
              status="offline"
              title="Simulator API unreachable"
              description="Live portfolio data will appear as soon as the simulator service responds."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

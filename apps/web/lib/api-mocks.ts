import { budgetingQuickFlows, budgetingCalculatorShortcuts } from "./education-content";

type MockEntry = {
  test: (path: string) => boolean;
  payload: () => unknown;
};

function matchRoute(segment: string) {
  return (path: string) => path.includes(segment);
}

function isoDate(hoursAgo = 0) {
  const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return date.toISOString();
}

const fallbackEntries: MockEntry[] = [
  {
    test: matchRoute("/api/stocks/tickers"),
    payload: () => ({
      success: true,
      count: 1425,
      tickers: ["AAPL", "MSFT", "NVDA", "META", "AMZN", "TSLA", "GOOG", "AMD", "NFLX", "SNOW"],
    }),
  },
  {
    test: matchRoute("/api/articles/stats"),
    payload: () => ({
      success: true,
      stats: {
        total: 98231,
        last3DaysPercent: 12.4,
        lastWeekPercent: 37.1,
      },
    }),
  },
  {
    test: (path) => path.includes("/api/stocks/recommendations"),
    payload: () => ({
      success: true,
      count: 6,
      recommendations: [
        {
          symbol: "AAPL",
          name: "Apple",
          recommendation: { rating: "bullish", score: 84, confidence: 0.82, priceNow: 213.4 },
          quote: { price: 213.4, regularMarketChangePercent: 1.23 },
        },
        {
          symbol: "TSLA",
          name: "Tesla",
          recommendation: { rating: "neutral", score: 58, confidence: 0.64, priceNow: 186.22 },
          quote: { price: 186.22, regularMarketChangePercent: -0.34 },
        },
        {
          symbol: "NVDA",
          name: "NVIDIA",
          recommendation: { rating: "bullish", score: 91, confidence: 0.88, priceNow: 924.13 },
          quote: { price: 924.13, regularMarketChangePercent: 0.92 },
        },
        {
          symbol: "MSFT",
          name: "Microsoft",
          recommendation: { rating: "bullish", score: 77, confidence: 0.79, priceNow: 418.05 },
          quote: { price: 418.05, regularMarketChangePercent: 0.54 },
        },
        {
          symbol: "AMZN",
          name: "Amazon",
          recommendation: { rating: "neutral", score: 63, confidence: 0.58, priceNow: 182.77 },
          quote: { price: 182.77, regularMarketChangePercent: 0.11 },
        },
        {
          symbol: "NFLX",
          name: "Netflix",
          recommendation: { rating: "bearish", score: 41, confidence: 0.46, priceNow: 565.21 },
          quote: { price: 565.21, regularMarketChangePercent: -0.72 },
        },
      ],
    }),
  },
  {
    test: matchRoute("/api/articles/market"),
    payload: () => ({
      success: true,
      groups: {
        spotlight: [
          {
            title: "AI copilots accelerate research workflows",
            source: "Invest101 Desk",
            url: "https://newsroom.invest101.ai/ai-copilots",
            publishDate: isoDate(2),
            summary: "Analysts lean on copilots to summarize filings, monitor catalysts, and surface alerts in under five minutes.",
          },
          {
            title: "Retail flows rotate into quality megacaps",
            source: "Invest101 Desk",
            url: "https://newsroom.invest101.ai/quality-megacaps",
            publishDate: isoDate(6),
            summary: "ETF and options flow data points to renewed demand for balance-sheet strength amid volatility.",
          },
        ],
        alternativeData: [
          {
            title: "Satellite tracks confirm port throughput uptick",
            source: "Latitude",
            url: "https://data.latitude.ai/insights/port-throughput",
            publishDate: isoDate(12),
            summary: "Port congestion eased for the third consecutive week, hinting at smoother supply chains into summer.",
          },
          {
            title: "Credit card panel shows discretionary resilience",
            source: "SpendLogic",
            url: "https://spendlogic.ai/reports/discretionary",
            publishDate: isoDate(22),
            summary: "Entertainment and travel spend held higher than seasonal trends, supporting leisure equities.",
          },
        ],
      },
    }),
  },
  {
    test: matchRoute("/api/stocks/top-performers"),
    payload: () => ({
      success: true,
      sp500: { changePercent: 0.65 },
      performers: [
        { ticker: "ARM", name: "Arm Holdings", price: 134.21, changePercent: 6.5 },
        { ticker: "SMCI", name: "Super Micro Computer", price: 966.11, changePercent: 5.2 },
        { ticker: "ASML", name: "ASML", price: 927.33, changePercent: 4.9 },
        { ticker: "AVGO", name: "Broadcom", price: 1588.42, changePercent: 3.8 },
        { ticker: "SHOP", name: "Shopify", price: 76.23, changePercent: 3.1 },
        { ticker: "ADBE", name: "Adobe", price: 567.24, changePercent: 2.7 },
        { ticker: "NET", name: "Cloudflare", price: 82.14, changePercent: 2.4 },
        { ticker: "PANW", name: "Palo Alto Networks", price: 308.44, changePercent: 2.1 },
        { ticker: "MDB", name: "MongoDB", price: 362.11, changePercent: 1.9 },
        { ticker: "CRWD", name: "CrowdStrike", price: 313.62, changePercent: 1.7 },
        { ticker: "NOW", name: "ServiceNow", price: 738.95, changePercent: 1.6 },
        { ticker: "PLTR", name: "Palantir", price: 24.16, changePercent: 1.5 },
      ],
    }),
  },
  {
    test: matchRoute("/api/stocks/worst-performers"),
    payload: () => ({
      success: true,
      performers: [
        { ticker: "PDD", name: "PDD Holdings", price: 129.13, changePercent: -4.8 },
        { ticker: "XPEV", name: "XPeng", price: 8.79, changePercent: -4.2 },
        { ticker: "FSLY", name: "Fastly", price: 12.21, changePercent: -3.9 },
        { ticker: "COIN", name: "Coinbase", price: 228.55, changePercent: -3.4 },
        { ticker: "SQ", name: "Block", price: 76.91, changePercent: -3.1 },
        { ticker: "ETSY", name: "Etsy", price: 64.42, changePercent: -2.9 },
        { ticker: "RUN", name: "Sunrun", price: 14.22, changePercent: -2.7 },
        { ticker: "NIO", name: "NIO", price: 4.29, changePercent: -2.5 },
        { ticker: "BAC", name: "Bank of America", price: 38.05, changePercent: -2.3 },
        { ticker: "CSCO", name: "Cisco", price: 47.55, changePercent: -2.0 },
        { ticker: "PYPL", name: "PayPal", price: 61.74, changePercent: -1.8 },
        { ticker: "PARA", name: "Paramount Global", price: 11.03, changePercent: -1.6 },
      ],
    }),
  },
  {
    test: matchRoute("/api/stocks/sectors/summary"),
    payload: () => ({
      success: true,
      sectors: [
        {
          sector: "Technology",
          count: 245,
          advancers: 168,
          decliners: 62,
          unchanged: 15,
          avgChangePercent: 1.9,
          totalMarketCap: 12700000000000,
          topGainer: { symbol: "SMCI", name: "Super Micro", changePercent: 6.1 },
          topLoser: { symbol: "CSCO", name: "Cisco", changePercent: -1.8 },
        },
        {
          sector: "Consumer Discretionary",
          count: 173,
          advancers: 94,
          decliners: 66,
          unchanged: 13,
          avgChangePercent: 0.8,
          totalMarketCap: 5800000000000,
          topGainer: { symbol: "TSLA", name: "Tesla", changePercent: 3.2 },
          topLoser: { symbol: "PDD", name: "PDD", changePercent: -4.7 },
        },
        {
          sector: "Financials",
          count: 198,
          advancers: 88,
          decliners: 92,
          unchanged: 18,
          avgChangePercent: -0.3,
          totalMarketCap: 4100000000000,
          topGainer: { symbol: "MS", name: "Morgan Stanley", changePercent: 1.4 },
          topLoser: { symbol: "BAC", name: "Bank of America", changePercent: -2.2 },
        },
      ],
    }),
  },
  {
    test: matchRoute("/api/budgeting/quick-flows"),
    payload: () => ({
      success: true,
      flows: budgetingQuickFlows,
    }),
  },
  {
    test: matchRoute("/api/budgeting/calculator-shortcuts"),
    payload: () => ({
      success: true,
      shortcuts: budgetingCalculatorShortcuts,
    }),
  },
];

function normalizePath(path: string) {
  if (path.startsWith("http")) {
    try {
      const url = new URL(path);
      return `${url.pathname}${url.search}`;
    } catch {
      return path;
    }
  }
  return path;
}

export function getMockApiResponse(path: string) {
  const normalized = normalizePath(path);
  const match = fallbackEntries.find((entry) => entry.test(normalized));
  return match ? match.payload() : null;
}

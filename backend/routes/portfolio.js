const express = require('express');
const Portfolio = require('../models/Portfolio');
const { authMiddleware } = require('../middleware/auth');
const stockCache = require('../stockCache');
const stockMarketData = require('../stockMarketData');

const router = express.Router();

const STARTING_CASH = Number(process.env.SIM_STARTING_CASH || 100000);

function pickPrice(quote) {
  if (!quote || typeof quote !== 'object') return null;
  const candidates = [
    quote.price,
    quote.regularMarketPrice,
    quote.lastPrice,
    quote.close,
    quote.previousClose
  ];
  for (const value of candidates) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) {
      return num;
    }
  }
  return null;
}

async function loadQuoteSnapshot(symbols = []) {
  const result = {};
  const missing = [];
  const uniqueSymbols = Array.from(new Set(symbols.map((s) => String(s || '').toUpperCase()).filter(Boolean)));

  for (const symbol of uniqueSymbols) {
    const cached = stockCache.getStock ? stockCache.getStock(symbol) : null;
    if (cached) {
      const price = pickPrice(cached);
      if (price) {
        result[symbol] = {
          price,
          name: cached.name || cached.longName || cached.shortName || symbol
        };
        continue;
      }
    }
    missing.push(symbol);
  }

  if (missing.length > 0) {
    try {
      const liveQuotes = await stockMarketData.fetchStockQuotes(missing);
      for (const symbol of missing) {
        const quote = liveQuotes?.[symbol];
        const price = pickPrice(quote);
        if (price) {
          result[symbol] = {
            price,
            name: quote?.name || quote?.longName || quote?.shortName || symbol
          };
        }
      }
    } catch (error) {
      console.warn('Portfolio quote fetch failed:', error.message);
    }
  }

  return result;
}

async function resolveTradePrice(symbol, proposedPrice) {
  const numeric = Number(proposedPrice);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  const snapshot = await loadQuoteSnapshot([symbol]);
  return snapshot[symbol]?.price || null;
}

async function getOrCreatePortfolio(userId) {
  let portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) {
    portfolio = await Portfolio.create({
      userId,
      account: {
        accountValue: 0,
        buyingPower: STARTING_CASH,
        cash: STARTING_CASH,
        annualReturn: 0
      },
      holdings: [],
      shorts: []
    });
  }
  return portfolio;
}

function formatPosition(position, meta = {}, type = 'long') {
  const symbol = String(position.symbol || '').toUpperCase();
  const purchasePrice = Number(position.purchasePrice || 0);
  const qty = Number(position.qty || 0);
  const currentPrice = Number(meta.price || purchasePrice);
  const marketValue = Number((currentPrice * qty).toFixed(2));
  const change = type === 'short'
    ? Number((purchasePrice - currentPrice).toFixed(2))
    : Number((currentPrice - purchasePrice).toFixed(2));

  return {
    symbol,
    name: meta.name || symbol,
    purchasePrice: Number(purchasePrice.toFixed(2)),
    qty,
    currentPrice: Number(currentPrice.toFixed(2)),
    marketValue,
    change
  };
}

async function respondWithPortfolio(res, portfolio, options = {}) {
  const live = options.live === true;
  const symbols = [];
  portfolio.holdings.forEach((h) => symbols.push(h.symbol));
  (portfolio.shorts || []).forEach((s) => symbols.push(s.symbol));

  const quoteSnapshot = live && symbols.length > 0 ? await loadQuoteSnapshot(symbols) : {};
  const priceMap = Object.fromEntries(
    Object.entries(quoteSnapshot).map(([symbol, meta]) => [symbol, meta.price])
  );

  portfolio.recalculateAccountValue(priceMap);
  const cash = Number(portfolio.account.cash || 0);
  const netWorth = Number(portfolio.account.accountValue || 0) + cash;
  if (STARTING_CASH > 0) {
    const netReturn = ((netWorth - STARTING_CASH) / STARTING_CASH) * 100;
    portfolio.account.annualReturn = Number(netReturn.toFixed(2));
  }
  portfolio.account.cash = Number(cash.toFixed(2));
  portfolio.account.buyingPower = Number(Math.max(0, portfolio.account.buyingPower || cash).toFixed(2));
  portfolio.account.accountValue = Number(Number(portfolio.account.accountValue || 0).toFixed(2));

  await portfolio.save();

  const payload = portfolio.toObject({ versionKey: false });
  payload.holdings = payload.holdings.map((holding) => {
    const meta = quoteSnapshot[holding.symbol?.toUpperCase()] || {};
    return formatPosition(holding, meta, 'long');
  });
  payload.shorts = (payload.shorts || []).map((shortPos) => {
    const meta = quoteSnapshot[shortPos.symbol?.toUpperCase()] || {};
    return formatPosition(shortPos, meta, 'short');
  });
  payload.account = {
    accountValue: Number(payload.account.accountValue || 0),
    buyingPower: Number(payload.account.buyingPower || 0),
    cash: Number(payload.account.cash || 0),
    annualReturn: Number(payload.account.annualReturn || 0)
  };

  return res.json({ success: true, portfolio: payload, live });
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const portfolio = await getOrCreatePortfolio(req.user.id);
    const live = String(req.query.live || '').toLowerCase() === 'true';
    return respondWithPortfolio(res, portfolio, { live });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return res.status(500).json({ success: false, error: 'Unable to load portfolio.' });
  }
});

router.post('/buy', authMiddleware, async (req, res) => {
  try {
    const symbol = String(req.body.symbol || '').toUpperCase();
    const qty = Number(req.body.qty);
    if (!symbol || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Valid symbol and quantity are required.' });
    }

    const portfolio = await getOrCreatePortfolio(req.user.id);
    const price = await resolveTradePrice(symbol, req.body.price);
    if (!price) {
      return res.status(400).json({ success: false, error: 'Unable to resolve price for trade.' });
    }

    const cost = price * qty;
    const cash = Number(portfolio.account.cash || STARTING_CASH);
    if (cost > cash) {
      return res.status(400).json({ success: false, error: 'Insufficient cash for purchase.' });
    }

    const existing = portfolio.holdings.find((h) => h.symbol === symbol);
    if (existing) {
      const existingQty = Number(existing.qty || 0);
      const totalCost = existing.purchasePrice * existingQty + cost;
      const newQty = existingQty + qty;
      existing.qty = newQty;
      existing.purchasePrice = Number((totalCost / newQty).toFixed(2));
    } else {
      portfolio.holdings.push({ symbol, qty, purchasePrice: Number(price.toFixed(2)) });
    }

    portfolio.account.cash = Number((cash - cost).toFixed(2));
    portfolio.account.buyingPower = Number(Math.max(0, portfolio.account.cash).toFixed(2));

    return respondWithPortfolio(res, portfolio, { live: true });
  } catch (error) {
    console.error('Portfolio buy error:', error);
    return res.status(500).json({ success: false, error: 'Unable to execute buy order.' });
  }
});

router.post('/sell', authMiddleware, async (req, res) => {
  try {
    const symbol = String(req.body.symbol || '').toUpperCase();
    const qty = Number(req.body.qty);
    if (!symbol || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Valid symbol and quantity are required.' });
    }

    const portfolio = await getOrCreatePortfolio(req.user.id);
    const price = await resolveTradePrice(symbol, req.body.price);
    if (!price) {
      return res.status(400).json({ success: false, error: 'Unable to resolve price for trade.' });
    }

    const holding = portfolio.holdings.find((h) => h.symbol === symbol);
    if (holding && Number(holding.qty || 0) >= qty) {
      const proceeds = price * qty;
      holding.qty = Number((Number(holding.qty) - qty).toFixed(4));
      if (holding.qty <= 0) {
        portfolio.holdings = portfolio.holdings.filter((h) => h.symbol !== symbol);
      }
      const cash = Number(portfolio.account.cash || 0) + proceeds;
      portfolio.account.cash = Number(cash.toFixed(2));
      portfolio.account.buyingPower = Number(Math.max(0, portfolio.account.cash).toFixed(2));
      return respondWithPortfolio(res, portfolio, { live: true });
    }

    const shortPos = (portfolio.shorts || []).find((s) => s.symbol === symbol);
    if (!shortPos || Number(shortPos.qty || 0) < qty) {
      return res.status(400).json({ success: false, error: 'No matching position to adjust.' });
    }

    const costToCover = price * qty;
    const availableCash = Number(portfolio.account.cash || 0);
    if (costToCover > availableCash) {
      return res.status(400).json({ success: false, error: 'Insufficient cash to cover short position.' });
    }

    shortPos.qty = Number((Number(shortPos.qty) - qty).toFixed(4));
    if (shortPos.qty <= 0) {
      portfolio.shorts = portfolio.shorts.filter((s) => s.symbol !== symbol);
    }

    portfolio.account.cash = Number((availableCash - costToCover).toFixed(2));
    portfolio.account.buyingPower = Number(Math.max(0, portfolio.account.cash).toFixed(2));

    return respondWithPortfolio(res, portfolio, { live: true });
  } catch (error) {
    console.error('Portfolio sell error:', error);
    return res.status(500).json({ success: false, error: 'Unable to execute sell order.' });
  }
});

router.post('/short', authMiddleware, async (req, res) => {
  try {
    const symbol = String(req.body.symbol || '').toUpperCase();
    const qty = Number(req.body.qty);
    if (!symbol || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Valid symbol and quantity are required.' });
    }

    const portfolio = await getOrCreatePortfolio(req.user.id);
    const price = await resolveTradePrice(symbol, req.body.price);
    if (!price) {
      return res.status(400).json({ success: false, error: 'Unable to resolve price for trade.' });
    }

    const proceeds = price * qty;
    const shortPos = (portfolio.shorts || []).find((s) => s.symbol === symbol);
    if (shortPos) {
      const existingQty = Number(shortPos.qty || 0);
      const totalCost = shortPos.purchasePrice * existingQty + price * qty;
      const newQty = existingQty + qty;
      shortPos.qty = newQty;
      shortPos.purchasePrice = Number((totalCost / newQty).toFixed(2));
    } else {
      portfolio.shorts.push({ symbol, qty, purchasePrice: Number(price.toFixed(2)) });
    }

    const cash = Number(portfolio.account.cash || 0) + proceeds;
    portfolio.account.cash = Number(cash.toFixed(2));
    portfolio.account.buyingPower = Number(Math.max(0, portfolio.account.cash).toFixed(2));

    return respondWithPortfolio(res, portfolio, { live: true });
  } catch (error) {
    console.error('Portfolio short error:', error);
    return res.status(500).json({ success: false, error: 'Unable to execute short order.' });
  }
});

module.exports = router;


const seedrandom = require('seedrandom');
// yahoo-finance2 for richer historical data
let yahoo;
try {
  yahoo = require('yahoo-finance2').default;
  if (typeof yahoo.suppressNotices === 'function') {
    yahoo.suppressNotices(['ripHistorical']);
  }
} catch (e) {
  yahoo = null;
}

// This simulator uses only Yahoo Finance (via yahoo-finance2) as the historical data source.
// Other fallbacks (local JSON, Alpha Vantage) have been removed per project requirements.

// Fetch historical data using yahoo-finance2 (required)
async function fetchHistoricalYahoo(symbol = 'SPY') {
  if (!yahoo) throw new Error('yahoo-finance2 is not installed or could not be loaded. Install it with `npm install yahoo-finance2`');
  try {
    // request full daily history via chart() to align with current Yahoo API
    const chart = await yahoo.chart(symbol, { period1: '1900-01-01', interval: '1d' });
    const quotes = Array.isArray(chart?.quotes) ? chart.quotes : [];
    if (quotes.length === 0) throw new Error('No historical data returned by Yahoo for ' + symbol);

    const arr = quotes
      .map((row) => {
        const close = Number.parseFloat(row.close);
        const rawDate = row.date instanceof Date
          ? row.date
          : (typeof row.timestamp === 'number' ? new Date(row.timestamp * 1000) : null);

        if (!rawDate || Number.isNaN(close)) {
          return null;
        }

        return {
          date: rawDate.toISOString().slice(0, 10),
          close
        };
      })
      .filter(Boolean);

    if (arr.length === 0) throw new Error('Unable to parse historical chart data for ' + symbol);
    // sort ascending by date
    arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    return arr;
  } catch (err) {
    // rethrow with clearer message
    throw new Error('Yahoo historical fetch failed: ' + (err && err.message ? err.message : String(err)));
  }
}

function daysToTradingDays(days) {
  return Math.max(1, Math.round(days * (252/365)));
}

async function simulateMatch({ opponent = 'safe', durationDays = 1, difficultyPct = 75, seed = null, symbol = 'SPY' }) {
  const tradingDays = daysToTradingDays(durationDays);
  const rng = seedrandom(seed || `${opponent}:${durationDays}:${difficultyPct}`);

  // Attempt to load historical data (local JSON first)
  // Use Yahoo Finance only. If Yahoo fetch fails, return an error-like response so callers know.
  let hist = null;
  try {
    hist = await fetchHistoricalYahoo(symbol);
  } catch (err) {
    return {
      success: false,
      error: 'historical_fetch_failed',
      message: err.message || 'Failed to fetch historical data from Yahoo Finance.'
    };
  }

  if (hist && hist.length >= tradingDays) {
    // pick a random contiguous slice from history
    const maxStart = hist.length - tradingDays;
    const start = Math.floor(rng() * (maxStart + 1));
    const slice = hist.slice(start, start + tradingDays);
    // compute daily returns from close prices
    let cumulative = 1;
    let volatilitySum = 0;
    let wins = 0;
    let losses = 0;
    const events = [];

    for (let i = 1; i < slice.length; i++) {
      const prev = slice[i-1].close;
      const curr = slice[i].close;
      const dailyReturn = (curr - prev) / prev;
      // apply opponent modifier and difficulty noise
      const baseAggression = opponent === 'safe' ? 0.6 : opponent === 'intermediate' ? 1.0 : opponent === 'risky' ? 1.4 : 1.0;
      const accuracyFactor = difficultyPct / 100;
      const adjustedReturn = dailyReturn * baseAggression * (0.7 + 0.6 * accuracyFactor);

      cumulative *= (1 + adjustedReturn);
      volatilitySum += Math.abs(adjustedReturn);
      if (adjustedReturn >= 0) wins++; else losses++;
      if (Math.abs(adjustedReturn) > 0.05) {
        events.push({ date: slice[i].date, r: adjustedReturn, note: 'Large move' });
      }
    }

    const returnPct = (cumulative - 1) * 100;
    const avgDailyVol = (volatilitySum / Math.max(1, slice.length-1)) * 100;

    return {
      success: true,
      source: 'historical',
      symbol,
      stats: {
        returnPct: parseFloat(returnPct.toFixed(2)),
        volatilityPct: parseFloat(avgDailyVol.toFixed(3)),
        tradingDays: slice.length-1,
        wins,
        losses
      },
      events
    };
  }

  // Fallback to synthetic simulation (original behavior)
  // Base aggressiveness by opponent
  const baseAggression = opponent === 'safe' ? 0.4 : opponent === 'intermediate' ? 0.7 : opponent === 'risky' ? 1.1 : 0.8;
  const accuracyFactor = difficultyPct / 100;
  const scenarioMultiplier = 0.0005; // neutral small drift
  const dailyVolBase = 0.01 * baseAggression;

  let cumulative = 1;
  let volatilitySum = 0;
  let wins = 0;
  let losses = 0;
  const events = [];

  for (let d = 0; d < tradingDays; d++) {
    const shock = (rng() - 0.5) * 2; // -1..1
    const dailyReturn = scenarioMultiplier + shock * dailyVolBase * (1 + (1 - accuracyFactor));
    cumulative *= (1 + dailyReturn);
    volatilitySum += Math.abs(dailyReturn);
    if (dailyReturn >= 0) wins++; else losses++;
    if (Math.abs(dailyReturn) > dailyVolBase * 1.75) {
      events.push({ day: d + 1, r: dailyReturn, note: 'Notable move' });
    }
  }

  const returnPct = (cumulative - 1) * 100;
  const avgDailyVol = (volatilitySum / tradingDays) * 100;

  return {
    success: true,
    source: 'synthetic',
    stats: {
      returnPct: parseFloat(returnPct.toFixed(2)),
      volatilityPct: parseFloat(avgDailyVol.toFixed(3)),
      tradingDays,
      wins,
      losses
    },
    events
  };
}

module.exports = simulateMatch;

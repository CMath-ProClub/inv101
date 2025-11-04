const StockQuote = require('./models/StockQuote');

const DEFAULT_BUCKET_MINUTES = parseInt(process.env.STOCK_QUOTE_BUCKET_MINUTES || '5', 10);

function getBucketTimestamp(date = new Date(), intervalMinutes = DEFAULT_BUCKET_MINUTES) {
  const bucketMs = intervalMinutes * 60 * 1000;
  return new Date(Math.floor(date.getTime() / bucketMs) * bucketMs);
}

async function recordQuoteBatch(quotes, options = {}) {
  const { source = 'yahoo-finance', intervalMinutes = DEFAULT_BUCKET_MINUTES } = options;
  if (!Array.isArray(quotes) || quotes.length === 0) {
    return { inserted: 0, matched: 0 };
  }

  const validQuotes = quotes.filter((quote) => {
    const symbol = quote?.ticker || quote?.symbol;
    return symbol && typeof quote.price === 'number';
  });

  if (validQuotes.length === 0) {
    return { inserted: 0, matched: 0 };
  }

  const ops = validQuotes.map((quote) => {
    const symbol = (quote.ticker || quote.symbol).toUpperCase();
    const bucketSource = quote.bucket || quote.fetchedAt || new Date();
    const bucket = getBucketTimestamp(new Date(bucketSource), intervalMinutes);
    return {
      updateOne: {
        filter: { symbol, bucket },
        update: {
          $set: {
            symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            marketCap: quote.marketCap,
            previousClose: quote.previousClose,
            open: quote.open,
            dayHigh: quote.dayHigh,
            dayLow: quote.dayLow,
            currency: quote.currency,
            exchange: quote.exchange,
            fetchedAt: quote.fetchedAt ? new Date(quote.fetchedAt) : new Date(),
            source,
            raw: quote.raw || quote
          }
        },
        upsert: true
      }
    };
  });

  const bucketValues = ops.map((op) => op.updateOne.filter.bucket);

  try {
    const result = await StockQuote.bulkWrite(ops, { ordered: false });
    return {
      inserted: result.upsertedCount || 0,
      matched: result.matchedCount || 0,
      modified: result.modifiedCount || 0,
      bucket: bucketValues[bucketValues.length - 1]
    };
  } catch (error) {
    console.error('Failed to record stock quotes:', error.message);
    return { inserted: 0, matched: 0, error: error.message };
  }
}

async function recordHistoricalQuotes(symbol, quotes, options = {}) {
  if (!symbol) {
    return { inserted: 0, matched: 0, error: 'Symbol is required' };
  }

  const {
    source = 'yahoo-finance-historical',
    intervalMinutes = parseInt(process.env.STOCK_HISTORICAL_BUCKET_MINUTES || '1440', 10)
  } = options;

  if (!Array.isArray(quotes) || quotes.length === 0) {
    return { inserted: 0, matched: 0 };
  }

  const upperSymbol = symbol.toUpperCase();
  const validQuotes = quotes.filter((quote) => typeof quote.price === 'number');

  if (validQuotes.length === 0) {
    return { inserted: 0, matched: 0 };
  }

  const ops = validQuotes.map((quote) => {
    const bucketSource = quote.bucket || quote.fetchedAt || quote.date || new Date();
    const bucket = getBucketTimestamp(new Date(bucketSource), intervalMinutes);
    return {
      updateOne: {
        filter: { symbol: upperSymbol, bucket },
        update: {
          $set: {
            symbol: upperSymbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            marketCap: quote.marketCap,
            previousClose: quote.previousClose,
            open: quote.open,
            dayHigh: quote.dayHigh,
            dayLow: quote.dayLow,
            currency: quote.currency,
            exchange: quote.exchange,
            fetchedAt: quote.fetchedAt ? new Date(quote.fetchedAt) : new Date(bucket),
            source,
            raw: quote.raw || quote
          }
        },
        upsert: true
      }
    };
  });

  try {
    const result = await StockQuote.bulkWrite(ops, { ordered: false });
    return {
      inserted: result.upsertedCount || 0,
      matched: result.matchedCount || 0,
      modified: result.modifiedCount || 0
    };
  } catch (error) {
    console.error('Failed to record historical stock quotes:', error.message);
    return { inserted: 0, matched: 0, error: error.message };
  }
}

module.exports = {
  recordQuoteBatch,
  recordHistoricalQuotes
};

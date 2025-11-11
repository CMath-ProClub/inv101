# Historical Data API - Quick Reference

## New Endpoint

### GET /api/battles/:battleId/historical-data

Retrieves historical stock price data for a trading battle's date range.

---

## Request

### URL Parameters
- `battleId` (required) - The unique identifier of the battle

### Query Parameters
- `symbol` (optional) - Stock symbol to fetch data for
  - Default: Uses battle's market symbol or 'SPY'
  - Example: `?symbol=AAPL`

### Example Requests

```javascript
// Using battle's default symbol
GET /api/battles/battle_abc123/historical-data

// Specifying a different symbol
GET /api/battles/battle_abc123/historical-data?symbol=TSLA
```

---

## Response

### Success Response (200)

```json
{
  "success": true,
  "symbol": "SPY",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-05T23:59:59.999Z",
  "data": [
    {
      "date": "2024-01-01T00:00:00.000Z",
      "open": 450.25,
      "high": 455.80,
      "low": 449.10,
      "close": 454.32,
      "volume": 75234000,
      "adjClose": 454.32
    },
    {
      "date": "2024-01-02T00:00:00.000Z",
      "open": 454.50,
      "high": 458.90,
      "low": 453.20,
      "close": 457.15,
      "volume": 82156000,
      "adjClose": 457.15
    }
    // ... more daily data
  ]
}
```

### Error Response (404)

```json
{
  "success": false,
  "error": "Battle not found"
}
```

### Error Response (500)

```json
{
  "success": false,
  "error": "Failed to fetch historical data"
}
```

---

## Data Fields

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Whether the request succeeded |
| `symbol` | String | Stock symbol for the data |
| `startDate` | ISO Date | Battle start date |
| `endDate` | ISO Date | Battle end date |
| `data` | Array | Daily price data |

### Daily Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `date` | ISO Date | Trading day date |
| `open` | Number | Opening price |
| `high` | Number | Highest price of the day |
| `low` | Number | Lowest price of the day |
| `close` | Number | Closing price |
| `volume` | Number | Trading volume |
| `adjClose` | Number | Adjusted closing price |

---

## Usage Examples

### JavaScript/Fetch

```javascript
async function getHistoricalData(battleId, symbol = null) {
  const url = symbol 
    ? `/api/battles/${battleId}/historical-data?symbol=${symbol}`
    : `/api/battles/${battleId}/historical-data`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.success) {
    console.log(`Historical data for ${data.symbol}`);
    console.log(`${data.data.length} days of data`);
    return data.data;
  } else {
    throw new Error(data.error);
  }
}

// Usage
const historicalData = await getHistoricalData('battle_abc123', 'AAPL');
```

### Chart Integration Example

```javascript
async function loadBattleChart(battleId) {
  try {
    const response = await fetch(`/api/battles/${battleId}/historical-data`);
    const { success, data, symbol } = await response.json();
    
    if (!success) throw new Error('Failed to load data');
    
    // Extract data for charting
    const dates = data.map(d => new Date(d.date).toLocaleDateString());
    const prices = data.map(d => d.close);
    
    // Create chart (example with Chart.js)
    new Chart('chartCanvas', {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: `${symbol} Price`,
          data: prices,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error loading chart:', error);
  }
}
```

### Price Lookup Example

```javascript
async function getPriceForDate(battleId, symbol, targetDate) {
  const response = await fetch(
    `/api/battles/${battleId}/historical-data?symbol=${symbol}`
  );
  const { success, data } = await response.json();
  
  if (!success) throw new Error('Failed to fetch data');
  
  // Find closest date
  const targetTime = new Date(targetDate).getTime();
  let closest = data[0];
  let minDiff = Math.abs(new Date(data[0].date).getTime() - targetTime);
  
  for (const day of data) {
    const diff = Math.abs(new Date(day.date).getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closest = day;
    }
  }
  
  return closest.close;
}

// Usage
const price = await getPriceForDate('battle_abc123', 'TSLA', '2024-01-03');
console.log(`Price on 2024-01-03: $${price}`);
```

---

## Backend Implementation

### Function: getHistoricalData()

Located in `backend/stockMarketData.js`

```javascript
async function getHistoricalData(symbol, startDate, endDate) {
  const queryOptions = {
    period1: startDate,
    period2: endDate,
    interval: '1d'
  };
  
  const result = await yahooFinance.historical(symbol, queryOptions);
  
  return result.map(day => ({
    date: day.date,
    open: day.open,
    high: day.high,
    low: day.low,
    close: day.close,
    volume: day.volume,
    adjClose: day.adjClose
  }));
}
```

### Function: getPriceAtDate()

Located in `backend/stockMarketData.js`

```javascript
function getPriceAtDate(symbol, date, historicalData) {
  const targetTime = new Date(date).getTime();
  let closestDay = historicalData[0];
  let closestDiff = Math.abs(
    new Date(historicalData[0].date).getTime() - targetTime
  );
  
  for (const day of historicalData) {
    const diff = Math.abs(new Date(day.date).getTime() - targetTime);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestDay = day;
    }
  }
  
  return closestDay.close;
}
```

---

## Data Source

**Yahoo Finance API** via `yahoo-finance2` npm package

### Supported Symbols
- All major US stocks (AAPL, MSFT, GOOGL, etc.)
- Major ETFs (SPY, QQQ, DIA, etc.)
- International stocks with Yahoo ticker format
- Cryptocurrencies (BTC-USD, ETH-USD, etc.)

### Data Availability
- Historical data typically available back to IPO date
- Adjusted for stock splits and dividends
- Intraday data available via separate endpoints

---

## Error Handling

### Common Errors

1. **Battle Not Found**
   - Status: 404
   - Cause: Invalid battleId
   - Solution: Verify battleId is correct

2. **Invalid Symbol**
   - Status: 500
   - Cause: Symbol not found on Yahoo Finance
   - Solution: Use valid ticker symbols

3. **Date Range Issues**
   - Status: 500
   - Cause: Invalid date range or future dates
   - Solution: Ensure dates are valid and in the past

4. **API Rate Limiting**
   - Status: 500
   - Cause: Too many requests to Yahoo Finance
   - Solution: Implement caching or rate limiting

---

## Caching Recommendations

### Redis Caching Example

```javascript
async function getCachedHistoricalData(battleId, symbol) {
  const cacheKey = `historical:${battleId}:${symbol}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Fetch from API
  const response = await fetch(
    `/api/battles/${battleId}/historical-data?symbol=${symbol}`
  );
  const data = await response.json();
  
  // Cache for 24 hours
  await redis.setex(cacheKey, 86400, JSON.stringify(data));
  
  return data;
}
```

---

## Testing

### Test Request

```bash
# Using curl
curl http://localhost:3000/api/battles/battle_123/historical-data

# With symbol
curl http://localhost:3000/api/battles/battle_123/historical-data?symbol=AAPL
```

### Expected Response

Should return JSON with:
- ✅ `success: true`
- ✅ Valid symbol
- ✅ Date range matching battle
- ✅ Array of daily data points

---

## Integration Checklist

- [x] Endpoint implemented in battles.js routes
- [x] Functions added to stockMarketData.js
- [x] Module exports updated
- [x] Error handling in place
- [x] Yahoo Finance integration working
- [x] Response format documented
- [x] No syntax errors

---

## Next Steps

### Potential Enhancements

1. **Caching Layer**
   - Add Redis for historical data caching
   - Reduce API calls to Yahoo Finance

2. **Intraday Data**
   - Add endpoint for minute-by-minute data
   - Support 1m, 5m, 15m intervals

3. **Multiple Symbols**
   - Support fetching multiple symbols at once
   - Return comparative data

4. **Data Validation**
   - Add symbol validation
   - Check for valid date ranges

5. **Rate Limiting**
   - Implement request throttling
   - Add queue for API requests

---

## Support

For issues or questions:
- Check backend logs for errors
- Verify Yahoo Finance API is accessible
- Ensure battle exists in database
- Confirm date range is valid

---

**Last Updated**: 2024 (Session completion)
**API Version**: 1.0
**Status**: ✅ Production Ready

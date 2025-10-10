# Google Finance Backend

This backend scrapes Google Finance for top 100 US stocks (50 by market cap + 50 recognizable companies) and exposes REST API endpoints for your frontend.

## Endpoints

- `GET /api/stocks/top100` — Returns array of top 100 stocks `{ ticker, name }`
- `GET /api/stocks/:ticker` — Returns details for a single ticker `{ ticker, name, price, marketCap }`

## Setup

1. Run `npm install` in the `backend` folder.
2. Start the server with `npm start`.
3. The backend runs on port 4000 by default.

## Notes
- This uses Cheerio to scrape Google Finance. If Google changes their HTML, selectors may need updating.
- CORS is enabled for local frontend development.
- For production, consider caching results and handling rate limits.

## Example Usage
```bash
curl http://localhost:4000/api/stocks/top100
curl http://localhost:4000/api/stocks/AAPL
```

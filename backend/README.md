# Market Data & News Backend

This service powers the prototype with live market data from Yahoo Finance and a configurable financial news cache. When a `NEWSAPI_KEY` is provided it will hydrate the cache with real headlines so the system maintains at least 750 current articles.

## Endpoints

- `GET /api/stocks/top100` — Returns an array of curated tickers `{ ticker, name, price, changePercent, marketCap }`
- `GET /api/stocks/:ticker` — Returns detailed quote fundamentals for a single ticker
- `GET /api/simulate` — Generates a head-to-head performance simulation using Yahoo historical data
- `GET /api/articles/stats` — Provides article cache counts, recency distribution, and last refresh metadata

## Setup

1. Run `npm install` in the `backend` folder.
2. (Optional but recommended) Create a free account at [NewsAPI.org](https://newsapi.org), generate an API key, and add it to your environment:
	```powershell
	setx NEWSAPI_KEY "your_api_key_here"
	# optionally override queries (defaults target broad-market topics)
	setx NEWSAPI_QUERIES "stock market,investing,wall street"
	# defaults to 1 page (100 results per query) which matches the free tier limit
	setx NEWSAPI_MAX_PAGES 1
	```
3. (Optional) Add [TheNewsAPI](https://www.thenewsapi.com) for wider coverage:
	```powershell
	setx THENEWSAPI_TOKEN "your_the_news_api_token"
	setx THENEWSAPI_LOCALES "us,gb,ca"
	setx THENEWSAPI_CATEGORIES "business,finance,world"
	setx THENEWSAPI_LIMIT 50
	```
4. (Optional) Add [Currents API](https://currentsapi.services/):
	```powershell
	setx CURRENTS_API_KEY "your_currents_api_key"
	setx CURRENTS_API_CATEGORIES "business,finance,technology,world"
	```
5. (Optional) Add [The Guardian Open Platform](https://open-platform.theguardian.com/):
	```powershell
	setx GUARDIAN_API_KEY "your_guardian_api_key"
	setx GUARDIAN_SECTIONS "business,money,world,technology"
	setx GUARDIAN_PAGE_SIZE 50
	```
6. (Optional) Add [NewsData.io](https://newsdata.io/):
	```powershell
	setx NEWSDATA_API_KEY "your_newsdata_api_key"
	setx NEWSDATA_CATEGORIES "business,top"
	setx NEWSDATA_COUNTRIES "us,gb,ca,au"
	```
7. (Optional) Add [The New York Times Article Search](https://developer.nytimes.com/docs/articlesearch-product/1/overview):
	```powershell
	setx NYTIMES_API_KEY "your_nytimes_api_key"
	setx NYTIMES_QUERIES "markets,stocks,wall street,economy,finance"
	setx NYTIMES_SECTIONS "Business,Economic,Markets,DealBook,Energy,International Business"
	setx NYTIMES_LOOKBACK_DAYS 7
	setx NYTIMES_MAX_PAGES 2
	```
8. Start the server with `npm start`.
9. The backend runs on port 4000 by default.

## Notes
- Stock data comes from the official Yahoo Finance API via the `yahoo-finance2` package.
- When `NEWSAPI_KEY` is present the article cache will pull real headlines (100 per query page) until it reaches the 750-article minimum; without it the system falls back to mock data.
- Free NewsAPI accounts cap each query at 100 results, so the default pagination is a single page. Increase `NEWSAPI_MAX_PAGES` only if you're on a paid plan.
- If `THENEWSAPI_TOKEN` is supplied the cache combines providers; each article URL is checked against MongoDB before being counted to avoid burning through daily quotas.
- CORS is enabled for local frontend development.
- For production, ensure MongoDB is configured (Atlas or local) and schedule cache refreshes to stay within NewsAPI rate limits.

## Example Usage
```bash
curl http://localhost:4000/api/stocks/top100
curl http://localhost:4000/api/stocks/AAPL
curl http://localhost:4000/api/articles/stats
```

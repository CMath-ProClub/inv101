const axios = require('axios');
const crypto = require('crypto');
const Article = require('./models/Article');
const CacheRefreshLog = require('./models/CacheRefreshLog');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function splitList(value, fallback) {
	const input = typeof value === 'string' && value.trim().length > 0 ? value : fallback;
	return input.split(',').map(item => item.trim()).filter(Boolean);
}

class ArticleCacheService {
	constructor() {
		this.minArticles = parseInt(process.env.ARTICLE_CACHE_MIN || '750', 10);
		this.requiredRecentPercent = parseFloat(process.env.ARTICLE_CACHE_RECENT_PERCENT || '40');
		this.requiredWeekPercent = parseFloat(process.env.ARTICLE_CACHE_WEEK_PERCENT || '75');
		this.refreshInterval = parseInt(process.env.ARTICLE_CACHE_REFRESH_MINUTES || '60', 10) * 60 * 1000;
		this.cleanupInterval = parseInt(process.env.ARTICLE_CACHE_CLEANUP_MINUTES || '360', 10) * 60 * 1000;
		this.mockArticlesPerSource = parseInt(process.env.ARTICLE_CACHE_MOCK_PER_SOURCE || '12', 10);
		this.requestTimeout = parseInt(process.env.ARTICLE_CACHE_TIMEOUT_MS || '10000', 10);

		this.newsApiKey = process.env.NEWSAPI_KEY || '';
		this.newsApiQueries = splitList(process.env.NEWSAPI_QUERIES, 'stocks,market,finance,economy,investing');
		this.newsApiPageSize = parseInt(process.env.NEWSAPI_PAGE_SIZE || '50', 10);
		this.newsApiMaxPages = parseInt(process.env.NEWSAPI_MAX_PAGES || '1', 10);

		this.theNewsApiToken = process.env.THENEWSAPI_TOKEN || process.env.THE_NEWS_API_TOKEN || '';
		this.theNewsApiLocales = splitList(process.env.THENEWSAPI_LOCALES, 'us,gb,ca,au');
		this.theNewsApiCategories = splitList(process.env.THENEWSAPI_CATEGORIES, 'business,technology,world');
		this.theNewsApiLimit = parseInt(process.env.THENEWSAPI_LIMIT || '50', 10);

		this.currentsApiKey = process.env.CURRENTS_API_KEY || '';
		this.currentsApiCategories = splitList(process.env.CURRENTS_API_CATEGORIES, 'business,finance,technology,world');

		this.guardianApiKey = process.env.GUARDIAN_API_KEY || '';
		this.guardianSections = splitList(process.env.GUARDIAN_SECTIONS, 'business,money,world,technology');
		this.guardianPageSize = parseInt(process.env.GUARDIAN_PAGE_SIZE || '50', 10);

		this.newsDataApiKey = process.env.NEWSDATA_API_KEY || process.env.NEWSDATAIO_API_KEY || '';
		this.newsDataCategories = splitList(process.env.NEWSDATA_CATEGORIES, 'business,top');
		this.newsDataCountries = splitList(process.env.NEWSDATA_COUNTRIES, 'us,gb,ca,au');

		this.nytimesApiKey = process.env.NYTIMES_API_KEY || process.env.NY_TIMES_API_KEY || '';
		this.nytimesQueries = splitList(process.env.NYTIMES_QUERIES, 'markets,stocks,wall street,economy,finance');
		this.nytimesSections = splitList(process.env.NYTIMES_SECTIONS, 'Business,Economic,Markets,DealBook,Energy,International Business');
		this.nytimesLookbackDays = parseInt(process.env.NYTIMES_LOOKBACK_DAYS || '7', 10);
		this.nytimesMaxPages = parseInt(process.env.NYTIMES_MAX_PAGES || '2', 10);

		this.lastRefresh = 0;
		this.lastCleanup = 0;

		this.mockSources = [
			{ name: 'MarketWatch', url: 'https://www.marketwatch.com' },
			{ name: 'Reuters', url: 'https://www.reuters.com' },
			{ name: 'Bloomberg', url: 'https://www.bloomberg.com' },
			{ name: 'Seeking Alpha', url: 'https://seekingalpha.com' },
			{ name: 'CNBC', url: 'https://www.cnbc.com' },
			{ name: 'Yahoo Finance', url: 'https://finance.yahoo.com' }
		];
	}

	delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	normalizeDistribution(stats) {
		if (!stats) {
			return null;
		}

		return {
			total: stats.total || 0,
			last3Days: stats.last3Days || 0,
			lastWeek: stats.lastWeek || 0,
			last3DaysPercent: Number(stats.last3DaysPercent || 0),
			lastWeekPercent: Number(stats.lastWeekPercent || 0)
		};
	}

	generateContentHash(title, source) {
		return crypto.createHash('md5').update(`${title || ''}|${source || ''}`).digest('hex');
	}

	async fetchNewsApiArticles(existingUrls = new Set()) {
		if (!this.newsApiKey) {
			return { articles: [], stats: [] };
		}

		const articles = [];
		const stats = [];

		for (const query of this.newsApiQueries) {
			let fetchedForQuery = 0;
			let addedForQuery = 0;
			let duplicatesSkipped = 0;
			let errorMessage = null;

			for (let page = 1; page <= this.newsApiMaxPages; page += 1) {
				try {
					const { data } = await axios.get('https://newsapi.org/v2/everything', {
						params: {
							apiKey: this.newsApiKey,
							q: query,
							language: 'en',
							sortBy: 'publishedAt',
							pageSize: this.newsApiPageSize,
							page
						},
						timeout: this.requestTimeout
					});

					const batch = Array.isArray(data?.articles) ? data.articles : [];
					fetchedForQuery += batch.length;

					for (const item of batch) {
						const url = item?.url;
						if (!url) {
							continue;
						}
						if (existingUrls.has(url)) {
							duplicatesSkipped += 1;
							continue;
						}

						existingUrls.add(url);

						articles.push({
							title: item?.title || 'Untitled article',
							source: item?.source?.name || 'NewsAPI',
							url,
							publishDate: item?.publishedAt ? new Date(item.publishedAt) : new Date(),
							summary: item?.description || item?.content || 'Summary not provided.',
							fullText: item?.content || null,
							ticker: null,
							politician: null,
							category: 'market',
							sentiment: 0,
							relevanceScore: 0.8,
							tags: ['newsapi', `query:${query}`],
							imageUrl: item?.urlToImage || null,
							author: item?.author || null
						});

						addedForQuery += 1;
					}
				} catch (error) {
					errorMessage = error.response?.data?.message || error.message;
					console.error(`  ❌ NewsAPI query failed (${query} page ${page}):`, errorMessage);
					break;
				}

				if (articles.length >= this.minArticles) {
					break;
				}

				if (page < this.newsApiMaxPages) {
					await this.delay(400);
				}
			}

			stats.push({
				source: `newsapi:${query}`,
				articlesFound: fetchedForQuery,
				articlesAdded: addedForQuery,
				duplicatesSkipped,
				error: errorMessage || undefined
			});

			if (articles.length >= this.minArticles) {
				break;
			}
		}

		return { articles, stats };
	}

	async fetchTheNewsApiArticles(existingUrls = new Set()) {
		if (!this.theNewsApiToken) {
			return { articles: [], stats: [] };
		}

		const articles = [];
		const stats = [];

		for (const locale of this.theNewsApiLocales) {
			let added = 0;
			let duplicatesSkipped = 0;
			let errorMessage = null;
			let found = 0;

			try {
				const { data } = await axios.get('https://api.thenewsapi.com/v1/news/top', {
					params: {
						api_token: this.theNewsApiToken,
						locale,
						language: 'en',
						categories: this.theNewsApiCategories.join(','),
						limit: this.theNewsApiLimit,
						sort: 'published_at'
					},
					timeout: this.requestTimeout
				});

				const batch = Array.isArray(data?.data) ? data.data : [];
				found = batch.length;

				for (const item of batch) {
					const url = item?.url || item?.source_url;
					if (!url) {
						continue;
					}
					if (existingUrls.has(url)) {
						duplicatesSkipped += 1;
						continue;
					}

					existingUrls.add(url);

					const sourceName = typeof item?.source === 'object'
						? (item.source?.name || item.source?.title || 'TheNewsAPI')
						: (item?.source || 'TheNewsAPI');

					articles.push({
						title: item?.title || 'Untitled article',
						source: sourceName,
						url,
						publishDate: item?.published_at ? new Date(item.published_at) : new Date(),
						summary: item?.description || item?.snippet || 'Summary not provided.',
						fullText: item?.snippet || null,
						ticker: null,
						politician: null,
						category: 'market',
						sentiment: 0,
						relevanceScore: 0.78,
						tags: ['the-news-api', `locale:${locale}`],
						imageUrl: item?.image_url || null,
						author: item?.author || null
					});

					added += 1;
				}
			} catch (error) {
				errorMessage = error.response?.data?.message || error.message;
				console.error(`  ❌ TheNewsAPI query failed (${locale}):`, errorMessage);
			}

			stats.push({
				source: `theNewsApi:${locale}`,
				articlesFound: found,
				articlesAdded: added,
				duplicatesSkipped,
				error: errorMessage || undefined
			});

			if (articles.length >= this.minArticles) {
				break;
			}
		}

		return { articles, stats };
	}

	async fetchCurrentsApiArticles(existingUrls = new Set()) {
		if (!this.currentsApiKey) {
			return { articles: [], stats: [] };
		}

		const articles = [];
		const stats = [];

		for (const category of this.currentsApiCategories) {
			let added = 0;
			let duplicatesSkipped = 0;
			let found = 0;
			let errorMessage = null;

			try {
				const { data } = await axios.get('https://api.currentsapi.services/v1/latest-news', {
					params: {
						apiKey: this.currentsApiKey,
						category,
						language: 'en'
					},
					timeout: this.requestTimeout
				});

				const batch = Array.isArray(data?.news) ? data.news : [];
				found = batch.length;

				for (const item of batch) {
					const url = item?.url || item?.link;
					if (!url) {
						continue;
					}
					if (existingUrls.has(url)) {
						duplicatesSkipped += 1;
						continue;
					}

					existingUrls.add(url);

					articles.push({
						title: item?.title || 'Untitled article',
						source: item?.source || item?.author || 'Currents API',
						url,
						publishDate: item?.published ? new Date(item.published) : new Date(),
						summary: item?.description || item?.snippet || 'Summary not provided.',
						fullText: item?.snippet || null,
						ticker: null,
						politician: null,
						category: 'market',
						sentiment: 0,
						relevanceScore: 0.72,
						tags: ['currents', `category:${category}`],
						imageUrl: item?.image || item?.image_url || null,
						author: item?.author || null
					});

					added += 1;
				}
			} catch (error) {
				errorMessage = error.response?.data?.message || error.message;
				console.error(`  ❌ Currents API query failed (${category}):`, errorMessage);
			}

			stats.push({
				source: `currents:${category}`,
				articlesFound: found,
				articlesAdded: added,
				duplicatesSkipped,
				error: errorMessage || undefined
			});

			if (articles.length >= this.minArticles) {
				break;
			}
		}

		return { articles, stats };
	}

	async fetchGuardianArticles(existingUrls = new Set()) {
		if (!this.guardianApiKey) {
			return { articles: [], stats: [] };
		}

		const articles = [];
		const stats = [];

		for (const section of this.guardianSections) {
			let added = 0;
			let duplicatesSkipped = 0;
			let found = 0;
			let errorMessage = null;

			try {
				const { data } = await axios.get('https://content.guardianapis.com/search', {
					params: {
						'api-key': this.guardianApiKey,
						section,
						'page-size': this.guardianPageSize,
						'order-by': 'newest',
						'show-fields': 'headline,trailText,byline,thumbnail,shortUrl'
					},
					timeout: this.requestTimeout
				});

				const batch = Array.isArray(data?.response?.results) ? data.response.results : [];
				found = batch.length;

				for (const item of batch) {
					const url = item?.webUrl || item?.id;
					if (!url) {
						continue;
					}
					if (existingUrls.has(url)) {
						duplicatesSkipped += 1;
						continue;
					}

					existingUrls.add(url);

					const fields = item?.fields || {};

					articles.push({
						title: fields?.headline || item?.webTitle || 'Untitled article',
						source: 'The Guardian',
						url,
						publishDate: item?.webPublicationDate ? new Date(item.webPublicationDate) : new Date(),
						summary: fields?.trailText || 'Summary not provided.',
						fullText: null,
						ticker: null,
						politician: null,
						category: 'market',
						sentiment: 0,
						relevanceScore: 0.76,
						tags: ['guardian', `section:${section}`],
						imageUrl: fields?.thumbnail || null,
						author: fields?.byline || null
					});

					added += 1;
				}
			} catch (error) {
				errorMessage = error.response?.data?.message || error.message;
				console.error(`  ❌ Guardian API query failed (${section}):`, errorMessage);
			}

			stats.push({
				source: `guardian:${section}`,
				articlesFound: found,
				articlesAdded: added,
				duplicatesSkipped,
				error: errorMessage || undefined
			});

			if (articles.length >= this.minArticles) {
				break;
			}
		}

		return { articles, stats };
	}

	async fetchNewsDataArticles(existingUrls = new Set()) {
		if (!this.newsDataApiKey) {
			return { articles: [], stats: [] };
		}

		const articles = [];
		const stats = [];

		for (const category of this.newsDataCategories) {
			let added = 0;
			let duplicatesSkipped = 0;
			let found = 0;
			let errorMessage = null;

			try {
				const { data } = await axios.get('https://newsdata.io/api/1/news', {
					params: {
						apikey: this.newsDataApiKey,
						category,
						language: 'en',
						country: this.newsDataCountries[0], // Use single country instead of comma-separated list
						size: 10
					},
					timeout: this.requestTimeout
				});

				const batch = Array.isArray(data?.results) ? data.results : [];
				found = batch.length;

				for (const item of batch) {
					const url = item?.link || item?.url;
					if (!url) {
						continue;
					}
					if (existingUrls.has(url)) {
						duplicatesSkipped += 1;
						continue;
					}

					existingUrls.add(url);

					const publishDate = item?.pubDate || item?.pub_date || item?.published_at;

					articles.push({
						title: item?.title || 'Untitled article',
						source: item?.source_id || item?.source || 'NewsData.io',
						url,
						publishDate: publishDate ? new Date(publishDate) : new Date(),
						summary: item?.description || item?.summary || 'Summary not provided.',
						fullText: item?.content || null,
						ticker: null,
						politician: null,
						category: 'market',
						sentiment: 0,
						relevanceScore: 0.7,
						tags: ['newsdata', `category:${category}`],
						imageUrl: item?.image_url || null,
						author: item?.creator ? [].concat(item.creator).filter(Boolean).join(', ') : null
					});

					added += 1;
				}
			} catch (error) {
				errorMessage = error.response?.data?.message || error.message;
				console.error(`  ❌ NewsData API query failed (${category}):`, errorMessage);
			}

			stats.push({
				source: `newsdata:${category}`,
				articlesFound: found,
				articlesAdded: added,
				duplicatesSkipped,
				error: errorMessage || undefined
			});

			if (articles.length >= this.minArticles) {
				break;
			}
		}

		return { articles, stats };
	}

	async fetchNyTimesArticles(existingUrls = new Set()) {
		if (!this.nytimesApiKey) {
			return { articles: [], stats: [] };
		}

		const articles = [];
		const stats = [];
		const beginDate = new Date(Date.now() - this.nytimesLookbackDays * 24 * 60 * 60 * 1000);
		const beginDateStr = beginDate.toISOString().slice(0, 10).replace(/-/g, '');
		const sectionQuery = this.nytimesSections.length > 0
			? `section_name:(${this.nytimesSections.map(section => `"${section}"`).join(' ')})`
			: undefined;

		for (const query of this.nytimesQueries) {
			let added = 0;
			let duplicatesSkipped = 0;
			let found = 0;
			let errorMessage = null;

			for (let page = 0; page < this.nytimesMaxPages; page += 1) {
				try {
					const { data } = await axios.get('https://api.nytimes.com/svc/search/v2/articlesearch.json', {
						params: {
							'api-key': this.nytimesApiKey,
							q: query,
							sort: 'newest',
							page,
							begin_date: beginDateStr,
							fq: sectionQuery
						},
						timeout: this.requestTimeout
					});

					const batch = Array.isArray(data?.response?.docs) ? data.response.docs : [];
					found += batch.length;

					for (const item of batch) {
						const url = item?.web_url;
						if (!url) {
							continue;
						}
						if (existingUrls.has(url)) {
							duplicatesSkipped += 1;
							continue;
						}

						existingUrls.add(url);

						const multimediaUrl = Array.isArray(item?.multimedia) && item.multimedia.length > 0
							? `https://www.nytimes.com/${item.multimedia[0].url}`
							: null;

						articles.push({
							title: item?.headline?.main || 'Untitled article',
							source: 'The New York Times',
							url,
							publishDate: item?.pub_date ? new Date(item.pub_date) : new Date(),
							summary: item?.abstract || item?.snippet || 'Summary not provided.',
							fullText: item?.lead_paragraph || null,
							ticker: null,
							politician: null,
							category: 'market',
							sentiment: 0,
							relevanceScore: 0.82,
							tags: ['nytimes', `query:${query}`],
							imageUrl: multimediaUrl,
							author: item?.byline?.original || null
						});

						added += 1;
					}
				} catch (error) {
					errorMessage = error.response?.data?.message || error.message;
					console.error(`  ❌ NYTimes query failed (${query}, page ${page}):`, errorMessage);
					break;
				}

				if (articles.length >= this.minArticles) {
					break;
				}

				if (page < this.nytimesMaxPages - 1) {
					await this.delay(400);
				}
			}

			stats.push({
				source: `nytimes:${query}`,
				articlesFound: found,
				articlesAdded: added,
				duplicatesSkipped,
				error: errorMessage || undefined
			});

			if (articles.length >= this.minArticles) {
				break;
			}
		}

		return { articles, stats };
	}

	async insertArticles(articles) {
		let inserted = 0;
		let duplicates = 0;

		for (const articleData of articles) {
			try {
				if (!articleData.url) {
					continue;
				}

				const existingByUrl = await Article.findOne({ url: articleData.url, isActive: true }).lean();
				if (existingByUrl) {
					duplicates += 1;
					continue;
				}

				const contentHash = this.generateContentHash(articleData.title, articleData.source);
				const existingByHash = await Article.findOne({ contentHash, isActive: true }).lean();
				if (existingByHash) {
					duplicates += 1;
					continue;
				}

				const article = new Article({
					...articleData,
					contentHash
				});

				await article.save();
				inserted += 1;
			} catch (error) {
				console.error(`Failed to insert article (${articleData.title || 'untitled'}):`, error.message);
			}
		}

		return { inserted, duplicates };
	}

	async cleanupOutdatedArticles() {
		if (this.lastCleanup && Date.now() - this.lastCleanup < this.cleanupInterval) {
			return { deleted: 0, skipped: true };
		}

		console.log('🧹 Cleaning outdated articles...');
		const result = await Article.cleanOutdatedArticles(this.minArticles);
		this.lastCleanup = Date.now();
		return result;
	}

	async getArticles(filters = {}) {
		const query = { isActive: true };

		// Filter to articles from the last year for performance vs expectations analysis
		const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
		query.publishDate = { $gte: oneYearAgo };

		if (filters.ticker) {
			query.ticker = filters.ticker.toUpperCase();
		}

		if (filters.politician) {
			query.politician = filters.politician;
		}

		if (filters.category) {
			query.category = filters.category;
		}

		if (filters.daysOld) {
			const since = new Date(Date.now() - parseInt(filters.daysOld, 10) * 24 * 60 * 60 * 1000);
			query.publishDate = { ...query.publishDate, $gte: since };
		}

		if (filters.minRelevance) {
			query.relevanceScore = { $gte: parseFloat(filters.minRelevance) };
		}

		const limit = Math.min(parseInt(filters.limit, 10) || 1000, 10000); // Increased limit since no total cap

		const articles = await Article.find(query)
			.sort({ publishDate: -1, relevanceScore: -1 })
			.limit(limit)
			.lean();

		// Group articles by ticker, prioritizing newer articles
		const grouped = articles.reduce((acc, article) => {
			const key = article.ticker || 'GENERAL';
			if (!acc[key]) acc[key] = [];
			acc[key].push(article);
			return acc;
		}, {});

		// Sort each group by publishDate descending (newest first)
		Object.keys(grouped).forEach(key => {
			grouped[key].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
		});

		return grouped;
	}

	async updateAccessMetadata(articleIds = []) {
		if (!Array.isArray(articleIds) || articleIds.length === 0) {
			return;
		}

		try {
			await Article.updateMany(
				{ _id: { $in: articleIds } },
				{ $inc: { accessCount: 1 }, $set: { lastAccessedAt: new Date() } }
			);
		} catch (error) {
			console.warn('⚠️ Failed to update article access metadata:', error.message);
		}
	}

	async getArticlesWithRefresh(filters = {}) {
		if (await this.needsRefresh()) {
			await this.refreshCache('auto', filters.ticker || null, filters.politician || null);
		}

		const articles = await this.getArticles(filters);
		if (!filters.skipAccessTracking) {
			await this.updateAccessMetadata(articles.map(article => article._id));
		}

		return articles;
	}

	async getCacheStats() {
		return Article.getDistributionStats();
	}

	async getRefreshStats(days = 7) {
		return CacheRefreshLog.getRefreshStats(days);
	}

	async getRefreshHistory(limit = 10) {
		return CacheRefreshLog.getRecentHistory(limit);
	}

	async needsRefresh() {
		const now = Date.now();

		if (!this.lastRefresh) {
			return true;
		}

		if (now - this.lastRefresh >= this.refreshInterval) {
			return true;
		}

		const stats = await Article.getDistributionStats();

		const recentPercent = Number(stats.last3DaysPercent || 0);
		const weekPercent = Number(stats.lastWeekPercent || 0);

		if (recentPercent < this.requiredRecentPercent) {
			return true;
		}

		if (weekPercent < this.requiredWeekPercent) {
			return true;
		}

		return false;
	}

	generateMockTitle(ticker, politician) {
		if (ticker) {
			const options = [
				`${ticker} Stock Analysis: Key Trends to Watch`,
				`${ticker} Earnings Report Exceeds Expectations`,
				`Analysts Upgrade ${ticker} Price Target`,
				`Why ${ticker} Could Be Poised for Growth`,
				`${ticker} Announces Strategic Partnership`
			];
			return options[Math.floor(Math.random() * options.length)];
		}

		if (politician) {
			return `${politician}'s Latest Stock Trades Revealed`;
		}

		const options = [
			'Market Update: Key Economic Indicators',
			'Global Markets React to Economic Data',
			'Investors Brace for Central Bank Decisions',
			'Tech Stocks Lead Market Rebound',
			'Energy Sector Faces Renewed Volatility'
		];
		return options[Math.floor(Math.random() * options.length)];
	}

	generateMockSummary(ticker, politician) {
		if (ticker) {
			return `Comprehensive analysis of ${ticker}'s recent performance, market position, and future outlook based on current conditions and analyst commentary.`;
		}

		if (politician) {
			return `Detailed breakdown of ${politician}'s recent portfolio transactions and the potential implications for market sentiment.`;
		}

		return 'Analysis of current market trends and economic indicators shaping investor sentiment across major sectors.';
	}

	calculateSentiment() {
		return Number((Math.random() * 2 - 1).toFixed(2));
	}

	async mockScrapeArticles(source, ticker = null, politician = null) {
		await this.delay(50);
		const articles = [];

		for (let i = 0; i < this.mockArticlesPerSource; i += 1) {
			const now = Date.now();
			const rand = Math.random();
			let publishDate = new Date(now - rand * 45 * 24 * 60 * 60 * 1000);

			if (rand < 0.45) {
				publishDate = new Date(now - Math.random() * 3 * 24 * 60 * 60 * 1000);
			} else if (rand < 0.8) {
				publishDate = new Date(now - (3 + Math.random() * 4) * 24 * 60 * 60 * 1000);
			}

			articles.push({
				title: this.generateMockTitle(ticker, politician),
				source: source.name,
				url: `${source.url}/article-${Date.now()}-${Math.random().toString(36).slice(2)}`,
				publishDate,
				summary: this.generateMockSummary(ticker, politician),
				fullText: null,
				ticker: ticker || 'MARKET',
				politician: politician || null,
				category: 'market',
				sentiment: this.calculateSentiment(),
				relevanceScore: 0.6 + Math.random() * 0.35,
				tags: ['mock'],
				imageUrl: null,
				author: null
			});
		}

		return articles;
	}

	async refreshCache(triggeredBy = 'auto', ticker = null, politician = null) {
		if (mongoose.connection.readyState !== 1) {
			console.log('⚠️ Skipping cache refresh: MongoDB not connected');
			return { success: false, message: 'MongoDB not connected' };
		}

		console.log(`🔄 Starting cache refresh (triggered by: ${triggeredBy})...`);

		const distributionBefore = await Article.getDistributionStats();
		const refreshLog = await CacheRefreshLog.create({
			startTime: new Date(),
			triggeredBy,
			sourcesScraped: [],
			errors: [],
			distributionBefore: this.normalizeDistribution(distributionBefore)
		});

		const newArticles = [];
		const providerStats = [];
		const existingDocs = await Article.find({ isActive: true }).select('url -_id').lean();
		const existingUrls = new Set(existingDocs.map(doc => doc.url));
		const providersConfigured = [
			this.newsApiKey,
			this.theNewsApiToken,
			this.currentsApiKey,
			this.guardianApiKey,
			this.newsDataApiKey,
			this.nytimesApiKey
		].filter(Boolean).length;

		try {
			if (this.newsApiKey) {
				console.log('🌐 [1/6] Fetching articles via NewsAPI.org...');
				const result = await this.fetchNewsApiArticles(existingUrls);
				newArticles.push(...result.articles);
				providerStats.push(...result.stats);
				console.log(`   ✅ NewsAPI: ${result.articles.length} articles fetched`);
			}

			if (this.theNewsApiToken) {
				console.log('📰 [2/6] Fetching articles via TheNewsAPI...');
				const result = await this.fetchTheNewsApiArticles(existingUrls);
				newArticles.push(...result.articles);
				providerStats.push(...result.stats);
				console.log(`   ✅ TheNewsAPI: ${result.articles.length} articles fetched`);
			}

			if (this.currentsApiKey) {
				console.log('🌎 [3/6] Fetching articles via Currents API...');
				const result = await this.fetchCurrentsApiArticles(existingUrls);
				newArticles.push(...result.articles);
				providerStats.push(...result.stats);
				console.log(`   ✅ Currents API: ${result.articles.length} articles fetched`);
			}

			if (this.guardianApiKey) {
				console.log('🗞️ [4/6] Fetching articles via The Guardian Open Platform...');
				const result = await this.fetchGuardianArticles(existingUrls);
				newArticles.push(...result.articles);
				providerStats.push(...result.stats);
				console.log(`   ✅ Guardian API: ${result.articles.length} articles fetched`);
			}

			if (this.newsDataApiKey) {
				console.log('🧾 [5/6] Fetching articles via NewsData.io...');
				const result = await this.fetchNewsDataArticles(existingUrls);
				newArticles.push(...result.articles);
				providerStats.push(...result.stats);
				console.log(`   ✅ NewsData.io: ${result.articles.length} articles fetched`);
			}

			if (this.nytimesApiKey) {
				console.log('🗽 [6/6] Fetching articles via The New York Times API...');
				const result = await this.fetchNyTimesArticles(existingUrls);
				newArticles.push(...result.articles);
				providerStats.push(...result.stats);
				console.log(`   ✅ NYTimes API: ${result.articles.length} articles fetched`);
			}

			if (providersConfigured === 0 || newArticles.length < this.minArticles) {
				console.log('🧪 Using mock article generator to supplement coverage...');
				for (const source of this.mockSources) {
					try {
						const mockArticles = await this.mockScrapeArticles(source, ticker, politician);
						const uniqueMock = mockArticles.filter(article => {
							if (!article.url) {
								return false;
							}
							if (existingUrls.has(article.url)) {
								return false;
							}
							existingUrls.add(article.url);
							return true;
						});

						providerStats.push({
							source: source.name,
							articlesFound: mockArticles.length,
							articlesAdded: uniqueMock.length,
							duplicatesSkipped: mockArticles.length - uniqueMock.length
						});

						newArticles.push(...uniqueMock);

						if (newArticles.length >= this.minArticles) {
							break;
						}
					} catch (error) {
						console.error(`  ❌ Mock generator failed (${source.name}):`, error.message);
						providerStats.push({
							source: source.name,
							articlesFound: 0,
							articlesAdded: 0,
							duplicatesSkipped: 0,
							error: error.message
						});
					}
				}
			}

			refreshLog.sourcesScraped = providerStats;
			refreshLog.totalArticlesFound = newArticles.length;
			console.log(`📊 Processing ${newArticles.length} total articles...`);

			const insertResult = await this.insertArticles(newArticles);
			refreshLog.totalArticlesAdded = insertResult.inserted;
			refreshLog.duplicatesSkipped = insertResult.duplicates;
			console.log(`💾 Database: ${insertResult.inserted} articles inserted, ${insertResult.duplicates} duplicates skipped`);

			// Removed cleanup and pruning to keep all articles, including old ones

			refreshLog.articlesDeleted = 0;

			refreshLog.endTime = new Date();
			refreshLog.duration = refreshLog.endTime - refreshLog.startTime;
			refreshLog.distributionAfter = this.normalizeDistribution(await Article.getDistributionStats());
			refreshLog.status = refreshLog.errorList.length === 0 ? 'completed' : 'partial';

			await refreshLog.save();

			this.lastRefresh = Date.now();

			const stats = refreshLog.distributionAfter || {};
			console.log('✅ Cache refresh complete:');
			console.log(`   Total: ${stats.total || 0} articles`);
			console.log(`   Last 3 days: ${stats.last3Days || 0} (${stats.last3DaysPercent || 0}%)`);
			console.log(`   Last week: ${stats.lastWeek || 0} (${stats.lastWeekPercent || 0}%)`);
			console.log(`   Duration: ${(refreshLog.duration / 1000).toFixed(2)}s`);

			return {
				success: true,
				stats,
				refreshLog: refreshLog._id
			};
		} catch (error) {
			console.error('❌ Cache refresh failed:', error.message);
			refreshLog.endTime = new Date();
			refreshLog.duration = refreshLog.endTime - refreshLog.startTime;
			refreshLog.status = 'failed';
			refreshLog.errorList.push({
				message: error.message,
				source: 'aggregator',
				timestamp: new Date()
			});
			await refreshLog.save();
			throw error;
		}
	}
}

module.exports = new ArticleCacheService();

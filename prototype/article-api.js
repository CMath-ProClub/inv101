/**
 * Article Cache API Client
 * Client-side utility to fetch cached articles from backend
 */

const ARTICLE_API_BASE = 'http://localhost:4000/api/articles';

class ArticleAPI {
  /**
   * Fetch general market articles
   */
  static async getMarketArticles(options = {}) {
    const {
      limit = 50,
      daysOld = null,
      minRelevance = 0.6
    } = options;

    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (daysOld) params.append('daysOld', daysOld);
    if (minRelevance) params.append('minRelevance', minRelevance);

    try {
      const response = await fetch(`${ARTICLE_API_BASE}/market?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      return data;
    } catch (error) {
      console.error('Error fetching market articles:', error);
      return { success: false, articles: [], stats: {}, error: error.message };
    }
  }

  /**
   * Fetch articles for specific stock
   */
  static async getStockArticles(ticker, options = {}) {
    const {
      limit = 50,
      daysOld = null,
      minRelevance = 0.7
    } = options;

    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (daysOld) params.append('daysOld', daysOld);
    if (minRelevance) params.append('minRelevance', minRelevance);

    try {
      const response = await fetch(`${ARTICLE_API_BASE}/stock/${ticker}?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      return data;
    } catch (error) {
      console.error(`Error fetching articles for ${ticker}:`, error);
      return { success: false, articles: [], stats: {}, error: error.message };
    }
  }

  /**
   * Fetch articles for politician's portfolio
   */
  static async getPoliticianArticles(politician, options = {}) {
    const {
      limit = 50,
      daysOld = 30,
      minRelevance = 0.7
    } = options;

    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (daysOld) params.append('daysOld', daysOld);
    if (minRelevance) params.append('minRelevance', minRelevance);

    try {
      const encodedName = encodeURIComponent(politician);
      const response = await fetch(`${ARTICLE_API_BASE}/politician/${encodedName}?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      return data;
    } catch (error) {
      console.error(`Error fetching articles for ${politician}:`, error);
      return { success: false, articles: [], stats: {}, error: error.message };
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    try {
      const response = await fetch(`${ARTICLE_API_BASE}/stats`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch cache stats');
      }

      return data;
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      return { success: false, stats: {}, error: error.message };
    }
  }

  /**
   * Manually refresh cache
   */
  static async refreshCache(ticker = null, politician = null) {
    try {
      const url = `${ARTICLE_API_BASE}/refresh`;
      const response = (window.apiClient && window.apiClient.fetchWithAuth)
        ? await window.apiClient.fetchWithAuth(url, { method: 'POST', body: JSON.stringify({ ticker, politician }) })
        : await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticker, politician }) });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to refresh cache');
      return data;
    } catch (error) {
      console.error('Error refreshing cache:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format article date for display
   */
  static formatArticleDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  /**
   * Get sentiment label from score
   */
  static getSentimentLabel(score) {
    if (score > 0.3) return 'Positive';
    if (score < -0.3) return 'Negative';
    return 'Neutral';
  }

  /**
   * Get sentiment color
   */
  static getSentimentColor(score) {
    if (score > 0.3) return '#00d4ff'; // Accent color for positive
    if (score < -0.3) return '#ff4444'; // Red for negative
    return '#888'; // Gray for neutral
  }

  /**
   * Render articles to HTML
   */
  static renderArticles(articles, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (articles.length === 0) {
      container.innerHTML = `
        <div class="flex items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 p-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          No articles found
        </div>
      `;
      return;
    }

    const html = articles.map(article => {
      const sentimentTone = article.sentiment > 0.3 ? 'positive' : (article.sentiment < -0.3 ? 'negative' : 'neutral');
      const borderClass = sentimentTone === 'positive'
        ? 'border-emerald-300 dark:border-emerald-500'
        : sentimentTone === 'negative'
          ? 'border-rose-300 dark:border-rose-500'
          : 'border-slate-200 dark:border-slate-700';
      const chipClass = sentimentTone === 'positive'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'
        : sentimentTone === 'negative'
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200'
          : 'bg-slate-200/70 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200';
      const relevance = typeof article.relevanceScore === 'number'
        ? `${(article.relevanceScore * 100).toFixed(0)}%`
        : 'n/a';

      return `
        <article class="article-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 ${borderClass} border-l-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              <a class="transition hover:text-primary-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/40" href="${article.url}" target="_blank" rel="noopener noreferrer">
                ${article.title}
              </a>
            </h3>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">${this.formatArticleDate(article.publishDate)}</span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            ${article.summary}
          </p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-wrap items-center gap-3 text-sm">
              <span class="font-medium text-slate-700 dark:text-slate-200">${article.source}</span>
              <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${chipClass}">
                ${this.getSentimentLabel(article.sentiment)}
              </span>
            </div>
            <div class="text-sm text-slate-500 dark:text-slate-400">
              Relevance: ${relevance}
            </div>
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = html;
  }

  /**
   * Render cache stats
   */
  static renderCacheStats(stats, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const metrics = [
      { label: 'Total Articles', value: typeof stats.total === 'number' ? stats.total : '—' },
      { label: 'Last 3 Days', value: typeof stats.last3DaysPercent === 'number' ? `${stats.last3DaysPercent}%` : '—' },
      { label: 'Last Week', value: typeof stats.lastWeekPercent === 'number' ? `${stats.lastWeekPercent}%` : '—' },
      { label: 'Oldest (days)', value: typeof stats.oldestArticle === 'number' ? stats.oldestArticle : '—' }
    ];

    const html = `
      <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Article Cache Statistics</h4>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${metrics.map(metric => `
            <div class="rounded-xl bg-slate-50/80 p-4 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">${metric.label}</dt>
              <dd class="mt-2 text-2xl font-semibold text-primary-green">${metric.value}</dd>
            </div>
          `).join('')}
        </dl>
      </section>
    `;

    container.innerHTML = html;
  }
}

// Make available globally
window.ArticleAPI = ArticleAPI;

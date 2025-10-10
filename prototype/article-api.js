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
      const response = await fetch(`${ARTICLE_API_BASE}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticker, politician })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to refresh cache');
      }

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
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No articles found</p>';
      return;
    }

    const html = articles.map(article => `
      <div class="article-card" style="background: var(--bg-card); padding: 16px; margin-bottom: 12px; border-radius: 8px; border-left: 3px solid ${this.getSentimentColor(article.sentiment)};">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 1rem; font-weight: 600;">
            <a href="${article.url}" target="_blank" rel="noopener noreferrer" style="color: var(--text); text-decoration: none;">
              ${article.title}
            </a>
          </h3>
          <span style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; margin-left: 12px;">
            ${this.formatArticleDate(article.publishDate)}
          </span>
        </div>
        
        <p style="margin: 8px 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.4;">
          ${article.summary}
        </p>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">
              ${article.source}
            </span>
            <span style="font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; background: ${this.getSentimentColor(article.sentiment)}22; color: ${this.getSentimentColor(article.sentiment)};">
              ${this.getSentimentLabel(article.sentiment)}
            </span>
          </div>
          
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Relevance: ${(article.relevanceScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * Render cache stats
   */
  static renderCacheStats(stats, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const html = `
      <div style="background: var(--bg-card); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px 0; font-size: 0.9rem; color: var(--text-muted);">Article Cache Statistics</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
          <div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent);">${stats.total}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Total Articles</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent);">${stats.last3DaysPercent}%</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Last 3 Days</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent);">${stats.lastWeekPercent}%</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Last Week</div>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent);">${stats.oldestArticle}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Oldest (days)</div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}

// Make available globally
window.ArticleAPI = ArticleAPI;

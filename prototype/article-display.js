/**
 * Article Display Component
 * Fetches and displays news articles grouped by ticker
 * Usage: Include this script and add <div id="articles-container"></div> to your HTML
 */

class ArticleDisplay {
  constructor(containerId = 'articles-container') {
    this.container = document.getElementById(containerId);
    this.apiBase = window.location.hostname === 'localhost' 
      ? 'http://localhost:4000' 
      : '';
    this.loading = false;
  }

  /**
   * Fetch and display market articles
   */
  async displayMarketArticles(options = {}) {
    const {
      limit = 30,
      daysOld = 7,
      minRelevance = 0.6
    } = options;

    try {
      this.showLoading();
      const response = await fetch(
        `${this.apiBase}/api/articles/market?limit=${limit}&daysOld=${daysOld}&minRelevance=${minRelevance}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch articles');
      
      const data = await response.json();
      this.renderArticles(data.groups, 'Market News');
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * Fetch and display articles for specific ticker
   */
  async displayTickerArticles(ticker, options = {}) {
    const {
      limit = 20,
      daysOld = 30,
      minRelevance = 0.7
    } = options;

    try {
      this.showLoading();
      const response = await fetch(
        `${this.apiBase}/api/articles/stock/${ticker}?limit=${limit}&daysOld=${daysOld}&minRelevance=${minRelevance}`
      );
      
      if (!response.ok) throw new Error(`No articles found for ${ticker}`);
      
      const data = await response.json();
      this.renderArticles(data.groups, `${ticker} News`);
    } catch (error) {
      this.showError(error.message);
    }
  }

  /**
   * Render articles in groups
   */
  renderArticles(groups, title) {
    if (!groups || groups.length === 0) {
      this.container.innerHTML = `
        <div class="no-articles">
          <p>📰 No recent articles found</p>
        </div>
      `;
      return;
    }

    const html = `
      <div class="articles-wrapper">
        <h2 class="articles-title">${title}</h2>
        <div class="articles-groups">
          ${groups.map(group => this.renderGroup(group)).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Render single article group
   */
  renderGroup(group) {
    const ticker = group._id || 'General';
    const articles = group.articles || [];
    const latestDate = articles[0]?.publishDate 
      ? new Date(articles[0].publishDate).toLocaleDateString() 
      : 'Recent';

    return `
      <div class="article-group">
        <div class="article-group-header">
          <h3 class="group-ticker">${ticker}</h3>
          <span class="group-count">${articles.length} article${articles.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="article-list">
          ${articles.slice(0, 5).map(article => this.renderArticle(article)).join('')}
        </div>
        ${articles.length > 5 ? `
          <button class="show-more-btn" onclick="articleDisplay.expandGroup('${ticker}')">
            Show ${articles.length - 5} more
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render single article
   */
  renderArticle(article) {
    const date = new Date(article.publishDate);
    const timeAgo = this.getTimeAgo(date);
    const relevance = Math.round(article.relevance * 100);

    return `
      <div class="article-item">
        <div class="article-content">
          <h4 class="article-title">
            <a href="${article.url}" target="_blank" rel="noopener">
              ${this.escapeHtml(article.title)}
            </a>
          </h4>
          <p class="article-meta">
            <span class="article-source">${this.escapeHtml(article.source)}</span>
            <span class="article-divider">•</span>
            <span class="article-date">${timeAgo}</span>
            ${relevance >= 70 ? `
              <span class="article-divider">•</span>
              <span class="article-relevance">${relevance}% relevant</span>
            ` : ''}
          </p>
          ${article.description ? `
            <p class="article-description">${this.escapeHtml(article.description)}</p>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.loading = true;
    this.container.innerHTML = `
      <div class="articles-loading">
        <div class="spinner"></div>
        <p>Loading articles...</p>
      </div>
    `;
  }

  /**
   * Show error message
   */
  showError(message) {
    this.loading = false;
    this.container.innerHTML = `
      <div class="articles-error">
        <p>❌ ${this.escapeHtml(message)}</p>
      </div>
    `;
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    const days = Math.floor(seconds / 86400);
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize global instance
let articleDisplay;
document.addEventListener('DOMContentLoaded', () => {
  articleDisplay = new ArticleDisplay();
});

/* CSS Styles - Add to your stylesheet or include in <style> tag */
const articleStyles = `
.articles-wrapper {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.articles-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.articles-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.article-group {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s;
}

.article-group:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.article-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
}

.group-ticker {
  font-size: 20px;
  font-weight: bold;
  color: #2563eb;
  margin: 0;
}

.group-count {
  font-size: 14px;
  color: #666;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 16px;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  padding: 12px;
  border-left: 3px solid #e0e0e0;
  transition: border-color 0.2s, background 0.2s;
}

.article-item:hover {
  border-left-color: #2563eb;
  background: #f9fafb;
}

.article-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.article-title a {
  color: #1a1a1a;
  text-decoration: none;
  transition: color 0.2s;
}

.article-title a:hover {
  color: #2563eb;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
}

.article-divider {
  color: #ccc;
}

.article-source {
  font-weight: 500;
}

.article-relevance {
  color: #059669;
  font-weight: 500;
}

.article-description {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.show-more-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s;
}

.show-more-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.articles-loading,
.articles-error,
.no-articles {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .articles-title {
    color: #f9fafb;
  }
  
  .article-group {
    background: #1f2937;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  
  .article-title a {
    color: #f9fafb;
  }
  
  .article-item:hover {
    background: #111827;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .articles-wrapper {
    padding: 12px;
  }
  
  .article-group {
    padding: 16px;
  }
  
  .articles-title {
    font-size: 24px;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = articleStyles;
  document.head.appendChild(styleSheet);
}

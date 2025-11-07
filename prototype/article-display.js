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
    if (!this.container) return;
    this.loading = false;
    this.currentGroups = Array.isArray(groups) ? groups : [];
    if (!groups || groups.length === 0) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 p-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <span class="inline-flex items-center gap-2"><span aria-hidden="true">📰</span>No recent articles found</span>
        </div>
      `;
      return;
    }

    const safeTitle = typeof title === 'string' && title.length ? title : 'Latest Articles';
    const html = `
      <section class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">${this.escapeHtml(safeTitle)}</h2>
        </header>
        <div class="flex flex-col gap-6">
          ${groups.map((group, index) => this.renderGroup(group, index)).join('')}
        </div>
      </section>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Render single article group
   */
  renderGroup(group, index) {
    const ticker = group._id || 'General';
    const articles = group.articles || [];
    const latestDate = articles[0]?.publishDate
      ? new Date(articles[0].publishDate).toLocaleDateString()
      : 'Recent';

    return `
      <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900" data-group-index="${index}">
        <header class="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-primary-green">${this.escapeHtml(ticker)}</h3>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Updated ${this.escapeHtml(latestDate)}</p>
          </div>
          <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            ${articles.length} article${articles.length !== 1 ? 's' : ''}
          </span>
        </header>
        <div class="article-list space-y-4 pt-4" data-role="article-list">
          ${articles.slice(0, 5).map(article => this.renderArticle(article)).join('')}
        </div>
        ${articles.length > 5 ? `
          <button type="button" class="mt-4 inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-green/60 hover:bg-primary-green/10 hover:text-primary-green dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300" data-role="show-more" onclick="articleDisplay.expandGroup(${index})">
            Show ${articles.length - 5} more
          </button>
        ` : ''}
      </article>
    `;
  }

  /**
   * Render single article
   */
  renderArticle(article) {
    const date = new Date(article.publishDate);
    const timeAgo = this.getTimeAgo(date);
    const relevanceScore = typeof article.relevance === 'number' ? Math.round(article.relevance * 100) : null;
    const highlightClass = relevanceScore !== null && relevanceScore >= 70
      ? 'text-emerald-600 dark:text-emerald-300'
      : 'text-slate-500 dark:text-slate-400';
    const articleUrl = typeof article.url === 'string' && article.url.length
      ? this.escapeHtml(article.url)
      : '#';
    const titleText = typeof article.title === 'string' && article.title.length
      ? article.title
      : 'Untitled article';
    const descriptionText = typeof article.description === 'string' && article.description.length
      ? article.description
      : null;
    const sourceText = typeof article.source === 'string' && article.source.length
      ? article.source
      : 'Unknown source';

    return `
      <article class="article-item rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-green/50 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-primary-green/40 dark:hover:bg-slate-900">
        <div class="flex flex-col gap-2">
          <h4 class="text-base font-semibold leading-6 text-slate-900 dark:text-white">
            <a class="inline-flex items-center gap-2 text-left transition hover:text-primary-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/40" href="${articleUrl}" target="_blank" rel="noopener">
              ${this.escapeHtml(titleText)}
              <svg aria-hidden="true" class="h-4 w-4 text-primary-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h6m0 0v6m0-6L10 16" />
              </svg>
            </a>
          </h4>
          <p class="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span class="font-medium text-slate-600 dark:text-slate-300">${this.escapeHtml(sourceText)}</span>
            <span aria-hidden="true">•</span>
            <span>${timeAgo}</span>
            ${relevanceScore !== null && relevanceScore >= 0 ? `
              <span aria-hidden="true">•</span>
              <span class="font-semibold ${highlightClass}">${relevanceScore}% relevant</span>
            ` : ''}
          </p>
          ${descriptionText ? `
            <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">${this.escapeHtml(descriptionText)}</p>
          ` : ''}
        </div>
      </article>
    `;
  }

  /**
   * Expand group to reveal remaining articles
   */
  expandGroup(groupIndex) {
    if (!Array.isArray(this.currentGroups)) return;
    const index = Number(groupIndex);
    if (!Number.isFinite(index)) return;
    const group = this.currentGroups[index];
    if (!group) return;
    const wrapper = this.container.querySelector(`[data-group-index="${index}"]`);
    if (!wrapper) return;
    const list = wrapper.querySelector('[data-role="article-list"]');
    if (!list) return;
    const articles = Array.isArray(group.articles) ? group.articles : [];
    list.innerHTML = articles.map(article => this.renderArticle(article)).join('');
    const button = wrapper.querySelector('[data-role="show-more"]');
    if (button) button.remove();
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.loading = true;
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-10 text-sm text-slate-500 shadow-card dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-green dark:border-slate-800 dark:border-t-primary-green/80"></div>
        <p class="font-medium text-slate-600 dark:text-slate-300">Loading articles...</p>
      </div>
    `;
  }

  /**
   * Show error message
   */
  showError(message) {
    this.loading = false;
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-10 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
        <span aria-hidden="true" class="text-lg">❌</span>
        <p class="text-center font-medium">${this.escapeHtml(message)}</p>
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

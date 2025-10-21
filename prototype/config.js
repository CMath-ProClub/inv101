// API Configuration
// Update this with your live Render URL after deployment

const API_CONFIG = {
  // Change this to your Render URL (e.g., 'https://inv101.onrender.com')
  BASE_URL: 'http://localhost:4000',
  
  // Endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    STOCKS_TOP100: '/api/stocks/top100',
    STOCKS_CACHED: '/api/stocks/cached',
    STOCK_DETAIL: (ticker) => `/api/stocks/${ticker}`,
    ARTICLES: '/api/articles',
    PORTFOLIO: '/api/portfolio',
    MARKET_OVERVIEW: '/api/market/overview'
  },
  
  // Helper function to get full URL
  getUrl: function(endpoint) {
    return this.BASE_URL + endpoint;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}

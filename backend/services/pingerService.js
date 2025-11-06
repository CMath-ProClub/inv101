const https = require('https');
const http = require('http');

class PingerService {
  constructor() {
    this.interval = 10 * 60 * 1000; // 10 minutes
    this.timer = null;
    this.urls = [];
    this.isRunning = false;
  }

  /**
   * Add a URL to ping
   * @param {string} url - Full URL to ping
   */
  addUrl(url) {
    if (!this.urls.includes(url)) {
      this.urls.push(url);
      console.log(`[Pinger] Added URL: ${url}`);
    }
  }

  /**
   * Ping a single URL
   * @param {string} url - URL to ping
   */
  pingUrl(url) {
    return new Promise((resolve) => {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        timeout: 30000,
        headers: {
          'User-Agent': 'Investing101-KeepAlive/1.0'
        }
      };

      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const timestamp = new Date().toISOString();
          console.log(`[Pinger] ✓ ${url} - Status: ${res.statusCode} [${timestamp}]`);
          resolve({ success: true, statusCode: res.statusCode, url, timestamp });
        });
      });

      req.on('error', (error) => {
        const timestamp = new Date().toISOString();
        console.error(`[Pinger] ✗ ${url} - Error: ${error.message} [${timestamp}]`);
        resolve({ success: false, error: error.message, url, timestamp });
      });

      req.on('timeout', () => {
        req.destroy();
        const timestamp = new Date().toISOString();
        console.error(`[Pinger] ✗ ${url} - Timeout [${timestamp}]`);
        resolve({ success: false, error: 'Request timeout', url, timestamp });
      });

      req.end();
    });
  }

  /**
   * Ping all registered URLs
   */
  async pingAll() {
    if (this.urls.length === 0) {
      console.log('[Pinger] No URLs to ping');
      return [];
    }

    console.log(`[Pinger] 🔄 Pinging ${this.urls.length} URL(s)...`);
    const results = await Promise.all(
      this.urls.map(url => this.pingUrl(url))
    );
    
    const successCount = results.filter(r => r.success).length;
    console.log(`[Pinger] ✓ ${successCount}/${this.urls.length} pings successful`);
    
    return results;
  }

  /**
   * Start the pinger service
   */
  start() {
    if (this.isRunning) {
      console.log('[Pinger] Already running');
      return;
    }

    this.isRunning = true;
    console.log(`[Pinger] 🚀 Started - pinging every ${this.interval / 60000} minutes`);
    
    // Ping immediately on start
    this.pingAll();
    
    // Then schedule regular pings
    this.timer = setInterval(() => {
      this.pingAll();
    }, this.interval);
  }

  /**
   * Stop the pinger service
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.isRunning = false;
      console.log('[Pinger] 🛑 Stopped');
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.interval / 60000,
      urls: this.urls,
      nextPingIn: this.isRunning ? `${this.interval / 60000} minutes` : 'N/A'
    };
  }
}

// Create singleton instance
const pingerService = new PingerService();

// Auto-start if APP_URL is defined in environment
if (process.env.APP_URL) {
  pingerService.addUrl(process.env.APP_URL);
  
  // Also add common health check endpoints
  const baseUrl = process.env.APP_URL.replace(/\/$/, '');
  pingerService.addUrl(`${baseUrl}/api/auth/me`);
  
  // Start after a short delay to let the server fully initialize
  setTimeout(() => {
    pingerService.start();
  }, 5000);
}

module.exports = pingerService;

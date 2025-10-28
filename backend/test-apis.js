const http = require('http');

function fetchJson(path) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'localhost', port: 4000, path, method: 'GET' };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async function run() {
  try {
    console.log('Checking /api/health');
    const h = await fetchJson('/api/health');
    console.log('health:', h.status || JSON.stringify(h).slice(0,200));

    console.log('\nChecking /api/portfolio');
    const p = await fetchJson('/api/portfolio');
    console.log('portfolio:', p.success ? `OK, holdings=${p.portfolio.holdings.length}` : JSON.stringify(p));

    console.log('\nChecking /api/demo/spy');
    const s = await fetchJson('/api/demo/spy');
    console.log('demo spy:', s.success ? `OK, series=${s.data.series.length}` : JSON.stringify(s));

    console.log('\nAll tests completed.');
  } catch (err) {
    console.error('Test failed:', err.message || err);
    process.exit(1);
  }
})();

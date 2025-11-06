const { getProviderConfig } = require('../../config/externalApis');
const { createHttpClient, requestWithHandling } = require('./httpClient');
const { MissingApiConfigurationError } = require('./errors');

function getConfig() {
  const config = getProviderConfig('stockdataOrg');
  if (!config || !config.apiKey) {
    throw new MissingApiConfigurationError('stockdataOrg', 'Set STOCKDATA_API_KEY to use Stockdata.org endpoints.');
  }
  return config;
}

function buildClient() {
  const config = getConfig();
  return createHttpClient({
    baseURL: config.baseUrl,
    headers: {
      'Accept-Encoding': 'gzip, deflate'
    }
  });
}

async function fetchQuote(symbols) {
  const client = buildClient();
  const params = {
    symbols: Array.isArray(symbols) ? symbols.join(',') : symbols,
    api_token: getConfig().apiKey
  };

  const data = await requestWithHandling(client, {
    url: '/data/quote',
    method: 'GET',
    params
  });

  return data;
}

async function fetchIntraday(symbol, options = {}) {
  const client = buildClient();
  const params = {
    symbol,
    sort: options.sort || 'desc',
    interval: options.interval || '15min',
    limit: options.limit || 120,
    api_token: getConfig().apiKey
  };

  const data = await requestWithHandling(client, {
    url: '/data/intraday',
    method: 'GET',
    params
  });

  return data;
}

module.exports = {
  fetchQuote,
  fetchIntraday
};

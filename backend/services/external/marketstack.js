const { getProviderConfig } = require('../../config/externalApis');
const { createHttpClient, requestWithHandling } = require('./httpClient');
const { MissingApiConfigurationError } = require('./errors');

function getConfig() {
  const config = getProviderConfig('marketstack');
  if (!config || !config.apiKey) {
    throw new MissingApiConfigurationError('marketstack', 'Set MARKETSTACK_API_KEY before calling this endpoint.');
  }
  return config;
}

function buildClient() {
  const config = getConfig();
  return createHttpClient({
    baseURL: config.baseUrl
  });
}

async function fetchIntraday(symbol, options = {}) {
  const client = buildClient();
  const params = {
    access_key: getConfig().apiKey,
    symbols: symbol,
    limit: options.limit || 1,
    offset: options.offset || 0
  };

  const data = await requestWithHandling(client, {
    url: '/intraday',
    method: 'GET',
    params
  });

  return data;
}

async function fetchEod(symbol, options = {}) {
  const client = buildClient();
  const params = {
    access_key: getConfig().apiKey,
    symbols: symbol,
    date_from: options.dateFrom,
    date_to: options.dateTo,
    limit: options.limit || 100
  };

  const data = await requestWithHandling(client, {
    url: '/eod',
    method: 'GET',
    params
  });

  return data;
}

module.exports = {
  fetchIntraday,
  fetchEod
};

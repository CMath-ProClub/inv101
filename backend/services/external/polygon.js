const { getProviderConfig } = require('../../config/externalApis');
const { createHttpClient, requestWithHandling } = require('./httpClient');
const { MissingApiConfigurationError } = require('./errors');

function getConfig() {
  const config = getProviderConfig('polygon');
  if (!config || !config.apiKey) {
    throw new MissingApiConfigurationError('polygon', 'Set POLYGON_API_KEY (or MASSIVE API key) to use Polygon endpoints.');
  }
  return config;
}

function buildClient() {
  const config = getConfig();
  return createHttpClient({
    baseURL: config.baseUrl
  });
}

async function fetchAggregates(symbol, multiplier = 1, timespan = 'day', from, to, options = {}) {
  const client = buildClient();
  const params = {
    apiKey: getConfig().apiKey,
    adjusted: options.adjusted !== false,
    sort: options.sort || 'desc',
    limit: options.limit || 120
  };

  const data = await requestWithHandling(client, {
    url: `/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}`,
    method: 'GET',
    params
  });

  return data;
}

async function fetchPreviousClose(symbol, options = {}) {
  const client = buildClient();
  const params = {
    apiKey: getConfig().apiKey,
    adjusted: options.adjusted !== false
  };

  const data = await requestWithHandling(client, {
    url: `/v2/aggs/ticker/${symbol}/prev`,
    method: 'GET',
    params
  });

  return data;
}

module.exports = {
  fetchAggregates,
  fetchPreviousClose
};

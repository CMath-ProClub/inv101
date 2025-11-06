const { getProviderConfig } = require('../../config/externalApis');
const { createHttpClient, requestWithHandling } = require('./httpClient');

function buildClient() {
  const config = getProviderConfig('econdb');
  return createHttpClient({
    baseURL: config.baseUrl
  });
}

async function fetchSeries(seriesCode, options = {}) {
  const client = buildClient();
  const params = {
    ...options,
    format: options.format || 'json'
  };

  const data = await requestWithHandling(client, {
    url: `/series/${seriesCode}/`,
    method: 'GET',
    params
  });

  return data;
}

async function listSeries(options = {}) {
  const client = buildClient();

  const data = await requestWithHandling(client, {
    url: '/series/',
    method: 'GET',
    params: {
      search: options.search,
      format: 'json'
    }
  });

  return data;
}

module.exports = {
  fetchSeries,
  listSeries
};

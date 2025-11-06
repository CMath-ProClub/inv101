const { getProviderConfig } = require('../../config/externalApis');
const { createHttpClient, requestWithHandling } = require('./httpClient');
const { MissingApiConfigurationError } = require('./errors');

function getConfig() {
  const config = getProviderConfig('nasdaqDataLink');
  return config;
}

function buildClient() {
  const config = getConfig();
  return createHttpClient({
    baseURL: config.baseUrl
  });
}

async function fetchDataset(datasetCode, options = {}) {
  const client = buildClient();
  const config = getConfig();
  const params = {
    ...(options.params || {}),
    api_key: config.apiKey
  };

  if (!config.apiKey) {
    // Many datasets are public without an API key; only include when present.
    delete params.api_key;
  }

  if (options.startDate) {
    params.start_date = options.startDate;
  }
  if (options.endDate) {
    params.end_date = options.endDate;
  }
  if (options.limit) {
    params.limit = options.limit;
  }
  if (options.columnIndex !== undefined) {
    params.column_index = options.columnIndex;
  }

  const data = await requestWithHandling(client, {
    url: `/datasets/${datasetCode}.json`,
    method: 'GET',
    params
  });

  return data;
}

module.exports = {
  fetchDataset
};

const { getProviderConfig } = require('../../config/externalApis');
const { createHttpClient, requestWithHandling } = require('./httpClient');

function buildClient() {
  const config = getProviderConfig('fiscalDataTreasury');
  return createHttpClient({
    baseURL: config.baseUrl
  });
}

async function fetchDataset(datasetPath, options = {}) {
  const client = buildClient();
  const { filter, sort, pageSize, pageNumber, fields } = options;

  const params = {
    format: 'json'
  };

  if (filter) {
    params.filter = filter;
  }
  if (sort) {
    params.sort = sort;
  }
  if (pageSize) {
    params['page[size]'] = pageSize;
  }
  if (pageNumber) {
    params['page[number]'] = pageNumber;
  }
  if (Array.isArray(fields) && fields.length) {
    params.fields = fields.join(',');
  }

  const data = await requestWithHandling(client, {
    url: `/${datasetPath}`,
    method: 'GET',
    params
  });

  return data;
}
module.exports = {
  fetchDataset
};

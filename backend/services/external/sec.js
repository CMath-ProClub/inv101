const { getProviderConfig } = require('../../config/externalApis');
const { createHttpClient, requestWithHandling } = require('./httpClient');

function buildClient() {
  const config = getProviderConfig('sec');
  return createHttpClient({
    baseURL: config.baseUrl,
    headers: {
      Accept: 'application/json'
    }
  });
}

async function fetchCompanyFacts(cik) {
  const normalized = normalizeCik(cik);
  const client = buildClient();

  const data = await requestWithHandling(client, {
    url: `/api/xbrl/companyfacts/CIK${normalized}.json`,
    method: 'GET'
  });

  return data;
}

async function fetchSubmissions(cik) {
  const normalized = normalizeCik(cik);
  const client = buildClient();

  const data = await requestWithHandling(client, {
    url: `/submissions/CIK${normalized}.json`,
    method: 'GET'
  });

  return data;
}

function normalizeCik(value) {
  const digits = String(value || '')
    .replace(/^CIK/i, '')
    .replace(/[^0-9]/g, '')
    .padStart(10, '0');
  return digits;
}

module.exports = {
  fetchCompanyFacts,
  fetchSubmissions
};

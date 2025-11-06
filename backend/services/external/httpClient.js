const axios = require('axios');
const { DEFAULT_USER_AGENT } = require('../../config/externalApis');

function buildHeaders(extra = {}) {
  const headers = {
    'User-Agent': DEFAULT_USER_AGENT,
    'Content-Type': 'application/json',
    ...extra
  };

  if (headers['User-Agent'] && headers['User-Agent'].includes('\n')) {
    headers['User-Agent'] = headers['User-Agent'].replace(/\s+/g, ' ').trim();
  }

  return headers;
}

function createHttpClient(options = {}) {
  const {
    baseURL,
    timeout = 15000,
    headers
  } = options;

  return axios.create({
    baseURL,
    timeout,
    headers: buildHeaders(headers)
  });
}

async function requestWithHandling(client, config) {
  try {
    const response = await client.request(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      const err = new Error(`HTTP ${status}: ${JSON.stringify(data)}`);
      err.statusCode = status;
      err.responseData = data;
      throw err;
    }

    if (error.request) {
      const err = new Error('No response received from upstream service');
      err.statusCode = 504;
      throw err;
    }

    throw error;
  }
}

module.exports = {
  buildHeaders,
  createHttpClient,
  requestWithHandling
};

const { listProviders, getProviderConfig, isProviderConfigured } = require('../../config/externalApis');
const { MissingApiConfigurationError, UnsupportedOperationError } = require('./errors');

const marketstack = require('./marketstack');
const econdb = require('./econdb');
const fiscalDataTreasury = require('./fiscalDataTreasury');
const polygon = require('./polygon');
const sec = require('./sec');
const stockdataOrg = require('./stockdataOrg');
const nasdaqDataLink = require('./nasdaqDataLink');
const yahooFinance = require('./yahooFinance');

const SAMPLE_HANDLERS = {
  marketstack: async (options = {}) => {
    const symbol = options.symbol || 'AAPL';
    const intraday = await marketstack.fetchIntraday(symbol, { limit: 5 });
    const eod = await marketstack.fetchEod(symbol, { limit: 5 });
    return { symbol, intraday, eod };
  },
  econdb: async (options = {}) => {
    const code = options.series || 'GDPUS';
    return econdb.fetchSeries(code, { format: 'json' });
  },
  fiscalDataTreasury: async (options = {}) => {
    const dataset = options.dataset || 'v1/accounting/od/debt_to_penny';
    return fiscalDataTreasury.fetchDataset(dataset, {
      pageSize: options.pageSize || 10
    });
  },
  polygon: async (options = {}) => {
    const symbol = options.symbol || 'AAPL';
    return polygon.fetchPreviousClose(symbol, {});
  },
  sec: async (options = {}) => {
    const cik = options.cik || '0000320193';
    return sec.fetchCompanyFacts(cik);
  },
  stockdataOrg: async (options = {}) => {
    const symbol = options.symbol || 'AAPL';
    return stockdataOrg.fetchQuote(symbol);
  },
  yahooFinance: async (options = {}) => {
    const symbol = options.symbol || 'AAPL';
    const [quote, history] = await Promise.all([
      yahooFinance.fetchQuote(symbol),
      yahooFinance.fetchHistorical(symbol, {
        period1: options.period1,
        period2: options.period2,
        interval: options.interval || '1d'
      })
    ]);
    return { quote, history };
  },
  nasdaqDataLink: async (options = {}) => {
    const dataset = options.dataset || 'WIKI/AAPL';
    return nasdaqDataLink.fetchDataset(dataset, {
      startDate: options.startDate,
      endDate: options.endDate,
      limit: options.limit || 100
    });
  }
};

function listProviderMetadata() {
  return listProviders();
}

async function fetchSample(providerId, options = {}) {
  if (!SAMPLE_HANDLERS[providerId]) {
    throw new UnsupportedOperationError(providerId, 'sample');
  }

  if (!isProviderConfigured(providerId)) {
    const provider = getProviderConfig(providerId);
    if (provider && provider.authType === 'apiKey') {
      throw new MissingApiConfigurationError(providerId, `Provide API credentials for ${provider.name} before requesting live data.`);
    }
  }

  return SAMPLE_HANDLERS[providerId](options);
}

module.exports = {
  listProviderMetadata,
  fetchSample,
  getProviderConfig,
  isProviderConfigured,
};

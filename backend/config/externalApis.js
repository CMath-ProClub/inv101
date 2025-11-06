const DEFAULT_USER_AGENT = process.env.EXTERNAL_API_USER_AGENT || 'Inv101/1.0 (contact: support@inv101.local)';

const providers = {
  marketstack: {
    id: 'marketstack',
    name: 'Marketstack',
    category: 'market-data',
    baseUrl: 'https://api.marketstack.com/v1',
    authType: 'apiKey',
    apiKey: process.env.MARKETSTACK_API_KEY || process.env.MARKETSTACK_ACCESS_KEY,
    docs: 'https://marketstack.com/documentation',
    notes: 'Intraday, end-of-day, and real-time equities data.'
  },
  econdb: {
    id: 'econdb',
    name: 'EconDB',
    category: 'macroeconomics',
    baseUrl: 'https://www.econdb.com/api',
    authType: 'none',
    docs: 'https://www.econdb.com/api/',
    notes: 'Macroeconomic time-series data. Free and public.'
  },
  fiscalDataTreasury: {
    id: 'fiscalDataTreasury',
    name: 'US Treasury Fiscal Data',
    category: 'government-data',
    baseUrl: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service',
    authType: 'none',
    docs: 'https://fiscaldata.treasury.gov/api-documentation/',
    notes: 'Treasury datasets including debt, revenue, and financial statements.'
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon (Massive API)',
    category: 'market-data',
    baseUrl: 'https://api.polygon.io',
    authType: 'apiKey',
    apiKey: process.env.POLYGON_API_KEY || process.env.MASSIVE_API_KEY || process.env.MASSIVE_POLYGON_KEY,
    docs: 'https://polygon.io/docs/stocks',
    notes: 'Historical, real-time, and reference data for equities and options.'
  },
  sec: {
    id: 'sec',
    name: 'SEC EDGAR',
    category: 'regulatory-filings',
    baseUrl: 'https://data.sec.gov',
    authType: 'none',
    docs: 'https://www.sec.gov/os/accessing-edgar-data',
    notes: 'Company filings and financial statements. Requires descriptive User-Agent header.'
  },
  stockdataOrg: {
    id: 'stockdataOrg',
    name: 'Stockdata.org',
    category: 'market-data',
    baseUrl: 'https://api.stockdata.org/v1',
    authType: 'apiKey',
    apiKey: process.env.STOCKDATA_API_KEY,
    docs: 'https://www.stockdata.org/documentation',
    notes: 'Real-time, intraday, historical, news, and sentiment data.'
  },
  yahooFinance: {
    id: 'yahooFinance',
    name: 'Yahoo Finance',
    category: 'market-data',
    baseUrl: 'https://query1.finance.yahoo.com',
    authType: 'none',
    docs: 'https://www.npmjs.com/package/yahoo-finance2',
    notes: 'Already integrated via yahoo-finance2 package.'
  },
  nasdaqDataLink: {
    id: 'nasdaqDataLink',
    name: 'Nasdaq Data Link',
    category: 'market-data',
    baseUrl: 'https://data.nasdaq.com/api/v3',
    authType: 'apiKey',
    apiKey: process.env.NASDAQ_DATA_LINK_KEY || process.env.QUANDL_API_KEY,
    docs: 'https://docs.data.nasdaq.com/',
    notes: 'Financial and economic datasets (formerly Quandl). Many free endpoints.'
  },
  gmailApi: {
    id: 'gmailApi',
    name: 'Gmail API',
    category: 'productivity',
    baseUrl: 'https://gmail.googleapis.com/gmail/v1',
    authType: 'oauth2',
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    redirectUri: process.env.GMAIL_REDIRECT_URI,
    docs: 'https://developers.google.com/gmail/api',
    notes: 'Requires Google Cloud project, OAuth consent screen, and delegated scopes.'
  },
  googleSheets: {
    id: 'googleSheets',
    name: 'Google Sheets API',
    category: 'productivity',
    baseUrl: 'https://sheets.googleapis.com/v4',
    authType: 'oauth2',
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    docs: 'https://developers.google.com/workspace/sheets/api/reference/rest',
    notes: 'Preferred approach via service account credentials for server-to-server use.'
  }
};

function listProviders() {
  return Object.values(providers).map((provider) => ({
    id: provider.id,
    name: provider.name,
    category: provider.category,
    authType: provider.authType,
    baseUrl: provider.baseUrl,
    docs: provider.docs,
    notes: provider.notes,
    configured: isProviderConfigured(provider.id)
  }));
}

function getProviderConfig(id) {
  return providers[id] || null;
}

function isProviderConfigured(id) {
  const provider = providers[id];
  if (!provider) {
    return false;
  }

  switch (provider.authType) {
    case 'apiKey':
      return Boolean(provider.apiKey);
    case 'oauth2':
      if (id === 'gmailApi') {
        return Boolean(provider.clientId && provider.clientSecret && provider.redirectUri);
      }
      if (id === 'googleSheets') {
        return Boolean(provider.clientEmail && provider.privateKey);
      }
      return false;
    default:
      return true;
  }
}

module.exports = {
  DEFAULT_USER_AGENT,
  providers,
  listProviders,
  getProviderConfig,
  isProviderConfigured
};

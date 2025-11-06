const yahooFinance = require('yahoo-finance2').default;

yahooFinance.setGlobalConfig({
  queue: {
    timeout: 20000
  }
});

yahooFinance.suppressNotices?.(['ripHistorical', 'yahooSurvey']);

async function fetchQuote(symbol) {
  return yahooFinance.quote(symbol, { validateResult: false });
}

async function fetchHistorical(symbol, options = {}) {
  const { period1, period2, interval = '1d', events = 'history' } = options;
  return yahooFinance.historical(symbol, { period1, period2, interval, events }, { validateResult: false });
}

module.exports = {
  fetchQuote,
  fetchHistorical
};

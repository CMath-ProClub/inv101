const express = require('express');
const router = express.Router();

const {
  listProviderMetadata,
  fetchSample,
  getProviderConfig,
  isProviderConfigured
} = require('../services/external');
const { ExternalApiError, MissingApiConfigurationError } = require('../services/external/errors');

router.get('/', (req, res) => {
  res.json({
    success: true,
    providers: listProviderMetadata()
  });
});

router.get('/:providerId/config', (req, res) => {
  const providerId = req.params.providerId;
  const config = getProviderConfig(providerId);

  if (!config) {
    return res.status(404).json({
      success: false,
      error: 'Unknown provider'
    });
  }

  const safeConfig = { ...config };
  if (safeConfig.apiKey) {
    safeConfig.apiKey = config.apiKey ? '********' : null;
  }
  if (safeConfig.clientSecret) {
    safeConfig.clientSecret = config.clientSecret ? '********' : null;
  }
  if (safeConfig.privateKey) {
    safeConfig.privateKey = config.privateKey ? '********' : null;
  }

  res.json({
    success: true,
    configured: isProviderConfigured(providerId),
    config: safeConfig
  });
});

router.get('/:providerId/sample', async (req, res) => {
  const providerId = req.params.providerId;
  const options = {
    symbol: req.query.symbol,
    dataset: req.query.dataset,
    series: req.query.series,
    cik: req.query.cik,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    interval: req.query.interval
  };

  try {
    const data = await fetchSample(providerId, options);
    res.json({
      success: true,
      providerId,
      data
    });
  } catch (error) {
    if (error instanceof MissingApiConfigurationError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    if (error instanceof ExternalApiError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to fetch provider data'
    });
  }
});

router.get('/google/workspace/status', (req, res) => {
  res.json({
    success: true,
     gmailDependencyLoaded: false
  });
});

module.exports = router;

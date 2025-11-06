class ExternalApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ExternalApiError';
    this.providerId = options.providerId;
    this.statusCode = options.statusCode || 502;
    this.details = options.details;
  }
}

class MissingApiConfigurationError extends ExternalApiError {
  constructor(providerId, message) {
    super(message || `Missing configuration for provider: ${providerId}`, {
      providerId,
      statusCode: 503
    });
    this.name = 'MissingApiConfigurationError';
  }
}

class UnsupportedOperationError extends ExternalApiError {
  constructor(providerId, operation) {
    super(`Operation "${operation}" is not supported by provider ${providerId}`, {
      providerId,
      statusCode: 400
    });
    this.name = 'UnsupportedOperationError';
  }
}

module.exports = {
  ExternalApiError,
  MissingApiConfigurationError,
  UnsupportedOperationError
};

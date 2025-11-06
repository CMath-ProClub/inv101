let google;

try {
  // Lazy-load to avoid crashing if dependency has not been installed yet.
  google = require('googleapis').google;
} catch (error) {
  google = null;
}

const MISSING_DEPENDENCY_MESSAGE = 'Install the "googleapis" package and configure Google credentials to use this feature.';

function ensureDependency() {
  if (!google) {
    throw new Error(MISSING_DEPENDENCY_MESSAGE);
  }
}

function getGmailOAuthClient({ clientId, clientSecret, redirectUri }) {
  ensureDependency();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getSheetsService(auth) {
  ensureDependency();
  return google.sheets({ version: 'v4', auth });
}

module.exports = {
  getGmailOAuthClient,
  getSheetsService,
  dependencyLoaded: Boolean(google)
};

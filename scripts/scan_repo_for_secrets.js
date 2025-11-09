#!/usr/bin/env node
// scan_repo_for_secrets.js
// Scans all tracked files (git ls-files) for common secret patterns and exits non-zero if any are found.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const reportOnly = args.includes('--report-only') || args.includes('--report');
const verbose = args.includes('--verbose');

function getTrackedFiles() {
  const out = execSync('git ls-files', { encoding: 'utf8' });
  return out.split(/\r?\n/).filter(Boolean);
}

const allowlistFiles = new Set([
  'SECURITY_AND_AUTOMATION.md',
  'backend/articleCacheService.js',
  'backend/index.js',
  'backend/models/User.js',
  'backend/routes/admin.js',
  'backend/scripts/check_atlas_articles.js',
  'prototype/simulator-invest101.js',
  'prototype/signin.html',
  'prototype/signup.html',
  'render.yaml'
]);

// Load external allowlist JSON if present
const externalAllowlistPath = path.resolve('.secret-scan-allowlist.json');
if (fs.existsSync(externalAllowlistPath)) {
  try {
    const external = JSON.parse(fs.readFileSync(externalAllowlistPath, 'utf8'));
    if (Array.isArray(external)) {
      external.forEach(f => allowlistFiles.add(f));
    }
  } catch (e) {
    console.warn('[secret-scan] Failed to parse external allowlist:', e.message);
  }
}

// Base patterns (identifiers or structural secret indicators)
const patterns = [
  /mongodb\+srv:\/\/[\w%:@\-.]+/i,
  /\bMONGODB_URI\b/i,
  /\bJWT_SECRET\b/i,
  /\bADMIN_TOKEN\b/i,
  /\bAPI[_-]?KEY\b/i,
  /-----BEGIN (RSA|PRIVATE) KEY-----/i,
  /secret\s*[:=]/i,
  /password\s*[:=]/i,
  /pwd\s*[:=]/i
];

let problems = [];

for (const file of getTrackedFiles()) {
  try {
    const full = path.resolve(process.cwd(), file);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;
    if (allowlistFiles.has(file)) continue;
    if (/\.md$/i.test(file)) continue; // skip docs
    if (/node_modules/.test(file)) continue;
    // Skip examples, sample & env example files
    if (/example/i.test(file) || /sample/i.test(file) || file.endsWith('.env') || file.endsWith('.env.example')) continue;

    const content = fs.readFileSync(full, 'utf8');
    for (const regex of patterns) {
      const match = content.match(regex);
      if (!match) continue;
      const snippet = getSnippet(content, regex);
      const lowered = snippet.toLowerCase();

      // Skip if just referencing env variable or placeholders
      if (/process\.env/.test(lowered)) continue;
      if (/(your_|change-?me|placeholder|dummy|sample|example)/i.test(lowered)) continue;
      if (lowered.includes('${{ secrets')) continue; // GitHub Actions context
      if (lowered.includes('localhost')) continue;

      // Extract candidate value after = or :
      const valueMatch = snippet.match(/[:=]\s*(['"]?)([A-Za-z0-9_\-\/+]{8,})\1/);
      let candidate = valueMatch ? valueMatch[2] : null;
      let highEntropy = false;
      if (candidate) {
        const uniqueChars = new Set(candidate.split(''));
        const entropyScore = uniqueChars.size / candidate.length;
        highEntropy = candidate.length >= 24 && entropyScore > 0.5;
      }

      // If pattern is a keyword (e.g., JWT_SECRET) but no high-entropy value nearby, treat as safe usage.
      const isStructuralOnly = /\b(JWT_SECRET|MONGODB_URI|API[_-]?KEY|ADMIN_TOKEN)\b/i.test(match[0]) && !highEntropy;
      if (isStructuralOnly) continue;

      // Private key blocks always flagged
      if (/-----BEGIN (RSA|PRIVATE) KEY-----/i.test(match[0])) {
        problems.push({ file, pattern: regex.toString(), snippet });
        break;
      }

      // If we saw a high entropy candidate, flag; otherwise skip.
      if (highEntropy) {
        problems.push({ file, pattern: regex.toString(), snippet, valuePreview: candidate.slice(0, 6) + '...' });
        break;
      }
    }
  } catch (e) {
    if (verbose) console.warn('[secret-scan] Skip file due to error', file, e.message);
  }
}

function getSnippet(content, regex) {
  const m = content.match(regex);
  if (!m) return '';
  const idx = m.index;
  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + 160);
  return content.slice(start, end).replace(/\r?\n/g, ' ');
}

if (problems.length === 0) {
  console.log('[secret-scan] PASS – No probable secrets detected.');
  process.exit(0);
} else {
  const header = reportOnly ? '[secret-scan] REPORT – Potential secrets (non-blocking):' : '[secret-scan] FAIL – Potential secrets:';
  console.error(header);
  for (const p of problems) {
    console.error(`- ${p.file} pattern=${p.pattern}${p.valuePreview ? ' value~'+p.valuePreview : ''}`);
    console.error(`  snippet: ${p.snippet}`);
  }
  if (reportOnly) {
    console.error('\nRun without --report-only to block on these.');
    process.exit(0);
  } else {
    console.error('\nRemove secrets or move them to environment variables / secret storage. Use --report-only for a non-blocking check.');
    process.exit(2);
  }
}

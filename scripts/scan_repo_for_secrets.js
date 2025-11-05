#!/usr/bin/env node
// scan_repo_for_secrets.js
// Scans all tracked files (git ls-files) for common secret patterns and exits non-zero if any are found.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  'render.yaml'
]);

const patterns = [
  /mongodb\+srv:\/\/[\w%:@\-\.]+/i,
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
    // skip node_modules if somehow tracked
    if (file.includes('node_modules')) continue;
    const content = fs.readFileSync(full, 'utf8');
    for (const p of patterns) {
      const m = content.match(p);
      if (m) {
        const snippet = getSnippet(content, p);
        // ignore obvious placeholders and examples
        const lowered = snippet.toLowerCase();
        const safeIndicators = [
          '<',
          'example',
          'your_key',
          'localhost',
          'process.env',
          '${{ secrets',
          'your-secure',
          'change-me',
          'your-atlas-uri'
        ];
        if (safeIndicators.some((indicator) => lowered.includes(indicator))) {
          continue;
        }
        problems.push({ file, pattern: p.toString(), snippet });
        break;
      }
    }
  } catch (e) {
    // ignore unreadable files
  }
}

function getSnippet(content, regex) {
  const m = content.match(regex);
  if (!m) return '';
  const idx = m.index;
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + 120);
  return content.slice(start, end).replace(/\r?\n/g, ' ');
}

if (problems.length === 0) {
  console.log('No probable secrets detected in tracked files.');
  process.exit(0);
} else {
  console.error('Possible secrets found in tracked files:');
  for (const p of problems) {
    console.error(`- ${p.file}  pattern=${p.pattern}`);
    console.error(`  snippet: ${p.snippet}`);
  }
  console.error('\nRecommend removing secrets and storing them in environment variables or GitHub Secrets.');
  process.exit(2);
}

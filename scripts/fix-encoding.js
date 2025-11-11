#!/usr/bin/env node
/**
 * Batch fix common UTF-8 mojibake / mis-encoded sequences in HTML files.
 * Usage:
 *   node scripts/fix-encoding.js --dry-run            (reports planned changes)
 *   node scripts/fix-encoding.js --write              (applies changes)
 *   node scripts/fix-encoding.js --write --backup     (applies and writes .bak copies)
 *
 * Scans prototype/*.html and integration examples. Extend the map as needed.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIR = path.join(ROOT, 'prototype');

// Replacement map for common mojibake sequences.
const REPLACEMENTS = new Map([
  // General punctuation / symbols
  ['Â·', '·'], ['Â', ''], ['â€“', '–'], ['â€”', '—'], ['â€™', '’'], ['â€œ', '“'], ['â€', '”'], ['â€˜', '‘'], ['â€¦', '…'],
  ['âœ•', '✕'], ['âœ¨', '✨'], ['âœ”', '✔'], ['âŒ', '✖'], ['â†', '←'], ['â†»', '↻'], ['â–¶', '▶'], ['â‚¿', '₿'],
  ['â‰¥', '≥'], ['âœï¸', '✏️'], ['â–²', '▲'], ['â˜…', '★'], ['â¸ï¸', '⏸️'], ['âš–ï¸', '⚖️'],
  // Base emojis & domain icons
  ['âš™ï¸', '⚙️'], ['âš ï¸', '⚠️'], ['âš•ï¸', '⚕️'], ['âš¡', '⚡'], ['â›ï¸', '🧪'], ['âš–', '⚖️'],
  // Charts & finance
  ['ðŸ“ˆ', '📈'], ['ðŸ“‰', '📉'], ['ðŸ“Š', '📊'], ['ðŸ’°', '💰'], ['ðŸ’¹', '💹'], ['ðŸ’Ž', '🧠'], ['ðŸ’µ', '💵'], ['ðŸ’³', '💳'],
  // Documents / interface
  ['ðŸ“‹', '📋'], ['ðŸ“', '📝'], ['ðŸ“¦', '�️'], ['ðŸ“‚', '�'], ['ðŸ’¾', '💾'], ['ðŸ”—', '�'],
  // Communication & user
  ['ðŸ“§', '📧'], ['ðŸ‘¤', '👤'], ['ðŸ‘¥', '👥'], ['ðŸ”’', '🔒'], ['ðŸ”', '🔍'], ['ðŸ””', '🔔'], ['ðŸ”¥', '🔥'], ['ðŸ”§', '🔧'], ['ðŸ’¡', '💡'],
  // Awards & achievements
  ['ðŸ†', '🏆'], ['ðŸ¥‡', '🥇'], ['ðŸ¥ˆ', '🥈'], ['ðŸ¥‰', '🥉'], ['ðŸ…', '🏅'],
  // Education & progress
  ['ðŸ“š', '�'], ['ðŸŽ“', '🎓'], ['ðŸŽ®', '🎮'], ['ðŸŽ‰', '🎉'], ['ðŸ¤–', '🤖'],
  // Sectors & categories
  ['ðŸ›¡ï¸', '🛡️'], ['ðŸ›’', '🛒'], ['ðŸ¦', '🏦'], ['ðŸ–ï¸', '🏖️'], ['ðŸŒŠ', '🌊'], ['ðŸ“°', '📰'], ['ðŸ“¸', '📸'],
  // Strategy variants
  ['ðŸš€', '�'], ['ðŸŸ¢', '🟢'], ['ðŸŸ¡', '🟡'], ['ðŸ”´', '�'],
  // Device / misc
  ['ðŸ“±', '📱'], ['ðŸ’¼', '📚']
]);

const args = process.argv.slice(2);
const DO_WRITE = args.includes('--write');
const DRY_RUN = args.includes('--dry-run') || !DO_WRITE;
const DO_BACKUP = args.includes('--backup');

function gatherHtmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out.push(...gatherHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function applyReplacements(content) {
  let changed = false;
  let newContent = content;
  for (const [bad, good] of REPLACEMENTS.entries()) {
    if (newContent.includes(bad)) {
      newContent = newContent.split(bad).join(good);
      changed = true;
    }
  }
  // Handle any residual UTF-8 mojibake starting with 'ðŸ' defensively: replace with ''
  if (/ðŸ/.test(newContent)) {
    newContent = newContent.replace(/ðŸ[^\s<]{0,10}/g, (m) => {
      changed = true;
      return '';
    });
  }
  return { changed, newContent };
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const { changed, newContent } = applyReplacements(original);
  if (!changed) return { filePath, changed: false };
  if (!DRY_RUN) {
    if (DO_BACKUP) {
      fs.writeFileSync(filePath + '.bak', original, 'utf8');
    }
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
  return { filePath, changed: true };
}

function main() {
  console.log(`[fix-encoding] Starting scan in ${TARGET_DIR}`);
  const files = gatherHtmlFiles(TARGET_DIR);
  console.log(`[fix-encoding] Found ${files.length} HTML files.`);
  const results = files.map(processFile);
  const changed = results.filter(r => r.changed);
  if (DRY_RUN) {
    console.log(`\n[DRY-RUN] Files that WOULD change (${changed.length}):`);
    changed.forEach(r => console.log('  - ' + path.relative(ROOT, r.filePath)));
    console.log('\nRun with --write to apply changes.');
  } else {
    console.log(`\n[APPLY] Modified ${changed.length} files:`);
    changed.forEach(r => console.log('  - ' + path.relative(ROOT, r.filePath)));
  }
  console.log('\n[fix-encoding] Complete.');
}

main();

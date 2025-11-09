#!/usr/bin/env node
/**
 * Replace inline emojis with semantic icon spans for future custom artwork.
 * Usage:
 *  node scripts/replace-emojis.js --dry-run
 *  node scripts/replace-emojis.js --write [--backup]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIR = path.join(ROOT, 'prototype');

// Map emoji text -> data-icon value (extended). Duplicate keys with VS16 variants are harmless.
// NOTE: Keep keys single-emoji (no surrounding spaces) so regex builder works.
const EMOJI_MAP = new Map([
  // Finance / data
  ['📈', 'chart-up'], ['📉', 'chart-down'], ['📊', 'stats'], ['💹', 'trend'], ['💰', 'money'], ['💵', 'cash'], ['💳', 'card'], ['💾', 'save'], ['📂', 'folder'], ['🗂️', 'folders'], ['📚', 'books'], ['📖', 'reading'],
  // UI / objects / status
  ['🛡️', 'shield'], ['🚀', 'rocket'], ['🔥', 'flame'], ['🔍', 'search'], ['�', 'lock'], ['�', 'unlock'], ['📝', 'note'], ['📋', 'clipboard'], ['📰', 'news'], ['💡', 'idea'], ['🔧', 'wrench'], ['⚙️', 'gear'], ['⚖️', 'balance'], ['⚠️', 'warning'], ['⚕️', 'health'], ['⚡', 'energy'], ['🧪', 'lab'], ['🛒', 'cart'], ['🔗', 'link'], ['📱', 'device'], ['📸', 'camera'], ['📧', 'email'], ['📅', 'calendar'], ['📦', 'package'], ['📄', 'document'], ['📐', 'ruler'],
  // People / social
  ['👤', 'user'], ['👥', 'users'], ['🧑‍💼', 'user-pro'], ['🤖', 'robot'], ['👑', 'crown'],
  // Awards / achievements
  ['🏆', 'trophy'], ['🥇', 'medal-gold'], ['🥈', 'medal-silver'], ['🥉', 'medal-bronze'], ['🏅', 'medal'], ['💎', 'gem'], ['�', 'score-100'], ['�', 'global'],
  // Navigation / sections / modes
  ['�', 'home'], ['🎯', 'target'], ['🧮', 'calculator'], ['🔔', 'notification'], ['�', 'compass'], ['�', 'refresh'], ['🏛️', 'government'], ['💼', 'briefcase'], ['🛠️', 'tools'], ['🧰', 'toolbox'], ['🏦', 'bank'], ['💻', 'laptop'], ['🎨', 'palette'], ['🌙', 'moon'], ['�', 'alert'], ['🚫', 'ban'], ['🏖️', 'beach'], ['🌊', 'wave'],
  // Gamification / competition
  ['🎮', 'game'], ['🎉', 'celebration'], ['😢', 'sad'], ['�', 'mailbox-empty'], ['🏃', 'runner'], ['�', 'time'], ['🦋', 'butterfly'],
  // Difficulty / status colored circles (map to generic tokens to allow styling)
  ['🟢', 'status-good'], ['�', 'status-warn'], ['🔵', 'status-info'], ['�', 'status-success'],
  // Education / learning
  ['🎓', 'graduation'], ['�', 'book-blue'], ['�', 'journal'],
  // Misc
  ['🌟', 'star'], ['🏃', 'runner'],
]);

const args = process.argv.slice(2);
const DO_WRITE = args.includes('--write');
const DRY_RUN = args.includes('--dry-run') || !DO_WRITE;
const DO_BACKUP = args.includes('--backup');
const INCLUDE_JS = args.includes('--js');
const REPORT_ONLY = args.includes('--report');

function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, r => '\\' + r);
}

// Build regex patterns: each emoji plus optional variation selector-16 (\uFE0F)
const EMOJI_REGEX_LIST = Array.from(EMOJI_MAP.keys()).map(e => ({
  emoji: e,
  key: EMOJI_MAP.get(e),
  regex: new RegExp(escapeForRegex(e) + '\\uFE0F?', 'g'),
}));

function gatherTargetFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...gatherTargetFiles(full));
    else if (entry.endsWith('.html') || (INCLUDE_JS && entry.endsWith('.js'))) out.push(full);
  }
  return out;
}

function replaceEmojis(content, stats) {
  let changed = false;
  let newContent = content;
  for (const { emoji, key, regex } of EMOJI_REGEX_LIST) {
    if (regex.test(newContent)) {
      // reset lastIndex for global regex reuse
      regex.lastIndex = 0;
      const span = `<span class="icon" data-icon="${key}"></span>`;
      const before = newContent;
      newContent = newContent.replace(regex, span);
      if (before !== newContent) {
        changed = true;
        stats.replaced[emoji] = (stats.replaced[emoji] || 0) + 1;
      }
    }
  }
  return { changed, newContent };
}

function processFile(filePath, stats) {
  const original = fs.readFileSync(filePath, 'utf8');
  const { changed, newContent } = replaceEmojis(original, stats);
  if (!changed) return { filePath, changed: false };
  if (!DRY_RUN && !REPORT_ONLY) {
    if (DO_BACKUP && !fs.existsSync(filePath + '.emoji.bak')) {
      fs.writeFileSync(filePath + '.emoji.bak', original, 'utf8');
    }
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
  return { filePath, changed };
}

function main() {
  console.log('[replace-emojis] Scanning for emojis…');
  const files = gatherTargetFiles(TARGET_DIR);
  const stats = { replaced: {} };
  const results = files.map(f => processFile(f, stats));
  const modified = results.filter(r => r.changed);

  if (REPORT_ONLY) {
    console.log(`\n[REPORT] Potential replacements across ${files.length} files:`);
  } else if (DRY_RUN) {
    console.log(`\n[DRY-RUN] ${modified.length} files would be modified:`);
  } else {
    console.log(`\n[APPLY] Modified ${modified.length} files:`);
  }
  modified.forEach(r => console.log('  - ' + path.relative(ROOT, r.filePath)));

  // Emoji frequency summary
  const entries = Object.entries(stats.replaced).sort((a,b) => b[1]-a[1]);
  if (entries.length) {
    console.log('\n[SUMMARY] Replacement counts:');
    for (const [emo, count] of entries) {
      console.log(`  ${emo} -> ${EMOJI_MAP.get(emo)} : ${count}`);
    }
  } else {
    console.log('\n[SUMMARY] No target emojis found.');
  }

  console.log(`\n[Options] --write ${DO_WRITE} | --backup ${DO_BACKUP} | --js ${INCLUDE_JS} | mode: ${REPORT_ONLY ? 'report' : (DRY_RUN ? 'dry-run' : 'apply')}`);
  console.log('\n[replace-emojis] Complete.');
}

main();

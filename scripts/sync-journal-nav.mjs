#!/usr/bin/env node
/**
 * Sync Cycle Journal nav block in mkdocs.yml from docs/journals/C-*.md files.
 *
 * Usage: node scripts/sync-journal-nav.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listJournalFiles, replaceMarkedBlock } from './lib/docs-nav.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MKDOCS = path.join(ROOT, 'mkdocs.yml');
const JOURNALS = path.join(ROOT, 'docs', 'journals');
const CHECK = process.argv.includes('--check');
const MAX_RECENT = 10;

const START = '      # docs-guard:journal-nav:start';
const END = '      # docs-guard:journal-nav:end';

const journals = listJournalFiles(JOURNALS);
const recent = journals.slice(0, MAX_RECENT);
const cycle = JSON.parse(fs.readFileSync(path.join(ROOT, 'cycle.json'), 'utf8'));
const current = cycle.current_cycle;

const navLines = recent.map((j, i) => {
  const label = j.cycle === current ? `${j.cycle} (current)` : j.cycle;
  const indent = '      ';
  return `${indent}- "${label}": ${j.file}`;
});
navLines.push('      - "C-355 and earlier": journals/archive.md');

const block = navLines.join('\n');
const mkdocs = fs.readFileSync(MKDOCS, 'utf8');

if (!mkdocs.includes(START)) {
  console.error(`❌ Missing ${START} marker in mkdocs.yml`);
  process.exit(1);
}

const updated = replaceMarkedBlock(mkdocs, START, END, `\n${block}`);

if (CHECK) {
  if (updated !== mkdocs) {
    console.error('❌ Journal nav out of sync — run npm run docs:sync-journal-nav');
    process.exit(1);
  }
  console.log('✅ Journal nav is in sync.');
  process.exit(0);
}

fs.writeFileSync(MKDOCS, updated, 'utf8');
console.log(`Synced journal nav (${recent.length} recent cycles, current ${current}).`);

#!/usr/bin/env node
/**
 * C-360 OPT-02 — README state link must use LATEST doc; LATEST cycle == cycle.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cycle = JSON.parse(fs.readFileSync(path.join(ROOT, 'cycle.json'), 'utf8'));
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const latestPath = path.join(ROOT, 'docs', 'STATE_OF_THE_SUBSTRATE_LATEST.md');
const latest = fs.readFileSync(latestPath, 'utf8');

const errors = [];
const cycleId = cycle.current_cycle;

if (!readme.includes('STATE_OF_THE_SUBSTRATE_LATEST.md')) {
  errors.push('README.md must link to docs/STATE_OF_THE_SUBSTRATE_LATEST.md');
}

if (/STATE_OF_THE_SUBSTRATE_C-\d+\.md/.test(readme)) {
  errors.push('README.md must not link to cycle-stamped STATE_OF_THE_SUBSTRATE_C-*.md files');
}

const latestCycle = latest.match(/\*\*Cycle:\*\*\s*(C-\d+)/)?.[1];
if (latestCycle !== cycleId) {
  errors.push(`STATE_OF_THE_SUBSTRATE_LATEST.md cycle (${latestCycle}) != cycle.json (${cycleId})`);
}

const stateTxt = fs.readFileSync(path.join(ROOT, 'STATE', 'CYCLE.txt'), 'utf8').trim();
if (stateTxt !== cycleId) {
  errors.push(`STATE/CYCLE.txt (${stateTxt}) != cycle.json (${cycleId})`);
}

const mkdocs = fs.readFileSync(path.join(ROOT, 'mkdocs.yml'), 'utf8');
const mkdocsCycle = mkdocs.match(/current_cycle:\s*(C-\d+)/)?.[1];
if (mkdocsCycle !== cycleId) {
  errors.push(`mkdocs.yml current_cycle (${mkdocsCycle}) != cycle.json (${cycleId})`);
}

if (errors.length) {
  console.error('❌ Cycle pointer drift:\n');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✅ Cycle pointer aligned at ${cycleId}.`);

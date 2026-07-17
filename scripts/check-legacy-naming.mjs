#!/usr/bin/env node
/**
 * C-360 OPT-04: flag legacy mobius.systems URLs in active (non-archive) paths.
 * Scoped first pass — expand SCAN_ROOTS as legacy naming is purged.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'docs/10-ARCHIVES',
  'docs/divergence/history',
  'catalog',
]);
const LEGACY_URL = /mobius\.systems/i;
const SCAN_ROOTS = [
  'README.md',
  'cycle.json',
  'STATE',
  'scripts',
  '.github/workflows',
];

function walk(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  const stat = fs.statSync(abs);
  if (stat.isFile()) return scanFile(rel, abs);
  const hits = [];
  for (const entry of fs.readdirSync(abs)) {
    if (SKIP_DIRS.has(entry)) continue;
    const child = path.join(rel, entry);
    const childAbs = path.join(ROOT, child);
    if (fs.statSync(childAbs).isDirectory()) {
      hits.push(...walk(child));
    } else {
      hits.push(...scanFile(child, childAbs));
    }
  }
  return hits;
}

function scanFile(rel, abs) {
  if (rel === 'scripts/check-legacy-naming.mjs') return [];
  if (!/\.(md|json|ya?ml|mjs|ts|js|txt)$/i.test(rel)) return [];
  const text = fs.readFileSync(abs, 'utf8');
  const lines = text.split('\n');
  const fileHits = [];
  lines.forEach((line, idx) => {
    if (LEGACY_URL.test(line)) {
      fileHits.push({ file: rel, line: idx + 1, text: line.trim().slice(0, 120) });
    }
  });
  return fileHits;
}

const violations = SCAN_ROOTS.flatMap((rel) => walk(rel));

if (violations.length) {
  console.error(`Legacy naming check failed: ${violations.length} mobius.systems hit(s)`);
  for (const v of violations.slice(0, 20)) {
    console.error(`  ${v.file}:${v.line}  ${v.text}`);
  }
  if (violations.length > 20) {
    console.error(`  ... and ${violations.length - 20} more`);
  }
  process.exit(1);
}

console.log(`Legacy naming check passed (${SCAN_ROOTS.length} roots scanned)`);

#!/usr/bin/env node
/**
 * Verifies SHA-256 hash chain integrity across journal parcels in canon/journal/.
 *
 * Exit codes: 0 = valid, 1 = invalid, 2 = missing/parse error
 *
 * EPICON: C-372 | JOURNAL_PARCEL_FLUSH_LANE
 *
 * Usage:
 *   node scripts/verify-parcel-chain.mjs
 *   node scripts/verify-parcel-chain.mjs canon/journal/
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import {
  GENESIS_PARCEL_HASH,
  compareParcelPaths,
  verifyParcelFileContent,
} from './lib/parcel-format.mjs';

const rootDir = process.argv[2] ?? 'canon/journal';

function walkParcels(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walkParcels(full, acc);
    } else if (name.endsWith('.jsonl')) {
      acc.push(full);
    }
  }
  return acc;
}

function main() {
  const absRoot = rootDir.startsWith('/') ? rootDir : join(process.cwd(), rootDir);
  if (!existsSync(absRoot)) {
    console.log(`No journal canon directory at ${absRoot} — nothing to verify (ok for genesis)`);
    process.exit(0);
  }

  const files = walkParcels(absRoot);
  if (files.length === 0) {
    console.log('No parcel .jsonl files found — genesis state (ok)');
    process.exit(0);
  }

  files.sort((a, b) => compareParcelPaths(a.replace(/\\/g, '/'), b.replace(/\\/g, '/')));

  console.log(`
Mobius Journal Parcel Chain Verifier (C-372)
  Directory: ${absRoot}
  Parcels:   ${files.length}
`);

  let prevHash = GENESIS_PARCEL_HASH;
  let failed = false;
  let totalEntries = 0;

  for (const filepath of files) {
    const relPath = filepath.replace(process.cwd() + '/', '').replace(/\\/g, '/');
    const content = readFileSync(filepath, 'utf8');
    const verdict = verifyParcelFileContent(content);
    if (!verdict.ok) {
      console.error(`✗ ${relPath}: ${verdict.error}`);
      failed = true;
      continue;
    }

    if (verdict.prevParcelHash !== prevHash) {
      console.error(`✗ ${relPath}: prev_parcel_hash chain break`);
      console.error(`    expected: ${prevHash}`);
      console.error(`    got:      ${verdict.prevParcelHash}`);
      failed = true;
      continue;
    }

    console.log(
      `✓ ${relPath} entries=${verdict.entryCount} seal=${verdict.sealId} hash=${verdict.parcelHash?.slice(0, 16)}...`,
    );

    prevHash = verdict.parcelHash ?? prevHash;
    totalEntries += verdict.entryCount ?? 0;
  }

  if (failed) {
    console.error('\n✗ Journal parcel chain INVALID');
    process.exit(1);
  }

  console.log(`\n✓ Journal parcel chain VALID (${files.length} parcels, ${totalEntries} entries)`);
  console.log(`  Chain tip: ${prevHash}`);
  process.exit(0);
}

main();

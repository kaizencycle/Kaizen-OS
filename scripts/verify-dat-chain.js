#!/usr/bin/env node
/**
 * Verifies SHA-256 hash chain integrity across .dat files in canon/reserve-blocks/.
 * EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';

const dir = process.argv[2] ?? 'canon/reserve-blocks';
const GENESIS_HASH = '0'.repeat(64);

const manifestPath = join(dir, 'MANIFEST.json');
if (!existsSync(manifestPath)) {
  console.error(`✗ MANIFEST.json not found at ${manifestPath}`);
  process.exit(2);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (e) {
  console.error(`✗ Failed to parse MANIFEST.json: ${e.message}`);
  process.exit(2);
}

console.log(`
Mobius .dat Chain Integrity Verifier (C-357)
  Directory: ${dir}
  Blocks:    ${manifest.total_blocks} | MIC: ${manifest.total_mic}
`);

let prevHash = GENESIS_HASH;
let globalBlockCount = 0;
let failed = false;

const datFiles = Object.keys(manifest.files).sort();

for (const filename of datFiles) {
  const entry = manifest.files[filename];
  const filepath = join(dir, filename);

  if (!existsSync(filepath)) {
    console.error(`✗ Missing file: ${filename}`);
    failed = true;
    continue;
  }

  const content = readFileSync(filepath, 'utf8');
  const actualFileHash = `sha256:${createHash('sha256').update(content).digest('hex')}`;

  if (actualFileHash !== entry.sha256) {
    console.error(`✗ ${filename}: file hash mismatch`);
    failed = true;
    continue;
  }

  const lines = content.split('\n').filter((l) => l.trim());
  if (lines.length !== entry.block_count) {
    console.error(`✗ ${filename}: expected ${entry.block_count} records, found ${lines.length}`);
    failed = true;
    continue;
  }

  let fileValid = true;
  for (const line of lines) {
    const r = JSON.parse(line);

    if (r.prev_hash !== prevHash) {
      console.error(`✗ ${filename} block ${r.block_number}: prev_hash mismatch`);
      fileValid = false;
      failed = true;
      break;
    }

    const partial = { ...r };
    delete partial.block_hash;
    const expected = `sha256:${createHash('sha256')
      .update(JSON.stringify(partial) + prevHash)
      .digest('hex')}`;

    if (r.block_hash !== expected) {
      console.error(`✗ ${filename} block ${r.block_number}: block_hash mismatch`);
      fileValid = false;
      failed = true;
      break;
    }

    prevHash = r.block_hash;
    globalBlockCount++;
  }

  if (fileValid) {
    console.log(`  ✓ ${filename}  blocks ${entry.range[0]}–${entry.range[1]}  (${entry.block_count} records)`);
  }
}

if (!failed) {
  if (prevHash !== manifest.chain_tip_hash) {
    console.error('✗ Chain tip mismatch');
    failed = true;
  }
  if (globalBlockCount !== manifest.total_blocks) {
    console.error(`✗ Block count mismatch: ${manifest.total_blocks} vs ${globalBlockCount}`);
    failed = true;
  }
}

if (failed) {
  console.error('\n✗ CHAIN INVALID — do not commit to Substrate\n');
  process.exit(1);
}

console.log(`
  Chain tip:       ${prevHash.slice(0, 20)}... ✓
  Blocks verified: ${globalBlockCount}/${manifest.total_blocks}

✓ CHAIN VALID — safe to commit to Mobius-Substrate
`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `file_count=${datFiles.length}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `total_blocks=${globalBlockCount}\n`);
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `manifest_hash=sha256:${createHash('sha256').update(readFileSync(manifestPath, 'utf8')).digest('hex')}\n`,
  );
  appendFileSync(process.env.GITHUB_OUTPUT, `chain_tip=${prevHash}\n`);
}

process.exit(0);

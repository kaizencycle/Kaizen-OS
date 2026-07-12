#!/usr/bin/env node
import { writeFileSync } from 'node:fs';

import { generateShard } from '../dist/generate.js';

function parseArgs(argv) {
  let cycle = 'C-368';
  let out;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--cycle' && argv[index + 1]) {
      cycle = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--out' && argv[index + 1]) {
      out = argv[index + 1];
      index += 1;
    }
  }

  return { cycle, out };
}

async function main() {
  const { cycle, out } = parseArgs(process.argv.slice(2));
  const shard = generateShard({ cycle });
  const json = `${JSON.stringify(shard, null, 2)}\n`;

  if (out) {
    writeFileSync(out, json, 'utf8');
    return;
  }

  process.stdout.write(json);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

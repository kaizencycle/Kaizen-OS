#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { generateCycleJournalIndex } from './journals/query';

const cycle = process.argv[2];
if (!cycle || !/^C-\d{1,4}$/.test(cycle)) {
  console.error('Usage: tsx scripts/generate-cycle-journal-index.ts C-289');
  process.exit(1);
}

const index = generateCycleJournalIndex(cycle as `C-${number}`);
const outputDir = path.join(process.cwd(), 'cycles', cycle);
const outputPath = path.join(outputDir, 'journals-index.json');

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(index, null, 2)}\n`, 'utf-8');
console.log(`Generated ${path.relative(process.cwd(), outputPath)} (${index.entries.length} entries)`);

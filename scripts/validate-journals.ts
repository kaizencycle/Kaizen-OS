#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { CORE_AGENTS, isCanonicalJournalFilename, validateJournalEntry } from './journals/journal-contract';

const root = process.cwd();
const issues: string[] = [];

for (const agent of CORE_AGENTS) {
  const agentDir = path.join(root, 'journals', agent);
  if (!fs.existsSync(agentDir)) {
    issues.push(`Missing required agent folder: journals/${agent}/`);
    continue;
  }

  const files = fs.readdirSync(agentDir).filter((f) => f.endsWith('.json'));
  for (const fileName of files) {
    if (!isCanonicalJournalFilename(fileName)) {
      issues.push(`Non-canonical file name: journals/${agent}/${fileName}`);
      continue;
    }

    const filePath = path.join(agentDir, fileName);
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const result = validateJournalEntry(parsed);
    if (!result.valid) {
      const prettyErrors = result.errors.map((error) => `${error.instancePath || '/'} ${error.message}`).join('; ');
      issues.push(`Schema validation failed: journals/${agent}/${fileName} -> ${prettyErrors}`);
    }
  }
}

if (issues.length > 0) {
  console.error('Journal validation failed:\n');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log('✅ Journals passed naming + schema validation.');

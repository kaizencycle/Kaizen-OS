#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  getCoreAgents,
  isCanonicalJournalFilename,
  listJournalsByAgent,
  validateJournalEntry
} from "./lib/journal-contract.mjs";

const ROOT = process.cwd();
let invalid = 0;
let checked = 0;

for (const agent of getCoreAgents()) {
  const entries = listJournalsByAgent(ROOT, agent);
  for (const entry of entries) {
    checked += 1;
    const filename = path.basename(entry.path);

    if (!isCanonicalJournalFilename(filename)) {
      invalid += 1;
      console.error(`[invalid-filename] ${entry.path}`);
    }

    const validation = validateJournalEntry(entry.data);
    if (!validation.ok) {
      invalid += 1;
      console.error(`[invalid-schema] ${entry.path}`);
      for (const error of validation.errors) {
        console.error(`  - ${error.instancePath || "/"} ${error.message}`);
      }
    }
  }
}

if (checked === 0) {
  console.log("No journal entries found under journals/{agent}/.");
  process.exit(0);
}

if (invalid > 0) {
  console.error(`Validation failed: ${invalid} issue(s) across ${checked} file(s).`);
  process.exit(1);
}

console.log(`All ${checked} journal files passed canonical naming and schema validation.`);

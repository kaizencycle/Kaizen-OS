#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { getCoreAgents, isCanonicalJournalFilename, normalizeJournalFilename } from "./lib/journal-contract.mjs";

const ROOT = process.cwd();
let renamed = 0;
let skipped = 0;

for (const agent of getCoreAgents()) {
  const dir = path.join(ROOT, "journals", agent);
  if (!fs.existsSync(dir)) continue;

  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith("-journal.json")) continue;
    if (isCanonicalJournalFilename(name)) continue;

    const normalized = normalizeJournalFilename(name);
    if (!normalized) {
      skipped += 1;
      console.warn(`Skipping non-normalizable filename: journals/${agent}/${name}`);
      continue;
    }

    const src = path.join(dir, name);
    const dst = path.join(dir, normalized);
    if (fs.existsSync(dst)) {
      skipped += 1;
      console.warn(`Skipping rename due to existing target: journals/${agent}/${name} -> journals/${agent}/${normalized}`);
      continue;
    }

    fs.renameSync(src, dst);
    renamed += 1;
    console.log(`Renamed: journals/${agent}/${name} -> journals/${agent}/${normalized}`);
  }
}

console.log(`Done. renamed=${renamed} skipped=${skipped}`);
if (skipped > 0) {
  process.exitCode = 2;
}

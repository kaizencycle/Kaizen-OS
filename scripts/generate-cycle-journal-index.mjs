#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  getCoreAgents,
  isCanonicalJournalFilename,
  listJournalsByCycle,
  normalizeJournalFilename,
  validateJournalEntry
} from "./lib/journal-contract.mjs";

const ROOT = process.cwd();
const cycle = process.argv[2];

if (!cycle || !/^C-\d+$/.test(cycle)) {
  console.error("Usage: node scripts/generate-cycle-journal-index.mjs C-289");
  process.exit(1);
}

for (const agent of getCoreAgents()) {
  fs.mkdirSync(path.join(ROOT, "journals", agent), { recursive: true });
}

const cycleDir = path.join(ROOT, "cycles", cycle);
fs.mkdirSync(cycleDir, { recursive: true });

const journals = listJournalsByCycle(ROOT, cycle);
const entries = [];
const warnings = [];

for (const item of journals) {
  const base = path.basename(item.path);
  const validation = validateJournalEntry(item.data);
  if (!validation.ok) {
    warnings.push(`Skipping invalid schema: ${item.path}`);
    continue;
  }

  if (!isCanonicalJournalFilename(base)) {
    const normalized = normalizeJournalFilename(base);
    if (normalized) {
      warnings.push(`Non-canonical name detected (normalizable): ${base} -> ${normalized}`);
    } else {
      warnings.push(`Skipping non-canonical name: ${base}`);
      continue;
    }
  }

  entries.push({
    agent: String(item.data.agent || "").toUpperCase(),
    timestamp: item.data.timestamp,
    severity: item.data.severity,
    path: item.path.replace(/\\/g, "/")
  });
}

entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

const out = {
  cycle,
  generated_at: new Date().toISOString(),
  entry_count: entries.length,
  entries
};

fs.writeFileSync(path.join(cycleDir, "journals-index.json"), `${JSON.stringify(out, null, 2)}\n`);

for (const filename of ["summary.json", "integrity.json", "timeline.json"]) {
  const outPath = path.join(cycleDir, filename);
  if (!fs.existsSync(outPath)) {
    fs.writeFileSync(outPath, `${JSON.stringify({ cycle, status: "scaffold", updated_at: new Date().toISOString() }, null, 2)}\n`);
  }
}

if (warnings.length > 0) {
  console.warn("Warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

console.log(`Generated cycles/${cycle}/journals-index.json (${entries.length} entries)`);

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  listJournalsByAgent,
  listJournalsByCycle,
  listMostRecentJournalPerAgent,
  resolveCanonicalPathFromIndex
} from "../../scripts/lib/journal-contract.mjs";

function mkTempRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mobius-journals-"));
  fs.mkdirSync(path.join(root, "journals", "zeus"), { recursive: true });
  fs.mkdirSync(path.join(root, "journals", "atlas"), { recursive: true });
  fs.mkdirSync(path.join(root, "cycles"), { recursive: true });
  return root;
}

function writeEntry(root, agent, filename, overrides = {}) {
  const base = {
    id: `journal-${agent}-1`,
    agent: agent.toUpperCase(),
    agentOrigin: agent.toUpperCase(),
    cycle: "C-289",
    scope: "Verification",
    category: "observation",
    severity: "nominal",
    observation: "obs",
    inference: "inf",
    recommendation: "rec",
    confidence: 0.8,
    derivedFrom: ["signals/micro"],
    source: "agent-journal",
    tags: [agent, "C-289"],
    timestamp: "2026-04-20T09:00:00Z",
    ...overrides
  };
  fs.writeFileSync(path.join(root, "journals", agent, filename), JSON.stringify(base, null, 2));
}

test("list helpers return newest-first ordering", () => {
  const root = mkTempRepo();

  writeEntry(root, "zeus", "2026-04-20T09-00-00Z-journal.json", {
    id: "journal-zeus-old",
    timestamp: "2026-04-20T09:00:00Z"
  });
  writeEntry(root, "zeus", "2026-04-21T09-00-00Z-journal.json", {
    id: "journal-zeus-new",
    timestamp: "2026-04-21T09:00:00Z"
  });
  writeEntry(root, "atlas", "2026-04-19T09-00-00Z-journal.json", {
    id: "journal-atlas",
    timestamp: "2026-04-19T09:00:00Z"
  });

  const byAgent = listJournalsByAgent(root, "zeus");
  assert.equal(byAgent[0].data.id, "journal-zeus-new");
  assert.equal(byAgent[1].data.id, "journal-zeus-old");

  const byCycle = listJournalsByCycle(root, "C-289");
  assert.equal(byCycle[0].data.id, "journal-zeus-new");
  assert.equal(byCycle[1].data.id, "journal-zeus-old");
  assert.equal(byCycle[2].data.id, "journal-atlas");

  const recent = listMostRecentJournalPerAgent(root);
  const zeus = recent.find((entry) => entry.data.agent === "ZEUS");
  assert.equal(zeus.data.id, "journal-zeus-new");
});

test("cycle index generator creates journals-index and supports canonical path resolution", () => {
  const root = mkTempRepo();
  writeEntry(root, "zeus", "2026-04-22T09-00-00Z-journal.json", {
    id: "journal-zeus-index",
    timestamp: "2026-04-22T09:00:00Z"
  });

  execFileSync("node", [path.join(process.cwd(), "scripts", "generate-cycle-journal-index.mjs"), "C-289"], {
    cwd: root,
    stdio: "pipe"
  });

  const indexPath = path.join(root, "cycles", "C-289", "journals-index.json");
  assert.equal(fs.existsSync(indexPath), true);

  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  assert.equal(index.cycle, "C-289");
  assert.equal(index.entry_count, 1);
  assert.equal(index.entries[0].path, "journals/zeus/2026-04-22T09-00-00Z-journal.json");

  const resolved = resolveCanonicalPathFromIndex(root, "C-289", "ZEUS", "2026-04-22T09:00:00Z");
  assert.equal(resolved, "journals/zeus/2026-04-22T09-00-00Z-journal.json");
});

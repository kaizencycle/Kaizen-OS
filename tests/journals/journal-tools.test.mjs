import test from "node:test";
import assert from "node:assert/strict";
import {
  isCanonicalJournalFilename,
  normalizeJournalFilename,
  validateJournalEntry
} from "../../scripts/lib/journal-contract.mjs";

test("accepts canonical filename format", () => {
  assert.equal(isCanonicalJournalFilename("2026-04-20T09-00-00Z-journal.json"), true);
});

test("rejects non-canonical filename format", () => {
  assert.equal(isCanonicalJournalFilename("2026-04-20T09-00-00-123Z-journal.json"), false);
});

test("normalizes legacy timestamped filename", () => {
  assert.equal(
    normalizeJournalFilename("2026-04-20T09-00-00-123Z-journal.json"),
    "2026-04-20T09-00-00Z-journal.json"
  );
});

test("accepts a valid journal schema", () => {
  const valid = {
    id: "journal-zeus-1713603600",
    agent: "ZEUS",
    agentOrigin: "ZEUS",
    cycle: "C-289",
    scope: "Verification",
    category: "observation",
    severity: "nominal",
    observation: "Observed stable lane.",
    inference: "No conflict in sources.",
    recommendation: "Continue monitoring.",
    confidence: 0.88,
    derivedFrom: ["signals/micro"],
    source: "agent-journal",
    tags: ["zeus", "C-289"],
    timestamp: "2026-04-20T09:00:00Z"
  };

  assert.equal(validateJournalEntry(valid).ok, true);
});

test("rejects invalid journal schema", () => {
  const invalid = {
    agent: "ZEUS",
    cycle: "invalid"
  };

  assert.equal(validateJournalEntry(invalid).ok, false);
});

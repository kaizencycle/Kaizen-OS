import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.join(path.dirname(new URL(import.meta.url).pathname), "..", ".."));
const SCHEMA_PATH = path.join(ROOT, "specs", "journals", "journal-entry.schema.json");
const CANONICAL_FILENAME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z-journal\.json$/;
const LEGACY_FILENAME_RE = /^(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})(?:-\d{3})?Z-journal\.json$/;
const CORE_AGENTS = ["atlas", "zeus", "hermes", "echo", "aurea", "jade", "eve", "daedalus"];

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

export function validateJournalEntry(entry) {
  const ok = validate(entry);
  return {
    ok: Boolean(ok),
    errors: validate.errors ?? []
  };
}

export function isCanonicalJournalFilename(filename) {
  return CANONICAL_FILENAME_RE.test(filename);
}

export function normalizeJournalFilename(filename) {
  const match = filename.match(LEGACY_FILENAME_RE);
  if (!match) {
    return null;
  }
  return `${match[1]}Z-journal.json`;
}

export function isoToCanonicalFilename(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${timestamp}`);
  }
  return date.toISOString().replace(/:/g, "-").replace(/\.\d{3}Z$/, "Z-journal.json");
}

function safeReadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listAgentFiles(rootDir, agent) {
  const dir = path.join(rootDir, "journals", agent.toLowerCase());
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith("-journal.json"))
    .map((name) => path.join(dir, name));
}

export function listJournalsByAgent(rootDir, agent) {
  const files = listAgentFiles(rootDir, agent);
  const entries = [];
  for (const file of files) {
    try {
      const data = safeReadJson(file);
      entries.push({ path: path.relative(rootDir, file), data });
    } catch {
      // Skip unreadable files; handled by validation command.
    }
  }
  return entries.sort((a, b) => new Date(b.data.timestamp).getTime() - new Date(a.data.timestamp).getTime());
}

export function listJournalsByCycle(rootDir, cycle) {
  const entries = [];
  for (const agent of CORE_AGENTS) {
    for (const item of listJournalsByAgent(rootDir, agent)) {
      if (item.data.cycle === cycle) {
        entries.push(item);
      }
    }
  }
  return entries.sort((a, b) => new Date(b.data.timestamp).getTime() - new Date(a.data.timestamp).getTime());
}

export function listMostRecentJournalPerAgent(rootDir) {
  const out = [];
  for (const agent of CORE_AGENTS) {
    const entries = listJournalsByAgent(rootDir, agent);
    if (entries.length > 0) {
      out.push(entries[0]);
    }
  }
  return out.sort((a, b) => new Date(b.data.timestamp).getTime() - new Date(a.data.timestamp).getTime());
}

export function resolveCanonicalPathFromIndex(rootDir, cycle, agent, timestamp) {
  const indexPath = path.join(rootDir, "cycles", cycle, "journals-index.json");
  if (!fs.existsSync(indexPath)) {
    return null;
  }
  const index = safeReadJson(indexPath);
  const found = (index.entries || []).find((entry) => entry.agent === agent && entry.timestamp === timestamp);
  return found?.path ?? null;
}

export function getCoreAgents() {
  return [...CORE_AGENTS];
}

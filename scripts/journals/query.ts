import fs from 'node:fs';
import path from 'node:path';
import {
  CORE_AGENTS,
  type CoreAgent,
  type CycleJournalIndex,
  type JournalEntry,
  type JournalIndexEntry,
  isCanonicalJournalFilename,
  validateJournalEntry,
} from './journal-contract';

export interface JournalRecord {
  path: string;
  fileName: string;
  entry: JournalEntry;
}

function sortNewestFirst<T extends { timestamp: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function listJournalsByAgent(agent: CoreAgent, rootDir = process.cwd()): JournalRecord[] {
  const agentDir = path.join(rootDir, 'journals', agent);
  if (!fs.existsSync(agentDir)) return [];

  const files = fs
    .readdirSync(agentDir)
    .filter((fileName) => fileName.endsWith('-journal.json'))
    .filter((fileName) => isCanonicalJournalFilename(fileName));

  const records = files
    .map((fileName) => {
      const filePath = path.join(agentDir, fileName);
      const parsed = readJson(filePath);
      const result = validateJournalEntry(parsed);
      if (!result.valid) {
        return null;
      }

      return {
        path: path.relative(rootDir, filePath).replaceAll('\\\\', '/'),
        fileName,
        entry: parsed as JournalEntry,
      };
    })
    .filter((record): record is JournalRecord => Boolean(record));

  return sortNewestFirst(records.map((r) => ({ ...r, timestamp: r.entry.timestamp }))).map(({ timestamp: _, ...rest }) => rest);
}

export function listJournalsByCycle(cycle: `C-${number}`, rootDir = process.cwd()): JournalRecord[] {
  const all = CORE_AGENTS.flatMap((agent) => listJournalsByAgent(agent, rootDir));
  return sortNewestFirst(all.filter((record) => record.entry.cycle === cycle).map((r) => ({ ...r, timestamp: r.entry.timestamp }))).map(
    ({ timestamp: _, ...rest }) => rest,
  );
}

export function getMostRecentJournalPerAgent(rootDir = process.cwd()): Partial<Record<CoreAgent, JournalRecord>> {
  const result: Partial<Record<CoreAgent, JournalRecord>> = {};
  for (const agent of CORE_AGENTS) {
    const entries = listJournalsByAgent(agent, rootDir);
    if (entries.length > 0) {
      result[agent] = entries[0];
    }
  }
  return result;
}

export function generateCycleJournalIndex(cycle: `C-${number}`, rootDir = process.cwd()): CycleJournalIndex {
  const entries: JournalIndexEntry[] = listJournalsByCycle(cycle, rootDir).map(({ entry, path: canonicalPath }) => ({
    agent: entry.agent,
    timestamp: entry.timestamp,
    severity: entry.severity,
    path: canonicalPath,
  }));

  return {
    cycle,
    generatedAt: new Date().toISOString(),
    entries,
  };
}

export function resolveCanonicalPathFromIndex(
  cycle: `C-${number}`,
  agent: JournalEntry['agent'],
  timestamp: string,
  rootDir = process.cwd(),
): string | null {
  const indexPath = path.join(rootDir, 'cycles', cycle, 'journals-index.json');
  if (!fs.existsSync(indexPath)) return null;

  const index = readJson(indexPath) as CycleJournalIndex;
  const match = index.entries.find((entry) => entry.agent === agent && entry.timestamp === timestamp);
  return match?.path ?? null;
}

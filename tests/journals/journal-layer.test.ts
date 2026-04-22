import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  isCanonicalJournalFilename,
  toCanonicalJournalFilename,
  validateJournalEntry,
} from '../../scripts/journals/journal-contract';
import { generateCycleJournalIndex, listJournalsByAgent } from '../../scripts/journals/query';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

function mkTmp(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'journal-layer-'));
  tempDirs.push(dir);
  return dir;
}

function writeJournal(root: string, agent: string, fileName: string, content: object) {
  const dir = path.join(root, 'journals', agent);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, fileName), `${JSON.stringify(content, null, 2)}\n`, 'utf-8');
}

describe('journal contract validation', () => {
  it('accepts valid canonical journal entry', () => {
    const entry = {
      id: 'journal-zeus-1713603600',
      agent: 'ZEUS',
      agentOrigin: 'ZEUS',
      cycle: 'C-289',
      scope: 'Verification and contested claims',
      category: 'observation',
      severity: 'nominal',
      observation: 'obs',
      inference: 'inf',
      recommendation: 'rec',
      confidence: 0.88,
      derivedFrom: ['signals/micro', 'integrity-status'],
      source: 'agent-journal',
      tags: ['zeus', 'verification', 'C-289'],
      timestamp: '2026-04-20T09:00:00Z',
    };

    const result = validateJournalEntry(entry);
    expect(result.valid).toBe(true);
  });

  it('rejects invalid journal entry', () => {
    const bad = {
      id: 'bad',
      agent: 'ZEUS',
      cycle: 'C-289',
      confidence: 1.5,
    };

    const result = validateJournalEntry(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('canonical journal naming', () => {
  it('enforces canonical filename pattern', () => {
    expect(isCanonicalJournalFilename('2026-04-20T09-00-00Z-journal.json')).toBe(true);
    expect(isCanonicalJournalFilename('2026-04-20T09-00-00-100Z-journal.json')).toBe(false);
  });

  it('normalizes timestamps to canonical filename', () => {
    expect(toCanonicalJournalFilename('2026-04-20T09:00:00.999Z')).toBe('2026-04-20T09-00-00Z-journal.json');
  });
});

describe('journal query and indexing', () => {
  it('returns newest-first ordering and generates cycle index', () => {
    const root = mkTmp();

    const older = {
      id: 'journal-zeus-old',
      agent: 'ZEUS',
      agentOrigin: 'ZEUS',
      cycle: 'C-289',
      scope: 'scope',
      category: 'observation',
      severity: 'watch',
      observation: 'old',
      inference: 'old',
      recommendation: 'old',
      confidence: 0.7,
      derivedFrom: ['signals/micro'],
      source: 'agent-journal',
      tags: ['zeus', 'C-289'],
      timestamp: '2026-04-20T09:00:00Z',
    };

    const newer = {
      ...older,
      id: 'journal-zeus-new',
      severity: 'elevated',
      timestamp: '2026-04-21T09:00:00Z',
    };

    writeJournal(root, 'zeus', '2026-04-20T09-00-00Z-journal.json', older);
    writeJournal(root, 'zeus', '2026-04-21T09-00-00Z-journal.json', newer);

    const list = listJournalsByAgent('zeus', root);
    expect(list).toHaveLength(2);
    expect(list[0].entry.id).toBe('journal-zeus-new');
    expect(list[1].entry.id).toBe('journal-zeus-old');

    const index = generateCycleJournalIndex('C-289', root);
    expect(index.entries).toHaveLength(2);
    expect(index.entries[0].path).toBe('journals/zeus/2026-04-21T09-00-00Z-journal.json');
  });
});

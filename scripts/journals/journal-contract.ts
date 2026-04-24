import fs from 'node:fs';
import path from 'node:path';
import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

export const CORE_AGENTS = [
  'atlas',
  'zeus',
  'hermes',
  'echo',
  'aurea',
  'jade',
  'eve',
  'daedalus',
] as const;

export type CoreAgent = (typeof CORE_AGENTS)[number];

export type JournalSeverity = 'nominal' | 'watch' | 'elevated' | 'critical';

export interface JournalEntry {
  id: string;
  agent: 'ATLAS' | 'ZEUS' | 'HERMES' | 'ECHO' | 'AUREA' | 'JADE' | 'EVE' | 'DAEDALUS';
  agentOrigin: JournalEntry['agent'];
  cycle: `C-${number}`;
  scope: string;
  category: string;
  severity: JournalSeverity;
  observation: string;
  inference: string;
  recommendation: string;
  confidence: number;
  derivedFrom: string[];
  source: 'agent-journal';
  tags: string[];
  timestamp: string;
  gi_at_time?: number;
  status?: string;
  verification_status?: string;
  tripwire_context?: string[];
  canonical_path?: string;
  commit_sha?: string;
}

export interface JournalIndexEntry {
  agent: JournalEntry['agent'];
  timestamp: string;
  severity: JournalSeverity;
  path: string;
}

export interface CycleJournalIndex {
  cycle: `C-${number}`;
  generatedAt: string;
  entries: JournalIndexEntry[];
}

const ROOT = process.cwd();
const SCHEMA_PATH = path.join(ROOT, 'specs', 'journals', 'journal-entry.schema.json');

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile<JournalEntry>(schema);

export const CANONICAL_JOURNAL_FILENAME = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z-journal\.json$/;

export function isCanonicalJournalFilename(fileName: string): boolean {
  return CANONICAL_JOURNAL_FILENAME.test(fileName);
}

export function toCanonicalJournalFilename(input: Date | string): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date input for canonical filename: ${String(input)}`);
  }

  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}-${mi}-${ss}Z-journal.json`;
}

export function validateJournalEntry(entry: unknown): {
  valid: boolean;
  errors: ErrorObject[];
} {
  const valid = Boolean(validate(entry));
  return { valid, errors: validate.errors ?? [] };
}

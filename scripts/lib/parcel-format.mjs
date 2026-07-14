/**
 * C-372 journal parcel JSONL format — zero runtime dependencies.
 * Shared by flush-parcel.mjs, verify-parcel-chain.mjs, and contract tests.
 */

import { createHash } from 'crypto';

export const PARCEL_SCHEMA = 'mobius-journal-parcel/1';
export const GENESIS_PARCEL_HASH = '0'.repeat(64);

/**
 * Canonical JSON: sorted object keys, arrays preserve order, omit undefined.
 */
export function canonicalStringify(value) {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value) {
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('parcel-format: non-finite number encountered');
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const out = {};
    for (const key of keys) {
      const v = value[key];
      if (v === undefined) continue;
      out[key] = canonicalize(v);
    }
    return out;
  }
  throw new Error(`parcel-format: unsupported type "${typeof value}"`);
}

/** Map journal entry to parcel line object (witness_confidence, no per-entry gi). */
export function parcelEntryObject(entry) {
  const raw = { ...entry };
  delete raw.gi;
  delete raw.confidence;
  if (typeof entry.confidence === 'number') {
    raw.witness_confidence = entry.confidence;
  } else if (typeof entry.witness_confidence === 'number') {
    raw.witness_confidence = entry.witness_confidence;
  }
  delete raw.source_mode;
  delete raw.canonical_path;
  return canonicalize(raw);
}

export function parcelEntryLine(entry) {
  return canonicalStringify(parcelEntryObject(entry));
}

/**
 * Build attestation summary for parcel header from seal attestations record.
 */
export function buildAttestationVerdicts(attestations) {
  if (!attestations || typeof attestations !== 'object') return undefined;
  const out = {};
  for (const [agent, att] of Object.entries(attestations)) {
    if (!att || typeof att !== 'object') continue;
    const verdict = att.verdict;
    const rationale = att.rationale;
    if (typeof verdict !== 'string') continue;
    out[agent] = {
      verdict,
      rationale: typeof rationale === 'string' ? rationale : '',
    };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * @param {object} input
 * @param {string} input.cycle
 * @param {string} input.seal_id
 * @param {string} input.seal_hash
 * @param {number} input.gi_at_seal
 * @param {number} input.entry_count
 * @param {string} input.prev_parcel_hash
 * @param {string} input.created_at
 * @param {Record<string, { verdict: string, rationale: string }>|undefined} [input.attestations]
 * @param {unknown[]} input.entries
 */
export function buildParcelFile(input) {
  const header = {
    schema: PARCEL_SCHEMA,
    cycle: input.cycle,
    seal_id: input.seal_id,
    seal_hash: input.seal_hash,
    gi_at_seal: input.gi_at_seal,
    entry_count: input.entry_count,
    prev_parcel_hash: input.prev_parcel_hash,
    created_at: input.created_at,
  };
  const verdicts = buildAttestationVerdicts(input.attestations);
  if (verdicts) header.attestations = verdicts;

  const headerLine = canonicalStringify(header);
  const entryLines = input.entries.map((e) => parcelEntryLine(e));

  if (entryLines.length !== input.entry_count) {
    throw new Error(
      `parcel-format: entry_count mismatch (expected ${input.entry_count}, got ${entryLines.length})`,
    );
  }

  const bodyLines = [headerLine, ...entryLines];
  const bodyText = bodyLines.join('\n');
  const parcelHash = createHash('sha256').update(bodyText, 'utf8').digest('hex');
  const footerLine = canonicalStringify({ parcel_hash: parcelHash });
  const fileText = `${bodyText}\n${footerLine}\n`;

  return {
    headerLine,
    entryLines,
    footerLine,
    bodyText,
    parcelHash,
    fileText,
    header,
  };
}

/**
 * Parse a parcel JSONL file and verify internal hash.
 * @returns {{ ok: boolean, error?: string, header?: object, parcelHash?: string, entryCount?: number, prevParcelHash?: string, sealHash?: string, sealId?: string }}
 */
export function verifyParcelFileContent(content) {
  const trimmed = content.trimEnd();
  if (!trimmed) return { ok: false, error: 'empty parcel file' };

  const lines = trimmed.split('\n');
  if (lines.length < 2) return { ok: false, error: 'parcel must have header + footer at minimum' };

  const footerLine = lines[lines.length - 1];
  const bodyLines = lines.slice(0, -1);

  let footer;
  try {
    footer = JSON.parse(footerLine);
  } catch {
    return { ok: false, error: 'invalid footer JSON' };
  }

  if (!footer || typeof footer.parcel_hash !== 'string' || footer.parcel_hash.length !== 64) {
    return { ok: false, error: 'footer missing parcel_hash' };
  }

  const bodyText = bodyLines.join('\n');
  const expected = createHash('sha256').update(bodyText, 'utf8').digest('hex');
  if (expected !== footer.parcel_hash) {
    return {
      ok: false,
      error: `parcel_hash mismatch (expected ${expected}, got ${footer.parcel_hash})`,
    };
  }

  let header;
  try {
    header = JSON.parse(bodyLines[0]);
  } catch {
    return { ok: false, error: 'invalid header JSON' };
  }

  const entryCount = bodyLines.length - 1;
  if (typeof header.entry_count === 'number' && header.entry_count !== entryCount) {
    return {
      ok: false,
      error: `header entry_count ${header.entry_count} != actual ${entryCount}`,
    };
  }

  return {
    ok: true,
    header,
    parcelHash: footer.parcel_hash,
    entryCount,
    prevParcelHash: header.prev_parcel_hash,
    sealHash: header.seal_hash,
    sealId: header.seal_id,
  };
}

/**
 * Compare cycle/parcel path ordering: C-372/parcel-003.jsonl
 */
export function compareParcelPaths(a, b) {
  const parse = (p) => {
    const cycleMatch = p.match(/C-(\d+)/);
    const parcelMatch = p.match(/parcel-(\d+)\.jsonl$/);
    return {
      cycle: cycleMatch ? Number(cycleMatch[1]) : 0,
      seq: parcelMatch ? Number(parcelMatch[1]) : 0,
      raw: p,
    };
  };
  const pa = parse(a);
  const pb = parse(b);
  if (pa.cycle !== pb.cycle) return pa.cycle - pb.cycle;
  if (pa.seq !== pb.seq) return pa.seq - pb.seq;
  return pa.raw.localeCompare(pb.raw);
}

export function formatParcelPath(cycle, sequence) {
  const seq = String(sequence).padStart(3, '0');
  return `canon/journal/${cycle}/parcel-${seq}.jsonl`;
}

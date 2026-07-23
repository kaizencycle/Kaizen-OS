/**
 * EPICON-02 invariant I7 — Witness Table structural enforcement.
 * Doctrine: docs/WITNESS_PROTOCOL.md (C-373)
 *
 * Literal format only — no semantic inference from prose.
 */

export const WITNESS_HEADER = '## Witness Table';
export const ALLOWED_VERDICTS = new Set(['VERIFIED', 'DISPUTED', 'STALE', 'FAIL_CLOSED']);

/**
 * @param {string} body
 * @returns {string | null}
 */
export function extractTableAfterHeader(body) {
  const headerRe = /^## Witness Table\s*$/m;
  const match = headerRe.exec(body);
  if (!match) return null;

  const after = body.slice(match.index + match[0].length);
  const tableLines = [];
  let started = false;

  for (const line of after.split('\n')) {
    const trimmed = line.trim();
    if (!started && trimmed.startsWith('|')) {
      started = true;
    }
    if (started) {
      if (!trimmed.startsWith('|')) break;
      tableLines.push(trimmed);
    }
  }

  return tableLines.length > 0 ? tableLines.join('\n') : null;
}

/**
 * @param {string} line
 * @returns {string[]}
 */
function parseRow(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
}

/**
 * @param {string} block
 * @returns {{ header: string[], data: Record<string, string>[] } | null}
 */
export function parseMarkdownTable(block) {
  const lines = block.split('\n').filter((l) => l.trim().startsWith('|'));
  if (lines.length < 2) return null;

  const header = parseRow(lines[0]);
  let dataStart = 1;
  if (lines[1] && /^\|[\s:|\-]+\|$/.test(lines[1].trim())) {
    dataStart = 2;
  }

  const data = [];
  for (let i = dataStart; i < lines.length; i++) {
    const cells = parseRow(lines[i]);
    if (cells.every((c) => !c)) continue;
    /** @type {Record<string, string>} */
    const row = {};
    header.forEach((h, idx) => {
      row[h.trim().toLowerCase()] = cells[idx] ?? '';
    });
    data.push(row);
  }

  return { header, data };
}

/**
 * @param {string} ev
 * @returns {boolean}
 */
export function looksLikeEvidence(ev) {
  const t = ev.trim();
  if (!t) return false;
  return /[0-9a-f]{7,40}/i.test(t) || /^git\s/i.test(t) || /https?:\/\//i.test(t);
}

/**
 * @param {string} body PR body or handoff report markdown
 * @returns {{ ok: true, allStale: boolean } | { ok: false, message: string }}
 */
export function checkWitnessTable(body) {
  const headerRe = /^## Witness Table\s*$/m;
  if (!headerRe.test(body)) {
    return { ok: false, message: "Missing literal '## Witness Table' header." };
  }

  const tableBlock = extractTableAfterHeader(body);
  if (!tableBlock) {
    return { ok: false, message: 'Witness Table header found but no markdown table follows it.' };
  }

  const rows = parseMarkdownTable(tableBlock);
  if (!rows) {
    return { ok: false, message: 'Witness Table header found but markdown table could not be parsed.' };
  }

  const cols = rows.header.map((c) => c.trim().toLowerCase());
  if (!['claim', 'verdict', 'evidence'].every((c) => cols.includes(c))) {
    return { ok: false, message: 'Witness Table must have Claim, Verdict, Evidence columns.' };
  }

  if (rows.data.length < 1) {
    return { ok: false, message: 'Witness Table has no data rows.' };
  }

  let allStale = true;
  for (const row of rows.data) {
    const verdict = (row.verdict || '').trim().toUpperCase();
    if (!ALLOWED_VERDICTS.has(verdict)) {
      return {
        ok: false,
        message: `Invalid verdict "${row.verdict || ''}". Must be one of VERIFIED/DISPUTED/STALE/FAIL_CLOSED.`,
      };
    }
    if (verdict !== 'STALE') allStale = false;

    const ev = (row.evidence || '').trim();
    if (!looksLikeEvidence(ev)) {
      return {
        ok: false,
        message: `Evidence cell "${ev || '(empty)'}" doesn't look like a ref (SHA/git command/URL).`,
      };
    }
  }

  return { ok: true, allStale };
}

/**
 * Failure comment body for I7 (copy-paste friendly).
 * @returns {string}
 */
export function witnessTableFailureMessage() {
  return [
    'Required (copy exactly):',
    '',
    '```markdown',
    '## Witness Table',
    '',
    '| Claim | Verdict | Evidence |',
    '|---|---|---|',
    '| <what you claim is true> | VERIFIED | <SHA, git command, or URL> |',
    '```',
    '',
    'Rules:',
    '- Header must be exactly `## Witness Table`',
    '- Verdict must be one of VERIFIED / DISPUTED / STALE / FAIL_CLOSED',
    '- Evidence must be a real ref (SHA / git command / link) — not prose',
    '',
    'Doctrine: docs/WITNESS_PROTOCOL.md — "an agent\'s completion report is a claim, not a verification."',
  ].join('\n');
}

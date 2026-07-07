/**
 * mec-parser.ts
 *
 * Reference implementation of the Mobius Extraction Code (MEC) grammar.
 * See docs/specs/MEC_SPEC_v0.1.md for the constitutional definition.
 *
 * Canonical form:
 *   E{epoch}.RB{block}.C{cycle}.S{seal}[amendment]:Q{quorum}:{agents}:GI{gi}
 *
 * Example:
 *   E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064
 *
 * Rule: MEC never replaces EPICON. It only points to it. Expansion is a
 * separate lookup (expandMEC) against the EPICON/ledger store — this file
 * only handles the grammar, not resolution.
 */

export const AGENT_CODES = {
  AT: 'ATLAS',
  ZE: 'ZEUS',
  EV: 'EVE',
  JA: 'JADE',
  AU: 'AUREA',
  HE: 'HERMES',
  EC: 'ECHO',
  DA: 'DAEDALUS',
  UR: 'URIEL',
  ZN: 'ZENITH',
} as const;

/** @deprecated Use AGENT_CODES */
export const AGENT_CODE_TO_NAME = AGENT_CODES;

export type AgentCode = keyof typeof AGENT_CODES;
export type AgentName = (typeof AGENT_CODES)[AgentCode];

export interface ParsedMEC {
  epoch: number;
  reserveBlock: number;
  cycle: number;
  seal: number;
  amendment: string | null;
  quorum: number;
  agents: AgentCode[];
  gi: number;
  raw: string;
}

/** @deprecated Use ParsedMEC */
export type MecRecord = Omit<ParsedMEC, 'raw'> & { amendment?: string };

// Fixed grammar. No other separators are valid — see spec §Separator rules.
export const MEC_REGEX =
  /^E(\d+)\.RB(\d+)\.C(\d+)\.S(\d+)([A-Z])?:Q(\d+):([A-Z]{2}(?:\+[A-Z]{2})*):GI(\d{3})$/;

/** @deprecated Use MEC_REGEX */
export const MEC_CANONICAL_REGEX = MEC_REGEX;

export class MECParseError extends Error {
  constructor(raw: string, reason: string) {
    super(`Malformed MEC "${raw}": ${reason}`);
    this.name = 'MECParseError';
  }
}

function assertGiField(giField: string, raw: string): number {
  const gi = Number.parseInt(giField, 10) / 100;
  if (gi > 1.0) {
    throw new MECParseError(raw, `GI${giField} exceeds GI100 (1.00)`);
  }
  return gi;
}

function giDigits(gi: number): string {
  if (!Number.isFinite(gi) || gi < 0 || gi > 1) {
    throw new MECParseError('(constructed)', 'GI must be a finite number between 0 and 1');
  }
  return String(Math.trunc(gi * 100)).padStart(3, '0');
}

/**
 * Parse a canonical MEC string into structured fields.
 * Throws MECParseError on any grammar violation — MEC is intentionally
 * strict, since it's meant to be machine-addressable, not fuzzy-matched.
 */
export function parseMEC(raw: string): ParsedMEC {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new MECParseError(raw, 'MEC string is empty');
  }
  if (/[-_\s]/.test(trimmed)) {
    throw new MECParseError(raw, 'contains invalid separator (-, _, or whitespace)');
  }

  const match = MEC_REGEX.exec(trimmed);
  if (!match) {
    throw new MECParseError(raw, 'does not match canonical grammar');
  }

  const [, epoch, block, cycle, seal, amendment, quorum, agentField, giField] = match;

  const agentCodes = agentField.split('+') as AgentCode[];
  for (const code of agentCodes) {
    if (!(code in AGENT_CODES)) {
      throw new MECParseError(raw, `unknown agent code "${code}"`);
    }
  }

  const gi = assertGiField(giField, raw);

  return {
    epoch: Number(epoch),
    reserveBlock: Number(block),
    cycle: Number(cycle),
    seal: Number(seal),
    amendment: amendment || null,
    quorum: Number(quorum),
    agents: agentCodes,
    gi,
    raw: trimmed,
  };
}

/** @deprecated Use parseMEC */
export function parseMec(raw: string) {
  try {
    const value = parseMEC(raw);
    const { raw: _raw, ...rest } = value;
    return {
      ok: true as const,
      value: {
        ...rest,
        amendment: rest.amendment ?? undefined,
      },
      canonical: formatMEC(rest),
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Invalid MEC',
    };
  }
}

/**
 * Format a structured MEC back into its canonical string form.
 * `formatMEC(parseMEC(x)) === x` must hold for any valid canonical x —
 * this round-trip is what makes SealCode UIs trustworthy.
 */
export function formatMEC(fields: Omit<ParsedMEC, 'raw'>): string {
  if (fields.gi > 1) {
    throw new MECParseError('(constructed)', 'GI cannot exceed 1.00');
  }

  const sealPart = `S${String(fields.seal).padStart(3, '0')}${fields.amendment ?? ''}`;

  return (
    `E${String(fields.epoch).padStart(2, '0')}` +
    `.RB${String(fields.reserveBlock).padStart(3, '0')}` +
    `.C${String(fields.cycle).padStart(3, '0')}` +
    `.${sealPart}` +
    `:Q${fields.quorum}` +
    `:${fields.agents.join('+')}` +
    `:GI${giDigits(fields.gi)}`
  );
}

/** @deprecated Use formatMEC */
export const formatMec = formatMEC;

/**
 * Render a parsed MEC as an operator-facing SealCode block.
 * Display only — must never encode information absent from the MEC.
 */
export function toSealCode(fields: ParsedMEC): string {
  const agentLine = fields.agents.map((code) => `${code}✓`).join(' ');
  const giDisplay = fields.gi.toFixed(2).replace(/^0/, '');

  return [
    `RB${String(fields.reserveBlock).padStart(3, '0')}`,
    `C${String(fields.cycle).padStart(3, '0')}`,
    `S${String(fields.seal).padStart(3, '0')}${fields.amendment ?? ''}`,
    agentLine,
    `GI ${giDisplay}`,
  ].join('\n');
}

/** @deprecated Use toSealCode */
export const formatSealCode = toSealCode;

/** Decode GI### field to 0–1 score (truncation semantics on encode). */
export function decodeGiField(giField: string): number {
  const digits = giField.startsWith('GI') ? giField.slice(2) : giField;
  if (!/^\d{3}$/.test(digits)) {
    throw new MECParseError(giField, 'GI field must be exactly 3 digits');
  }
  return assertGiField(digits, giField);
}

/** Encode 0–1 GI score to GI### field (truncation, not rounding). */
export function encodeGiField(gi: number): string {
  return `GI${giDigits(gi)}`;
}

/** @deprecated Use formatMEC */
export function buildMec(record: Omit<ParsedMEC, 'raw'>): string {
  return formatMEC(record);
}

/**
 * Placeholder resolution hook — MEC only *points to* EPICON, it does not
 * carry the narrative. Wire this to the actual EPICON/ledger store.
 */
export async function expandMEC(
  mec: ParsedMEC,
): Promise<{ epiconRecord: unknown }> {
  throw new Error(
    'expandMEC is a stub — wire to EPICON/ledger lookup by ' +
      `(cycle=${mec.cycle}, seal=${mec.seal}, block=${mec.reserveBlock})`,
  );
}

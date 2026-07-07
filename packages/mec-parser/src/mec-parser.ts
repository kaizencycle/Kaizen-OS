/**
 * Mobius Extraction Code (MEC) — reference parser (C-365).
 * @see specs/MEC_SPEC_v0.1.md
 */

export const AGENT_CODE_TO_NAME = {
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

export type AgentCode = keyof typeof AGENT_CODE_TO_NAME;
export type AgentName = (typeof AGENT_CODE_TO_NAME)[AgentCode];

const NAME_TO_AGENT_CODE = Object.fromEntries(
  Object.entries(AGENT_CODE_TO_NAME).map(([code, name]) => [name, code]),
) as Record<AgentName, AgentCode>;

/** Canonical MEC grammar — see MEC_SPEC_v0.1.md */
export const MEC_CANONICAL_REGEX =
  /^E(\d+)\.RB(\d+)\.C(\d+)\.S(\d+)([A-Z])?:Q(\d+):([A-Z]{2}(?:\+[A-Z]{2})*):GI(\d{3})$/;

export interface MecRecord {
  epoch: number;
  reserveBlock: number;
  cycle: number;
  seal: number;
  /** Single-letter amendment suffix (S016A → "A") */
  amendment?: string;
  quorum: number;
  agents: AgentCode[];
  /** GI score in 0–1 range */
  gi: number;
}

export type ParseMecSuccess = {
  ok: true;
  value: MecRecord;
  canonical: string;
};

export type ParseMecFailure = {
  ok: false;
  error: string;
};

export type ParseMecResult = ParseMecSuccess | ParseMecFailure;

function isAgentCode(code: string): code is AgentCode {
  return code in AGENT_CODE_TO_NAME;
}

function parseAgentList(raw: string): AgentCode[] | ParseMecFailure {
  const codes = raw.split('+');
  if (codes.length === 0) {
    return { ok: false, error: 'Agent list is empty' };
  }

  for (const code of codes) {
    if (code.length !== 2 || !isAgentCode(code)) {
      return { ok: false, error: `Unknown or malformed agent code: ${code}` };
    }
  }

  return codes as AgentCode[];
}

/** Decode GI### field to 0–1 score (truncation, not rounding). */
export function decodeGiField(giField: string): number {
  const digits = giField.startsWith('GI') ? giField.slice(2) : giField;
  if (!/^\d{3}$/.test(digits)) {
    throw new Error(`GI field must be exactly 3 digits: ${giField}`);
  }
  return Number.parseInt(digits, 10) / 100;
}

/** Encode 0–1 GI score to GI### field (truncation, not rounding). */
export function encodeGiField(gi: number): string {
  if (!Number.isFinite(gi) || gi < 0 || gi > 1) {
    throw new Error(`GI must be a finite number between 0 and 1: ${gi}`);
  }
  const scaled = Math.trunc(gi * 100);
  return `GI${String(scaled).padStart(3, '0')}`;
}

export function agentNameToCode(name: AgentName): AgentCode {
  const code = NAME_TO_AGENT_CODE[name];
  if (!code) {
    throw new Error(`Unknown agent name: ${name}`);
  }
  return code;
}

export function agentCodeToName(code: AgentCode): AgentName {
  return AGENT_CODE_TO_NAME[code];
}

export function parseMec(input: string): ParseMecResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: 'MEC string is empty' };
  }

  if (/[-_\s]/.test(trimmed)) {
    return { ok: false, error: 'MEC contains invalid separator (-, _, or whitespace)' };
  }

  const match = MEC_CANONICAL_REGEX.exec(trimmed);
  if (!match) {
    return { ok: false, error: 'MEC does not match canonical grammar' };
  }

  const [
    ,
    epochRaw,
    blockRaw,
    cycleRaw,
    sealRaw,
    amendment,
    quorumRaw,
    agentsRaw,
    giRaw,
  ] = match;

  const agents = parseAgentList(agentsRaw);
  if (!Array.isArray(agents)) {
    return agents;
  }

  let gi: number;
  try {
    gi = decodeGiField(`GI${giRaw}`);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid GI field',
    };
  }

  const value: MecRecord = {
    epoch: Number.parseInt(epochRaw, 10),
    reserveBlock: Number.parseInt(blockRaw, 10),
    cycle: Number.parseInt(cycleRaw, 10),
    seal: Number.parseInt(sealRaw, 10),
    amendment: amendment || undefined,
    quorum: Number.parseInt(quorumRaw, 10),
    agents,
    gi,
  };

  return {
    ok: true,
    value,
    canonical: formatMec(value),
  };
}

function padEpoch(epoch: number): string {
  return String(epoch).padStart(2, '0');
}

function padHierarchy(value: number): string {
  return String(value).padStart(3, '0');
}

/** Format a parsed MEC record into its canonical string. */
export function formatMec(record: MecRecord): string {
  const sealPart = `S${padHierarchy(record.seal)}${record.amendment ?? ''}`;
  const agentsPart = record.agents.join('+');
  const giPart = encodeGiField(record.gi);

  return [
    `E${padEpoch(record.epoch)}`,
    `RB${padHierarchy(record.reserveBlock)}`,
    `C${padHierarchy(record.cycle)}`,
    sealPart,
  ].join('.') + `:Q${record.quorum}:${agentsPart}:${giPart}`;
}

/** Human-friendly SealCode card — display only; round-trips via formatMec. */
export function formatSealCode(record: MecRecord): string {
  const sealLine = `S${padHierarchy(record.seal)}${record.amendment ?? ''}`;
  const agentLine = record.agents.map((code) => `${code}✓`).join(' ');
  const giScaled = Math.trunc(record.gi * 100);
  const giLine =
    record.gi >= 1
      ? 'GI 1.00'
      : `GI .${String(giScaled).padStart(2, '0')}`;

  return [
    `RB${padHierarchy(record.reserveBlock)}`,
    `C${padHierarchy(record.cycle)}`,
    sealLine,
    agentLine,
    giLine,
  ].join('\n');
}

/** Build a MecRecord from structured fields and return canonical MEC. */
export function buildMec(record: MecRecord): string {
  for (const code of record.agents) {
    if (!isAgentCode(code)) {
      throw new Error(`Unknown agent code: ${code}`);
    }
  }
  return formatMec(record);
}

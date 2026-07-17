import { describe, expect, it } from 'vitest';
import {
  MECParseError,
  MEC_CONSTITUTIONAL_REGEX,
  MEC_REGEX,
  encodeGiField,
  expandMEC,
  formatMEC,
  parseMEC,
  toSealCode,
} from '../packages/mec-parser/src/mec-parser';

const CANONICAL = 'E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064';

describe('parseMEC', () => {
  it('parses the canonical example', () => {
    const parsed = parseMEC(CANONICAL);
    expect(parsed).toMatchObject({
      epoch: 1,
      reserveBlock: 341,
      cycle: 365,
      seal: 16,
      quorum: 5,
      agents: ['AT', 'ZE', 'EV', 'JA', 'AU'],
      gi: 0.64,
      raw: CANONICAL,
    });
  });

  it('rejects letter-suffix amendments (Option B)', () => {
    expect(() =>
      parseMEC('E01.RB341.C365.S016A:Q5:AT+ZE+EV+JA+AU:GI064'),
    ).toThrow(MECParseError);
  });

  it('throws on malformed separators', () => {
    expect(() => parseMEC('E01-RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064')).toThrow(
      MECParseError,
    );
    expect(() => parseMEC('E01.RB341.C365.S016 Q5 AT ZE GI064')).toThrow(MECParseError);
  });

  it('throws on unknown agent codes', () => {
    expect(() => parseMEC('E01.RB341.C365.S016:Q5:AT+XX+EV+JA+AU:GI064')).toThrow(
      MECParseError,
    );
  });

  it('constitutional regex rejects unknown agent codes before parseMEC', () => {
    const bad = 'E01.RB341.C365.S016:Q5:AT+XX+EV+JA+AU:GI064';
    expect(MEC_REGEX.test(bad)).toBe(true);
    expect(MEC_CONSTITUTIONAL_REGEX.test(bad)).toBe(false);
  });

  it('throws on invalid GI width', () => {
    expect(() => parseMEC('E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI64')).toThrow(
      MECParseError,
    );
  });
});

describe('formatMEC round-trip', () => {
  it('round-trips canonical example', () => {
    expect(formatMEC(parseMEC(CANONICAL))).toBe(CANONICAL);
  });

  it('builds from structured fields', () => {
    expect(
      formatMEC({
        epoch: 1,
        reserveBlock: 341,
        cycle: 365,
        seal: 16,
        quorum: 5,
        agents: ['AT', 'ZE', 'EV', 'JA', 'AU'],
        gi: 0.64,
      }),
    ).toBe(CANONICAL);
  });
});

describe('GI encoding', () => {
  it('truncates rather than rounds on encode', () => {
    expect(encodeGiField(0.649)).toBe('GI064');
    expect(encodeGiField(0.95)).toBe('GI095');
    expect(encodeGiField(1)).toBe('GI100');
    expect(encodeGiField(0.06)).toBe('GI006');
  });
});

describe('toSealCode', () => {
  it('renders operator card without extra fields', () => {
    const parsed = parseMEC(CANONICAL);
    expect(toSealCode(parsed)).toBe(
      ['RB341', 'C365', 'S016', 'AT✓ ZE✓ EV✓ JA✓ AU✓', 'GI .64'].join('\n'),
    );
    expect(formatMEC(parsed)).toBe(CANONICAL);
  });

  it('renders GI 1.00 at ceiling', () => {
    const parsed = parseMEC('E01.RB001.C365.S001:Q5:AT+ZE+EV+JA+AU:GI100');
    expect(toSealCode(parsed)).toContain('GI 1.00');
  });
});

describe('expandMEC', () => {
  it('remains a stub until wired to EPICON/ledger', async () => {
    await expect(expandMEC(parseMEC(CANONICAL))).rejects.toThrow(/stub/);
  });
});

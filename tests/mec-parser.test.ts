import { describe, expect, it } from 'vitest';
import {
  buildMec,
  decodeGiField,
  encodeGiField,
  formatMec,
  formatSealCode,
  parseMec,
} from '../packages/mec-parser/src/mec-parser';

const CANONICAL = 'E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064';

describe('parseMec', () => {
  it('parses the canonical example', () => {
    const result = parseMec(CANONICAL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toMatchObject({
      epoch: 1,
      reserveBlock: 341,
      cycle: 365,
      seal: 16,
      quorum: 5,
      agents: ['AT', 'ZE', 'EV', 'JA', 'AU'],
      gi: 0.64,
    });
    expect(result.canonical).toBe(CANONICAL);
  });

  it('parses seal amendments', () => {
    const amended = 'E01.RB341.C365.S016A:Q5:AT+ZE+EV+JA+AU:GI064';
    const result = parseMec(amended);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.amendment).toBe('A');
    expect(result.canonical).toBe(amended);
  });

  it('rejects malformed separators', () => {
    expect(parseMec('E01-RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064').ok).toBe(false);
    expect(parseMec('E01.RB341.C365.S016:Q5:AT_ZE_EV_JA_AU:GI064').ok).toBe(false);
    expect(parseMec('E01.RB341.C365.S016 Q5 AT ZE GI064').ok).toBe(false);
  });

  it('rejects unknown agent codes', () => {
    expect(parseMec('E01.RB341.C365.S016:Q5:AT+XX+EV+JA+AU:GI064').ok).toBe(false);
  });

  it('rejects invalid GI width', () => {
    expect(parseMec('E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI64').ok).toBe(false);
  });
});

describe('formatMec round-trip', () => {
  it('round-trips canonical example', () => {
    const parsed = parseMec(CANONICAL);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(formatMec(parsed.value)).toBe(CANONICAL);
  });

  it('builds from structured record', () => {
    expect(
      buildMec({
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
  it('truncates rather than rounds', () => {
    expect(encodeGiField(0.649)).toBe('GI064');
    expect(decodeGiField('GI064')).toBe(0.64);
    expect(decodeGiField('GI095')).toBe(0.95);
    expect(decodeGiField('GI100')).toBe(1);
    expect(decodeGiField('GI006')).toBe(0.06);
  });
});

describe('formatSealCode', () => {
  it('renders operator card without extra fields', () => {
    const parsed = parseMec(CANONICAL);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(formatSealCode(parsed.value)).toBe(
      [
        'RB341',
        'C365',
        'S016',
        'AT✓ ZE✓ EV✓ JA✓ AU✓',
        'GI .64',
      ].join('\n'),
    );
    expect(formatMec(parsed.value)).toBe(CANONICAL);
  });

  it('renders GI 1.00 at ceiling', () => {
    const parsed = parseMec('E01.RB001.C365.S001:Q5:AT+ZE+EV+JA+AU:GI100');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(formatSealCode(parsed.value)).toContain('GI 1.00');
  });
});

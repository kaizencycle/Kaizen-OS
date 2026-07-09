import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import { MEC_REGEX } from '../packages/mec-parser/src/mec-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '../schemas/epicon_constitutional_v1.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const CANONICAL_MEC = 'E01.RB341.C365.S016:Q5:AT+ZE+EV+JA+AU:GI064';

const validBase = {
  id: '018f3c2a-7b4e-7f3a-9c1d-2a8b4e6f9012',
  tier: 'EP-3',
  policy_rule_id: 'canon.seal.mint',
  operational_merkle_root: 'a'.repeat(64),
  reconstruction_fingerprint: 'b'.repeat(64),
  actor_commitment: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  policy_outcome: 'PASS',
  attestations: [
    {
      attestor: 'ATLAS',
      signature: 'sig-atlas-example',
      signed_at: '2026-07-08T00:00:00Z',
    },
  ],
  timestamp: '2026-07-08T00:00:00Z',
};

describe('epicon_constitutional_v1.schema.json', () => {
  it('validates a minimal EP-3 constitutional EPICON', () => {
    const ok = validate(validBase);
    expect(validate.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it('accepts optional mec_citation aligned with MEC grammar', () => {
    expect(MEC_REGEX.test(CANONICAL_MEC)).toBe(true);
    const ok = validate({ ...validBase, mec_citation: CANONICAL_MEC });
    expect(validate.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it('rejects letter-suffix MEC amendments (Option B)', () => {
    const badMec = 'E01.RB341.C365.S016A:Q5:AT+ZE+EV+JA+AU:GI064';
    expect(MEC_REGEX.test(badMec)).toBe(false);
    const ok = validate({ ...validBase, mec_citation: badMec });
    expect(ok).toBe(false);
  });

  it('requires conditions when policy_outcome is PASS_WITH_CONDITIONS', () => {
    const ok = validate({
      ...validBase,
      policy_outcome: 'PASS_WITH_CONDITIONS',
    });
    expect(ok).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === 'required')).toBe(true);
  });

  it('rejects EP-1 tier on constitutional EPICON', () => {
    const ok = validate({ ...validBase, tier: 'EP-1' });
    expect(ok).toBe(false);
  });
});

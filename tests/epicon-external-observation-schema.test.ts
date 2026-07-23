import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '../schemas/epicon_external_observation_v1.schema.json');
const examplePath = join(
  __dirname,
  '../docs/epicon/examples/epicon-000-external-reality-boundary.example.json',
);
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const example = JSON.parse(readFileSync(examplePath, 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

describe('epicon_external_observation_v1.schema.json', () => {
  it('validates the EPICON-000 example instance', () => {
    const ok = validate(example);
    expect(validate.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it('requires at least one counterfactual', () => {
    const invalid = { ...example, counterfactuals: [] };
    const ok = validate(invalid);
    expect(ok).toBe(false);
    expect(validate.errors?.some((e) => e.instancePath === '/counterfactuals')).toBe(true);
  });

  it('defines all external trust states including CANON_ELIGIBLE', () => {
    const states = schema.$defs.external_trust_state.enum as string[];
    expect(states).toContain('UNTRUSTED');
    expect(states).toContain('QUARANTINED');
    expect(states).toContain('CANON_ELIGIBLE');
  });

  it('defines CIRCULAR_CITATION as a source kind', () => {
    const kinds = schema.$defs.source_kind.enum as string[];
    expect(kinds).toContain('CIRCULAR_CITATION');
    expect(kinds).toContain('ORIGINAL_SOURCE');
  });

  it('defines degraded replay states for operational failure visibility', () => {
    const degraded = schema.$defs.replay_record.properties.degraded_states.items
      .enum as string[];
    expect(degraded).toContain('source_disappeared');
    expect(degraded).toContain('retrieval_incomplete');
    expect(degraded).toContain('robots_txt_blocked');
  });

  it('prevents claims from being marked established fact in schema', () => {
    const claimSchema = schema.$defs.claim_record;
    expect(claimSchema.properties.is_established_fact.const).toBe(false);
  });

  it('prevents absence from implying concealment by default', () => {
    const absenceSchema = schema.$defs.absence_record;
    expect(absenceSchema.properties.implies_concealment.const).toBe(false);
  });

  it('requires conflicts to be preserved', () => {
    const conflictSchema = schema.$defs.conflict_record;
    expect(conflictSchema.properties.preserved.const).toBe(true);
  });

  it('allows QUARANTINE verdict at environment initialization', () => {
    expect(example.verdict).toBe('QUARANTINE');
    expect(example.environment.trust_state).toBe('QUARANTINED');
  });
});

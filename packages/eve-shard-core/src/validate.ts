import AjvModule from 'ajv';
import addFormatsModule from 'ajv-formats';
import type { ErrorObject } from 'ajv';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { EveReserveShard } from './types.js';

const Ajv = AjvModule.default ?? AjvModule;
const addFormats = addFormatsModule.default ?? addFormatsModule;

const packageRoot = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(packageRoot, '../schema/eve-reserve-shard.schema.json');

let compiledValidator: ReturnType<InstanceType<typeof Ajv>['compile']> | null = null;

function getValidator() {
  if (!compiledValidator) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as object;
    compiledValidator = ajv.compile(schema);
  }

  return compiledValidator;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export function validateShardDocument(shard: EveReserveShard): ValidationResult {
  const validate = getValidator();
  const valid = validate(shard);

  if (!valid) {
    const errors = (validate.errors ?? []).map(
      (error: ErrorObject) => `${error.instancePath || '/'} ${error.message ?? 'invalid'}`,
    );
    return { ok: false, errors };
  }

  return { ok: true };
}

export function assertProposalSafe(shard: EveReserveShard): void {
  if (shard.shard.status === 'sealed') {
    throw new Error('EVE may not emit sealed shard status during proposal');
  }

  if (shard.pipeline_status.seal_status === 'sealed') {
    throw new Error('EVE may not emit sealed pipeline_status during proposal');
  }

  if (shard.seal_recommendation.human_review_required !== true) {
    throw new Error('human_review_required must remain true for proposals');
  }
}

export function validateProposal(shard: EveReserveShard): ValidationResult {
  try {
    assertProposalSafe(shard);
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : 'proposal safety check failed'],
    };
  }

  return validateShardDocument(shard);
}

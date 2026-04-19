import { createHash } from 'crypto';
import { canonicalStringify } from './canonicalJson';

export interface HashEnvelope<T = unknown> {
  payload: T;
  hash: string;
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** Hash canonical JSON of `payload` (payload must not include `hash` / `hash_algorithm`). */
export function hashPayload<T>(payload: T): string {
  return sha256Hex(canonicalStringify(payload));
}

export function withHash<T>(payload: T): HashEnvelope<T> {
  return {
    payload,
    hash: hashPayload(payload)
  };
}

export function verifyPayloadHash<T>(payload: T, expectedHash: string): boolean {
  return hashPayload(payload) === expectedHash;
}

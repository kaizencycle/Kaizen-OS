import { hashPayload } from './hash';

export interface ChainedRecord<T extends object> {
  payload: T & { previous_hash: string | null };
  hash: string;
}

export function chainRecord<T extends object>(
  payload: T,
  previousHash: string | null
): ChainedRecord<T> {
  const chainedPayload = {
    ...payload,
    previous_hash: previousHash
  } as T & { previous_hash: string | null };
  return {
    payload: chainedPayload,
    hash: hashPayload(chainedPayload)
  };
}

export function verifyChainLink<T extends object>(
  payload: T & { previous_hash: string | null },
  expectedHash: string
): boolean {
  return hashPayload(payload) === expectedHash;
}

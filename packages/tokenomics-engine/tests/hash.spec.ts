import { describe, expect, it } from 'vitest';
import { canonicalStringify } from '../src/canonicalJson';
import { hashPayload, verifyPayloadHash, withHash } from '../src/hash';
import { chainRecord, verifyChainLink } from '../src/chainHash';

describe('canonicalStringify', () => {
  it('sorts object keys for stable output', () => {
    const a = canonicalStringify({ z: 1, a: 2, m: { b: 1, a: 2 } });
    const b = canonicalStringify({ a: 2, m: { a: 2, b: 1 }, z: 1 });
    expect(a).toBe(b);
  });

  it('omits undefined', () => {
    expect(canonicalStringify({ a: 1, b: undefined })).toBe('{"a":1}');
  });
});

describe('hashPayload', () => {
  it('withHash produces verifiable hash', () => {
    const { payload, hash } = withHash({ type: 'X', n: 1 });
    expect(verifyPayloadHash(payload, hash)).toBe(true);
    expect(verifyPayloadHash({ ...payload, n: 2 }, hash)).toBe(false);
  });

  it('hashPayload is deterministic', () => {
    const h1 = hashPayload({ a: 1, b: 2 });
    const h2 = hashPayload({ b: 2, a: 1 });
    expect(h1).toBe(h2);
  });
});

describe('chainRecord', () => {
  it('includes previous_hash in digest', () => {
    const { payload: p1, hash: h1 } = chainRecord({ type: 'B', x: 1 }, null);
    const { payload: p2, hash: h2 } = chainRecord({ type: 'B', x: 1 }, h1);
    expect(h1).not.toBe(h2);
    expect(verifyChainLink(p1, h1)).toBe(true);
    expect(verifyChainLink(p2, h2)).toBe(true);
  });
});

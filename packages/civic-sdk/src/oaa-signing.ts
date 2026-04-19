import * as crypto from 'crypto';

/** Hex-encoded SHA-256 of UTF-8 string. */
export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

export function signHmacSha256Hex(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

export function verifyHmacSha256Hex(payload: string, signature: string, secret: string): boolean {
  const expected = signHmacSha256Hex(payload, secret);
  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(signature, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Stable JSON for HMAC signing (OAA / Terminal contract).
 * Field order is fixed so writers and verifiers agree without sorting ambiguity.
 */
export function canonicalOaaKvSignPayload(input: {
  key: string;
  value: unknown;
  agent: string;
  cycle: string;
  intent?: string;
  previousHash: string | null;
}): string {
  const obj = {
    key: input.key,
    value: input.value,
    agent: input.agent,
    cycle: input.cycle,
    intent: input.intent ?? null,
    previousHash: input.previousHash,
  };
  return JSON.stringify(obj);
}

export function signOaaKvPayload(input: Parameters<typeof canonicalOaaKvSignPayload>[0], secret: string): string {
  return signHmacSha256Hex(canonicalOaaKvSignPayload(input), secret);
}

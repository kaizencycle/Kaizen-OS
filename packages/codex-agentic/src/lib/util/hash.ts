/**
 * Cryptographic utilities
 */

import crypto from 'crypto';

/**
 * Generate a stable SHA-256 hash from a string
 */
export function stableHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generate a short trace ID (first 16 chars of hash)
 */
export function generateTraceId(data: any): string {
  return stableHash(JSON.stringify(data)).slice(0, 16);
}

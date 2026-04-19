/**
 * Canonical JSON for stable MIC integrity hashes.
 * - Object keys sorted lexicographically
 * - Arrays preserve order
 * - undefined omitted
 * - Date to ISO string
 * - Non-finite numbers rejected
 */

export type JsonLike =
  | null
  | boolean
  | number
  | string
  | JsonLike[]
  | { [key: string]: JsonLike };

function normalize(value: unknown): JsonLike {
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('canonicalJson: non-finite number encountered');
    }
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (typeof value === 'object') {
    const input = value as Record<string, unknown>;
    const keys = Object.keys(input).sort();
    const output: Record<string, JsonLike> = {};
    for (const key of keys) {
      const v = input[key];
      if (v === undefined) continue;
      output[key] = normalize(v);
    }
    return output;
  }
  throw new Error(`canonicalJson: unsupported type "${typeof value}"`);
}

export function canonicalize(value: unknown): JsonLike {
  return normalize(value);
}

export function canonicalStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

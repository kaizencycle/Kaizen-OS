import crypto from 'crypto';
import type { NormalizedEvidenceRequest } from './types';
import { NormalizedEvidenceRequestSchema } from './types';

function trimCollapse(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

function normalizeParameters(
  parameters: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> {
  const keys = Object.keys(parameters).sort();
  const out: Record<string, string | number | boolean | null> = {};
  for (const key of keys) {
    const value = parameters[key];
    if (typeof value === 'string') {
      out[key] = trimCollapse(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function normalizeEvidenceRequest(input: unknown): NormalizedEvidenceRequest {
  const parsed = NormalizedEvidenceRequestSchema.parse(input);
  return {
    ...parsed,
    providerId: trimCollapse(parsed.providerId).toLowerCase(),
    resourceClass: trimCollapse(parsed.resourceClass).toLowerCase(),
    query: trimCollapse(parsed.query).toLowerCase(),
    parameters: normalizeParameters(parsed.parameters ?? {}),
    format: trimCollapse(parsed.format).toLowerCase(),
    locale: trimCollapse(parsed.locale).toLowerCase(),
    jurisdiction: trimCollapse(parsed.jurisdiction).toLowerCase(),
  };
}

function canonicalStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalStringify(item)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts = keys.map((key) => `${JSON.stringify(key)}:${canonicalStringify(obj[key])}`);
  return `{${parts.join(',')}}`;
}

export function createEvidenceRequestHash(normalized: NormalizedEvidenceRequest): string {
  const identity = {
    providerId: normalized.providerId,
    resourceClass: normalized.resourceClass,
    query: normalized.query,
    parameters: normalized.parameters,
    format: normalized.format,
    locale: normalized.locale,
    jurisdiction: normalized.jurisdiction,
    licenseScope: normalized.licenseScope ?? null,
  };
  return crypto.createHash('sha256').update(canonicalStringify(identity), 'utf8').digest('hex');
}

export function createEvidenceContentHash(payload: unknown): string {
  return crypto.createHash('sha256').update(canonicalStringify(payload), 'utf8').digest('hex');
}

export function buildNormalizedQueryLabel(normalized: NormalizedEvidenceRequest): string {
  const paramSummary = Object.entries(normalized.parameters)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join('; ');
  return `${normalized.providerId}/${normalized.resourceClass}: ${normalized.query}${paramSummary ? ` (${paramSummary})` : ''}`;
}

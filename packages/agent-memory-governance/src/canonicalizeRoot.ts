import type { EvidentiaryRoot } from './types.js';

/** Qualifying types per C-386 §7 — agent_memory and similar never increase quorum alone. */
export const QUALIFYING_EVIDENTIARY_TYPES = new Set([
  'primary_instrument',
  'canonical_repository_state',
  'CPC_attested_state',
  'primary_external_source',
  'human_authorized_evidence',
]);

/**
 * Canonical dedup key for evidentiary roots (C-386 §7.1 / Z-002).
 * Writers SHOULD emit normalized root_id; readers MUST canonicalize before counting.
 */
export function canonicalRootKey(source: Pick<EvidentiaryRoot, 'type' | 'root_id'>): string {
  const type = source.type;
  const id = source.root_id.trim();
  if (type === 'canonical_repository_state') {
    return `canonical_repository_state:${canonicalizeGitHubRepositoryRoot(id)}`;
  }
  return `${type}:${id}`;
}

/**
 * Collapse github:url-*, github:commit-*, github:artifact-*, and owner/repo@sha aliases
 * that refer to the same repository commit.
 */
export function canonicalizeGitHubRepositoryRoot(root_id: string): string {
  let raw = root_id.trim();
  if (/^github:/i.test(raw)) {
    raw = raw.replace(/^github:/i, '').trim();
  }

  const commitUrl = raw.match(
    /github\.com\/([^/]+)\/([^/]+)\/commit\/([0-9a-f]{7,40})/i
  );
  if (commitUrl) {
    return `${commitUrl[1].toLowerCase()}/${commitUrl[2].toLowerCase()}@${commitUrl[3].toLowerCase()}`;
  }

  if (/^artifact:/i.test(raw)) {
    const sub = raw.replace(/^artifact:/i, '');
    const artifact = sub.match(/^([^/]+)\/([^@/]+)@([0-9a-f]{7,40})$/i);
    if (artifact) {
      return `${artifact[1].toLowerCase()}/${artifact[2].toLowerCase()}@${artifact[3].toLowerCase()}`;
    }
  }

  const ownerRepoSha = raw.match(/^([^/]+)\/([^@/]+)@([0-9a-f]{7,40})$/i);
  if (ownerRepoSha) {
    return `${ownerRepoSha[1].toLowerCase()}/${ownerRepoSha[2].toLowerCase()}@${ownerRepoSha[3].toLowerCase()}`;
  }

  const shaSuffix = raw.match(/@([0-9a-f]{7,40})$/i);
  const repoInLabel = raw.match(/([a-z0-9_-]+\/[a-z0-9_.-]+)/i);
  if (shaSuffix && repoInLabel) {
    return `${repoInLabel[1].toLowerCase()}@${shaSuffix[1].toLowerCase()}`;
  }

  // Same commit referenced without repo in label — dedupe by full SHA (Z-002 url/commit aliases)
  const embeddedSha = raw.match(/([0-9a-f]{40})/i);
  if (embeddedSha) {
    return `*@${embeddedSha[1].toLowerCase()}`;
  }

  return raw.toLowerCase();
}

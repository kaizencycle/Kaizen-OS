import type { EvidentiaryRoot } from './types.js';

/** Qualifying types per C-386 §7 — agent_memory and similar never increase quorum alone. */
export const QUALIFYING_EVIDENTIARY_TYPES = new Set([
  'primary_instrument',
  'canonical_repository_state',
  'CPC_attested_state',
  'primary_external_source',
  'human_authorized_evidence',
]);

const MAX_ROOT_ID_LEN = 4096;
/** Quorum counting requires a full 40-character commit SHA (no abbreviated prefixes). */
const FULL_SHA = /^[0-9a-f]{40}$/i;
const IDENT = /^[a-z0-9_.-]+$/i;

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

/** Repository roots with abbreviated SHAs do not count toward quorum. */
export function canonicalRepositoryRootQualifiesForQuorum(root_id: string): boolean {
  return canonicalizeGitHubRepositoryRoot(root_id).startsWith('sha:');
}

function parseOwnerRepoAtSha(segment: string): string | null {
  const at = segment.lastIndexOf('@');
  if (at <= 0 || at >= segment.length - 1) return null;
  const sha = segment.slice(at + 1);
  if (!FULL_SHA.test(sha)) return null;
  const repoPath = segment.slice(0, at);
  const slash = repoPath.lastIndexOf('/');
  if (slash <= 0) return null;
  const owner = repoPath.slice(0, slash);
  const repo = repoPath.slice(slash + 1);
  if (!IDENT.test(owner) || !IDENT.test(repo)) return null;
  return `${owner.toLowerCase()}/${repo.toLowerCase()}@${sha.toLowerCase()}`;
}

function parseGitHubCommitUrl(raw: string): string | null {
  const marker = 'github.com/';
  const idx = raw.toLowerCase().indexOf(marker);
  if (idx < 0) return null;
  const tail = raw.slice(idx + marker.length);
  const commitMarker = '/commit/';
  const cIdx = tail.toLowerCase().indexOf(commitMarker);
  if (cIdx < 0) return null;
  const repoPart = tail.slice(0, cIdx);
  const shaPart = tail.slice(cIdx + commitMarker.length).split(/[/?#]/)[0] ?? '';
  if (!FULL_SHA.test(shaPart)) return null;
  const slash = repoPart.indexOf('/');
  if (slash <= 0) return null;
  const owner = repoPart.slice(0, slash);
  const repo = repoPart.slice(slash + 1);
  if (!IDENT.test(owner) || !IDENT.test(repo)) return null;
  return `${owner.toLowerCase()}/${repo.toLowerCase()}@${shaPart.toLowerCase()}`;
}

function findOwnerRepoBeforeAt(raw: string): { ownerRepo: string; sha: string } | null {
  const at = raw.lastIndexOf('@');
  if (at < 0) return null;
  const sha = raw.slice(at + 1);
  if (!FULL_SHA.test(sha)) return null;
  const before = raw.slice(0, at);
  const slash = before.lastIndexOf('/');
  if (slash <= 0) return null;
  const owner = before.slice(0, slash);
  const repo = before.slice(slash + 1);
  if (!IDENT.test(owner) || !IDENT.test(repo)) return null;
  return { ownerRepo: `${owner}/${repo}`, sha };
}

/**
 * Collapse github:url-*, github:commit-*, github:artifact-*, and owner/repo@sha aliases
 * that refer to the same repository commit. Parsing is bounded (no backtracking regex).
 */
export function canonicalizeGitHubRepositoryRoot(root_id: string): string {
  let raw = root_id.trim();
  if (raw.length > MAX_ROOT_ID_LEN) {
    raw = raw.slice(0, MAX_ROOT_ID_LEN);
  }
  if (/^github:/i.test(raw)) {
    raw = raw.replace(/^github:/i, '').trim();
  }

  const fromUrl = parseGitHubCommitUrl(raw);
  if (fromUrl) {
    const sha = fromUrl.split('@')[1];
    if (sha && commitShaKey(sha)) return commitShaKey(sha)!;
    return fromUrl;
  }

  if (/^artifact:/i.test(raw)) {
    const sub = raw.replace(/^artifact:/i, '');
    const parsed = parseOwnerRepoAtSha(sub);
    if (parsed) {
      const sha = parsed.split('@')[1];
      if (sha && commitShaKey(sha)) return commitShaKey(sha)!;
      return parsed;
    }
  }

  const direct = parseOwnerRepoAtSha(raw);
  if (direct) {
    const sha = direct.split('@')[1];
    if (sha && commitShaKey(sha)) return commitShaKey(sha)!;
    return direct;
  }

  const tail = findOwnerRepoBeforeAt(raw);
  if (tail) {
    const keyed = commitShaKey(tail.sha);
    if (keyed) return keyed;
    return `${tail.ownerRepo.toLowerCase()}@${tail.sha.toLowerCase()}`;
  }

  const urlLabel = raw.match(/^url-([0-9a-f]{40})$/i);
  if (urlLabel) {
    return commitShaKey(urlLabel[1].toLowerCase())!;
  }
  const commitLabel = raw.match(/^commit-([0-9a-f]{40})$/i);
  if (commitLabel) {
    return commitShaKey(commitLabel[1].toLowerCase())!;
  }

  return raw.toLowerCase();
}

/** Single dedup bucket per commit when a 40-char SHA is known (Z-002). */
function commitShaKey(sha: string): string | null {
  if (!FULL_SHA.test(sha)) return null;
  return `sha:${sha}`;
}

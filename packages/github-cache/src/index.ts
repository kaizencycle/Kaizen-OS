/**
 * @mobius/github-cache — federated cold cache on Mobius-Substrate/STATE/
 *
 * READ:  raw.githubusercontent.com (CDN, no auth on public repos)
 * WRITE: GitHub Contents API (requires PAT with contents:write)
 */

export type GithubCacheConfig = {
  owner?: string;
  repo?: string;
  branch?: string;
  pat?: string;
  userAgent?: string;
};

function resolveConfig(overrides?: GithubCacheConfig) {
  const owner = overrides?.owner ?? process.env.GH_CACHE_OWNER ?? 'kaizencycle';
  const repo = overrides?.repo ?? process.env.GH_CACHE_REPO ?? 'Mobius-Substrate';
  const branch = overrides?.branch ?? process.env.GH_CACHE_BRANCH ?? 'main';
  const pat =
    overrides?.pat ??
    process.env.GH_CACHE_PAT ??
    process.env.SUBSTRATE_GITHUB_TOKEN ??
    process.env.GITHUB_TOKEN;
  const userAgent = overrides?.userAgent ?? 'mobius-github-cache';
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/STATE`;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/STATE`;
  return { owner, repo, branch, pat, userAgent, rawBase, apiBase };
}

export async function ghRead<T>(
  path: string,
  opts?: { ttlSeconds?: number; config?: GithubCacheConfig },
): Promise<T | null> {
  const { rawBase } = resolveConfig(opts?.config);
  try {
    const init: RequestInit =
      typeof globalThis !== 'undefined' && 'Request' in globalThis
        ? { next: { revalidate: opts?.ttlSeconds ?? 60 } as { revalidate: number } }
        : { cache: 'no-store' };
    const res = await fetch(`${rawBase}/${path}`, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function ghWrite(
  path: string,
  data: unknown,
  message: string,
  config?: GithubCacheConfig,
): Promise<boolean> {
  const { apiBase, branch, pat, userAgent } = resolveConfig(config);
  if (!pat?.trim()) {
    console.warn('[github-cache] no PAT — skipping write', path);
    return false;
  }

  const apiUrl = `${apiBase}/${path}`;
  const content = Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${pat.trim()}`,
    'Content-Type': 'application/json',
    'User-Agent': userAgent,
    'X-GitHub-Api-Version': '2022-11-28',
  };

  try {
    const existing = await fetch(apiUrl, { headers }).then((r) =>
      r.ok ? (r.json() as Promise<{ sha: string }>) : null,
    );

    const body: Record<string, unknown> = {
      message: `${message} [skip ci]`,
      content,
      branch,
    };
    if (existing?.sha) body.sha = existing.sha;

    const res = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!res.ok) {
      const err = await res.text();
      console.error(`[github-cache] write failed ${path}: ${res.status} ${err}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[github-cache] write exception ${path}:`, e);
    return false;
  }
}

/**
 * C-322 — GitHub-federated cache for slow-changing Terminal state.
 * Cold store: Mobius-Substrate/STATE/ (CDN read + Contents API write).
 */

import type { GIState, GITrendEntry } from '@/lib/kv/store';

const GH_OWNER = process.env.GH_CACHE_OWNER ?? 'kaizencycle';
const GH_REPO = process.env.GH_CACHE_REPO ?? 'Mobius-Substrate';
const GH_BRANCH = process.env.GH_CACHE_BRANCH ?? 'main';
const GH_PAT =
  process.env.GH_CACHE_PAT?.trim() ||
  process.env.SUBSTRATE_GITHUB_TOKEN?.trim() ||
  process.env.GITHUB_TOKEN?.trim();

const RAW_BASE = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/STATE`;
const API_BASE = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/STATE`;

const GH_HEADERS = (): Record<string, string> => ({
  Authorization: GH_PAT ? `Bearer ${GH_PAT}` : '',
  'Content-Type': 'application/json',
  'User-Agent': 'mobius-civic-ai-terminal',
  'X-GitHub-Api-Version': '2022-11-28',
});

export async function ghRead<T>(path: string, revalidateSeconds = 60): Promise<T | null> {
  try {
    const res = await fetch(`${RAW_BASE}/${path}`, {
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function ghWrite(path: string, data: unknown, message: string): Promise<boolean> {
  if (!GH_PAT) {
    console.warn('[github-cache] GH_CACHE_PAT / SUBSTRATE_GITHUB_TOKEN not set — skip write', path);
    return false;
  }

  const apiUrl = `${API_BASE}/${path}`;
  const content = Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64');
  const headers = GH_HEADERS();

  try {
    const existing = await fetch(apiUrl, { headers }).then((r) =>
      r.ok ? (r.json() as Promise<{ sha: string }>) : null,
    );

    const body: Record<string, unknown> = {
      message: `${message} [skip ci]`,
      content,
      branch: GH_BRANCH,
    };
    if (existing?.sha) body.sha = existing.sha;

    const res = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!res.ok) {
      console.error(`[github-cache] write failed ${path}: ${res.status}`, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[github-cache] write exception ${path}:`, e);
    return false;
  }
}

function parseGiStateFromGithub(raw: unknown): GIState | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Record<string, unknown>;
  const gi = v.global_integrity;
  if (typeof gi !== 'number' || !Number.isFinite(gi)) return null;
  const mode = typeof v.mode === 'string' ? v.mode : 'yellow';
  const terminal_status =
    typeof v.terminal_status === 'string' ? v.terminal_status : 'stressed';
  const signals = v.signals && typeof v.signals === 'object' ? (v.signals as GIState['signals']) : {
    quality: 0.5,
    freshness: 0.5,
    stability: 0.5,
    system: 0.5,
  };
  return {
    global_integrity: gi,
    mode,
    terminal_status,
    primary_driver: typeof v.primary_driver === 'string' ? v.primary_driver : 'GitHub STATE cache',
    source: (v.source === 'live' || v.source === 'mock' || v.source === 'cached' ? v.source : 'cached') as GIState['source'],
    gi_write_source: v.gi_write_source as GIState['gi_write_source'],
    signals,
    gi_verified: Boolean(v.gi_verified),
    gi_verification_method:
      typeof v.gi_verification_method === 'string' ? v.gi_verification_method : undefined,
    timestamp: typeof v.timestamp === 'string' ? v.timestamp : new Date().toISOString(),
  };
}

export async function ghLoadGiState(): Promise<GIState | null> {
  const raw = await ghRead<unknown>('gi/latest.json', 90);
  return parseGiStateFromGithub(raw);
}

export async function ghLoadGiTrend(): Promise<GITrendEntry[]> {
  const raw = await ghRead<GITrendEntry[] | null>('gi/trend.json', 300);
  return Array.isArray(raw) ? raw : [];
}

export async function mirrorGiStateToGithub(state: GIState): Promise<void> {
  const gi = state.global_integrity;
  const mode = state.mode;
  void ghWrite(
    'gi/latest.json',
    state,
    `state(gi): ${gi} · ${mode}`,
  );
}

export async function mirrorGiTrendToGithub(entries: GITrendEntry[]): Promise<void> {
  void ghWrite('gi/trend.json', entries, 'state(gi): update trend');
}

export type LastKnownSnapshot = { gi?: number; cycle?: string; runtime?: string; ts?: number };

export async function ghLoadLastKnownSnapshot(): Promise<LastKnownSnapshot | null> {
  return ghRead<LastKnownSnapshot>('terminal/last-known-snapshot.json', 120);
}

export async function mirrorLastKnownSnapshotToGithub(payload: LastKnownSnapshot): Promise<void> {
  void ghWrite('terminal/last-known-snapshot.json', payload, 'state(terminal): last-known-snapshot');
}

export async function mirrorHeartbeatMetaToGithub(payload: {
  cycleId?: string;
  gi: number | null;
  timestamp: string;
}): Promise<void> {
  void ghWrite('terminal/heartbeat-last.json', payload, 'state(terminal): heartbeat');
}

export async function mirrorEpiconEscalationToGithub(payload: unknown): Promise<void> {
  void ghWrite('watchdog/epicon-escalation.json', payload, 'state(watchdog): epicon escalation');
}

export async function mirrorZeusDisputeToGithub(payload: unknown): Promise<void> {
  void ghWrite('zeus/dispute-latest.json', payload, 'state(zeus): dispute');
}

export async function mirrorPromotionRunToGithub(payload: unknown): Promise<void> {
  void ghWrite('terminal/last-promotion-run.json', payload, 'state(epicon): promotion run');
}

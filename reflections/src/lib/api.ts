// reflections/src/lib/api.ts
// Single source of truth for all front-end API calls (Lab4, Lab6, Ledger)

import axios, { AxiosRequestConfig } from 'axios';

/** ---------- Environment ---------- */
const LAB4  = process.env.NEXT_PUBLIC_API_LAB4  || '';   // e.g. https://hive-api-2le8.onrender.com
const LAB6  = process.env.NEXT_PUBLIC_API_LAB6  || '';   // e.g. https://lab6-proof-api.onrender.com
const LEDGER = process.env.NEXT_PUBLIC_API_LEDGER || ''; // e.g. https://civic-protocol-core-ledger.onrender.com

/** ---------- Auth helpers ---------- */
function getToken(): string | null {
  // Try civic session first; fall back to admin token if present
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('civic_token') ||
    localStorage.getItem('admin_token') ||
    null
  );
}

function authHeaders(extra?: Record<string, string>) {
  const tok = getToken();
  return {
    ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
    ...(extra || {}),
  };
}

/** Generic request with auth (optional) */
async function withAuth<T = any>(cfg: AxiosRequestConfig): Promise<T> {
  const headers = { ...(cfg.headers || {}), ...authHeaders() };
  const { data } = await axios({ ...cfg, headers });
  return data as T;
}

/** ---------- Types (lightweight) ---------- */
export type ReflectionItem = {
  content: string;
  timestamp: string;
  companion?: boolean;
};

export type Companion = { name: string };

/** =========================================================================
 *  Lab4 – Reflections & Companion
 *  =======================================================================*/

/** Get latest reflections */
export async function getReflections(): Promise<ReflectionItem[]> {
  try {
    // TODO: replace stub with your real endpoint once available:
    // const data = await withAuth<{ items: ReflectionItem[] }>({ url: `${LAB4}/reflections`, method: 'GET' });
    // return data.items ?? [];
    return []; // stub to keep builds green
  } catch {
    return [];
  }
}

/** Save a reflection (alias: saveReflection for older components) */
export async function postReflection(content: string): Promise<{ ok: boolean }> {
  try {
    // await withAuth({ url: `${LAB4}/reflections`, method: 'POST', data: { content } });
    return { ok: true }; // stub
  } catch {
    return { ok: false };
  }
}
export const saveReflection = postReflection; // <- keep older imports working

/** Soft logout */
export async function logoutSoft(): Promise<void> {
  try {
    // await withAuth({ url: `${LAB4}/auth/logout_soft`, method: 'POST' });
  } catch {/* ignore */}
}

/** Current companion */
export async function getCompanion(): Promise<Companion> {
  try {
    // const data = await withAuth<Companion>({ url: `${LAB4}/companions/current`, method: 'GET' });
    // return data;
    return { name: 'Companion' }; // stub
  } catch {
    return { name: 'Companion' };
  }
}

/** Ask companion to reply */
export async function companionRespond(): Promise<{ ok: boolean; response: string }> {
  try {
    // const data = await withAuth<{ reply: string }>({ url: `${LAB4}/companions/respond`, method: 'POST' });
    // return { ok: true, response: data.reply };
    return { ok: true, response: 'I hear you. What would you like to explore next?' }; // stub
  } catch {
    return { ok: false, response: '' };
  }
}

/** Memory ops */
export async function memoryAppend(
  items: Array<{ type: 'reflection' | 'reply' | string; content: string }>
): Promise<{ ok: boolean }> {
  try {
    // await withAuth({ url: `${LAB4}/memory/append`, method: 'POST', data: { items } });
    return { ok: true }; // stub
  } catch {
    return { ok: false };
  }
}

export async function memorySummarize(): Promise<{ ok: boolean }> {
  try {
    // await withAuth({ url: `${LAB4}/memory/summarize`, method: 'POST' });
    return { ok: true }; // stub
  } catch {
    return { ok: false };
  }
}

/** Token refresh used by useTokenRefresh hook */
export async function refreshToken(): Promise<{ ok: boolean; token?: string }> {
  try {
    // const data = await withAuth<{ token: string }>({ url: `${LAB4}/auth/refresh`, method: 'POST' });
    // if (typeof window !== 'undefined') localStorage.setItem('civic_token', data.token);
    return { ok: true }; // stub
  } catch {
    return { ok: false };
  }
}

/** =========================================================================
 *  Ledger – anchoring / attest (and legacy alias)
 *  =======================================================================*/

/** Attest/anchor something to the ledger */
export async function anchorReflection(payload: any): Promise<{ ok: boolean }> {
  try {
    // await withAuth({ url: `${LEDGER}/ledger/attest`, method: 'POST', data: payload });
    return { ok: true }; // stub
  } catch {
    return { ok: false };
  }
}

/** =========================================================================
 *  Lab6 – (placeholder hooks for Citizen Shield)
 *  =======================================================================*/

export async function lab6Enroll(groupId: string): Promise<{ ok: boolean }> {
  try {
    // await withAuth({ url: `${LAB6}/enroll`, method: 'POST', data: { group_id: groupId } });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** =========================================================================
 *  Lab4 – Agents SDK endpoints
 *  =======================================================================*/

type AgentReply = { ok: boolean; agent?: string; reply?: string; error?: string };

export async function pingAgents(): Promise<{ status: string; agents: string[] }> {
  const base = LAB4;
  if (!base) return { status: 'error', agents: [] };

  const res = await fetch(`${base}/agents/ping`, { method: 'GET' });
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return { status: 'error', agents: [] };
}

export async function sendAgentMessage(agent: string, prompt: string): Promise<AgentReply> {
  const base = LAB4;
  if (!base) return { ok: false, error: 'LAB4 base URL not set' };

  let res: Response;
  try {
    res = await fetch(`${base}/agents/message/${agent}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ prompt }),
    });
  } catch (e: any) {
    return { ok: false, error: `network_error: ${e?.message || String(e)}` };
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = (await res.json()) as AgentReply;
    if (!res.ok) return { ok: false, error: data?.error || `HTTP ${res.status}` };
    return data;
  }
  // Non-JSON (HTML/empty) – make it explicit instead of crashing .json()
  const text = await res.text();
  return { ok: false, error: text || `HTTP ${res.status} (non-JSON)` };
}

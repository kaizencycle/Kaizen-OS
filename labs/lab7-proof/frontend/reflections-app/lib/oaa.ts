const BASE = process.env.NEXT_PUBLIC_OAA_API_BASE!;

async function j<T>(p: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${p}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  return r.json() as Promise<T>;
}

export const oaa = {
  health: () => j<{ok:boolean; ts:string}>('/health'),
  keys:   () => j<any>('/.well-known/oaa-keys.json'),
  filter: (body: any) => j<any>('/oaa/filter', { method:'POST', body: JSON.stringify(body) }),
  ingest: (body: any) => j<any>('/oaa/ingest/snapshot', { method:'POST', body: JSON.stringify(body) }),
  verify: (body: any) => j<any>('/oaa/verify', { method:'POST', body: JSON.stringify(body) }),
  sources: () => j<any>('/oaa/sources'),
};

export default oaa;

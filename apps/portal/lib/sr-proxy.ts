// apps/portal/lib/sr-proxy.ts
export async function fetchSRList(limit = 10) {
  const url = `/api/sr?kind=situational_report&limit=${limit}`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : (data.items || []);
}

export async function fetchSRItem(id: string) {
  const r = await fetch(`/api/sr/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!r.ok) return null;
  return await r.json();
}

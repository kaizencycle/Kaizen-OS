// apps/portal/lib/integrity.ts
const BASE = process.env.NEXT_PUBLIC_INTEGRITY_FEED_BASE || '';

export type SRItem = {
  event_id: string;
  kind: 'situational_report' | string;
  source: string;            // "JADE"
  gi: number;
  timestamp: string;
  details: {
    subject?: string;
    cycle?: string;
    verdict?: 'Adopt' | 'Shadow Deploy' | 'Defer' | string;
    canary_ratio?: number;
    markdown?: string;
    [k: string]: any;
  };
};

export async function listSR(limit = 50): Promise<SRItem[]> {
  // Assumes feed endpoint supports query params (?kind=situational_report&limit=50)
  const url = `${BASE}/public_integrity_feed?kind=situational_report&limit=${limit}`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return [];
  const data = await r.json();
  // Normalize: expect array of events
  return Array.isArray(data) ? data : (data.items || []);
}

export async function readSR(id: string): Promise<SRItem | null> {
  const url = `${BASE}/public_integrity_feed/${encodeURIComponent(id)}`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return null;
  const item = await r.json();
  return item?.event_id ? item as SRItem : null;
}

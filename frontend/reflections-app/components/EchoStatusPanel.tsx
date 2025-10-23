'use client';

import { useEffect, useState } from 'react';

type ServiceState = {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  latency_ms?: number | null;
  error?: string | null;
};

type EchoPulse = {
  timestamp: string;
  kind: 'echo_heartbeat';
  services: Record<'Lab4'|'Lab6'|'CivicLedger'|'GICIndexer'|'Lab7', ServiceState>;
  summary: { up: string[]; down: string[] };
  global_health?: { attached: boolean; fingerprint_sha256?: string | null };
  fingerprint_sha256: string;
};

function badgeColor(s: ServiceState) {
  if (!s || s.status === 'UNKNOWN') return 'bg-gray-400';
  if (s.status === 'UP') return 'bg-green-500';
  return 'bg-red-500';
}

function prettyLatency(ms?: number | null) {
  if (ms == null) return '—';
  return `${ms.toFixed(0)} ms`;
}

export default function EchoStatusPanel({
  endpoint = '/api/echo/latest',   // you can point this to Lab7's OAA endpoint if you surface one, e.g. https://lab7-proof.onrender.com/oaa/echo/latest
  title = 'Echo Pulse — System Health'
}: { endpoint?: string; title?: string }) {
  const [pulse, setPulse] = useState<EchoPulse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function fetchPulse() {
      try {
        setLoading(true);
        const r = await fetch(endpoint, { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (alive) setPulse(data);
      } catch (e: any) {
        if (alive) setErr(e.message || 'Fetch error');
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchPulse();
    const id = setInterval(fetchPulse, 60_000); // refresh every minute
    return () => { alive = false; clearInterval(id); };
  }, [endpoint]);

  const items: Array<[keyof EchoPulse['services'], string]> = [
    ['Lab4', 'Lab4 — Reflections'],
    ['Lab6', 'Lab6 — Citizen Shield'],
    ['CivicLedger', 'Civic Ledger — Core'],
    ['GICIndexer', 'GIC Indexer — Economy'],
    ['Lab7', 'Lab7 — OAA'],
  ];

  return (
    <div className="rounded-xl border border-neutral-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {pulse && (
          <div className="text-xs text-neutral-500">
            {new Date(pulse.timestamp).toLocaleString()} · SHA256 {pulse.fingerprint_sha256.slice(0,8)}…
          </div>
        )}
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading latest pulse…</div>}
      {err && <div className="text-sm text-red-600">Error: {err}</div>}

      {pulse && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map(([key, label]) => {
            const s = pulse.services[key];
            return (
              <div key={key} className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3">
                <div className={`h-3 w-3 rounded-full ${badgeColor(s)}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-neutral-500">
                    {s?.status || 'UNKNOWN'} · {prettyLatency(s?.latency_ms)}
                    {s?.error ? ` · ${s.error}` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pulse?.global_health?.attached && (
        <div className="mt-3 text-xs text-neutral-500">
          Global Health attached · SHA256 {pulse.global_health.fingerprint_sha256?.slice(0,8)}…
        </div>
      )}
    </div>
  );
}

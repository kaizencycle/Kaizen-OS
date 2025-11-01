// apps/portal/components/SRMiniCard.tsx
'use client';

import Link from 'next/link';
import SRBadge from './SRBadge';

export type SRMini = {
  event_id: string;
  source?: string;           // Expected: "JADE"
  gi?: number;
  timestamp?: string;
  details?: {
    subject?: string;
    cycle?: string;
    verdict?: string;
    summary?: string;        // Optional short summary if present
  };
};

export default function SRMiniCard({ sr }: { sr: SRMini }) {
  const t = sr.timestamp ? new Date(sr.timestamp).toLocaleString() : '—';
  const gi = typeof sr.gi === 'number' ? sr.gi.toFixed(3) : '—';
  const subject = sr.details?.subject || 'Situational Report';
  const cycle = sr.details?.cycle || '—';
  const summary = sr.details?.summary;

  return (
    <div className="rounded-lg border border-zinc-800 p-4 bg-zinc-950/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/consensus/sr/${sr.event_id}`}
            className="text-base font-semibold hover:underline"
          >
            {subject}
          </Link>
          <div className="text-xs text-zinc-400 mt-1">
            Cycle {cycle} · GI {gi} · {t}
          </div>
        </div>
        <SRBadge verdict={sr.details?.verdict} />
      </div>

      {summary && (
        <p className="text-sm text-zinc-300 mt-3 line-clamp-3">
          {summary}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <Link
          href={`/consensus/sr/${sr.event_id}`}
          className="text-emerald-400 text-sm hover:underline"
        >
          Open report →
        </Link>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(sr.event_id);
            alert('Event ID copied');
          }}
          className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
        >
          Copy ID
        </button>
      </div>
    </div>
  );
}

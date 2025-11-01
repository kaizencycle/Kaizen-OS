// apps/portal/app/consensus/sr/page.tsx
import Link from 'next/link';
import { listSR } from '@/lib/integrity';
import SRBadge from '@/components/SRBadge';

export const dynamic = 'force-dynamic';

export default async function SRIndexPage() {
  const items = await listSR(100);
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Situational Reports</h1>
      <p className="text-sm text-zinc-400 mb-6">
        JADE-authored reports for LLM/provider updates. Auto-posted to the Integrity Feed.
      </p>

      <ul className="divide-y divide-zinc-800">
        {items.map((e) => (
          <li key={e.event_id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <Link href={`/consensus/sr/${e.event_id}`} className="text-lg font-semibold hover:underline">
                  {e.details?.subject || e.event_id}
                </Link>
                <div className="text-xs text-zinc-400 mt-1">
                  Cycle {e.details?.cycle || '—'} · GI {e.gi?.toFixed?.(3) ?? '—'} · {new Date(e.timestamp).toLocaleString()}
                </div>
              </div>
              <SRBadge verdict={e.details?.verdict} />
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-6 text-sm text-zinc-400">No reports yet.</li>
        )}
      </ul>
    </main>
  );
}

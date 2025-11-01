// apps/portal/app/consensus/sr/[id]/page.tsx
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { readSR } from '@/lib/integrity';
import SRBadge from '@/components/SRBadge';
import { SRHeader } from '@/components/SRHeader';
import { SRDetailClient } from './client';

export const dynamic = 'force-dynamic';

export default async function SRDetailPage({ params }: { params: { id: string }}) {
  const item = await readSR(params.id);
  if (!item) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Report not found</h1>
        <p className="text-sm text-zinc-400 mt-2">Event ID: {params.id}</p>
        <Link href="/consensus/sr" className="text-emerald-400 underline mt-6 inline-block">← Back to reports</Link>
      </main>
    );
  }

  const ledgerBase = process.env.NEXT_PUBLIC_INTEGRITY_FEED_BASE || '';
  const ledgerView = `${ledgerBase}/public_integrity_feed/${encodeURIComponent(item.event_id)}`;
  const md = item.details?.markdown || '_No Markdown body attached to this event._';

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <SRHeader
          subject={item.details?.subject}
          cycle={item.details?.cycle}
          gi={item.gi}
          timestamp={item.timestamp}
          eventId={item.event_id}
        />
        <SRBadge verdict={item.details?.verdict} />
      </div>

      <div className="mt-4 text-sm text-zinc-400">
        <span className="mr-2">Source: {item.source || '—'}</span>
        {typeof item.details?.canary_ratio === 'number' && (
          <span>· Canary: {(item.details.canary_ratio * 100).toFixed(0)}%</span>
        )}
      </div>

      <article className="prose prose-invert mt-8 max-w-none">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{md}</ReactMarkdown>
      </article>

      <SRDetailClient eventId={item.event_id} ledgerView={ledgerView} />
    </main>
  );
}

// apps/portal/app/consensus/sr/[id]/client.tsx
'use client';

import Link from 'next/link';

export function SRDetailClient({ eventId, ledgerView }: { eventId: string; ledgerView: string }) {
  return (
    <div className="mt-8 flex items-center gap-3">
      <Link
        href="/consensus/sr"
        className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm"
      >
        ← Back
      </Link>
      <a
        href={ledgerView}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm text-white"
      >
        View on Ledger
      </a>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(eventId);
          alert('Event ID copied');
        }}
        className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm"
      >
        Copy Event ID
      </button>
    </div>
  );
}

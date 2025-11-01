'use client';
export default function SRBadge({ verdict }: { verdict?: string }) {
  const v = (verdict || '').toLowerCase();
  const color =
    v.includes('adopt') ? 'bg-emerald-600' :
    v.includes('shadow') ? 'bg-amber-600' :
    v.includes('defer') ? 'bg-rose-600' : 'bg-gray-600';
  return (
    <span className={`inline-block text-xs font-semibold text-white px-2 py-1 rounded ${color}`}>
      {verdict || 'Unknown'}
    </span>
  );
}

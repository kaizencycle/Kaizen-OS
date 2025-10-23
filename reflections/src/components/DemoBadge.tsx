'use client';

export default function DemoBadge() {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (!isDemo) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 50,
        padding: '6px 10px',
        borderRadius: 8,
        border: '1px solid #10b981',
        background: 'rgba(16,185,129,.12)',
        color: '#10b981',
        fontSize: 12,
        fontWeight: 700,
        backdropFilter: 'blur(6px)',
      }}
      title="Rewards are using demo amounts & min length."
    >
      🟢 DEMO MODE ACTIVE
    </div>
  );
}

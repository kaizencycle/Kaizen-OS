'use client';

import { useEffect, useState } from 'react';
import { fetchLiveConfig, type LiveConfig } from '@/lib/config';

export default function StatusBar() {
  const [cfg, setCfg] = useState<LiveConfig | null>(null);

  useEffect(() => {
    fetchLiveConfig().then(setCfg);
  }, []);

  if (!cfg) return null;

  const pill = (label: string) => (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 999,
      border: '1px solid #333',
      marginRight: 8,
      fontSize: 12,
      opacity: 0.9
    }}>{label}</span>
  );

  return (
    <div style={{
      position: 'fixed',
      bottom: 12,
      left: 12,
      right: 12,
      margin: '0 auto',
      maxWidth: 900,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 12px',
      borderRadius: 10,
      background: 'rgba(20,20,24,.6)',
      border: '1px solid #2a2a2a',
      backdropFilter: 'blur(8px)',
      color: '#cfd3d8',
      zIndex: 40
    }}>
      {pill(cfg.demo_mode ? '🟢 DEMO MODE' : '🔵 PROD')}
      {pill(`Min Len: ${cfg.reward_min_len}`)}
      {pill(`GIC Private: +${cfg.gic_per_private}`)}
      {pill(`GIC Publish: +${cfg.gic_per_publish}`)}
    </div>
  );
}

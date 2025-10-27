'use client';
import { useEffect, useState } from 'react';

export function HealthBadge() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'degraded' | 'down'>('loading');
  
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_BASE + '/v1/status')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => setStatus('ok'))
      .catch(() => setStatus('degraded'));
  }, []);

  const statusClasses = {
    ok: 'bg-green-100 text-green-800 border-green-200',
    degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    down: 'bg-red-100 text-red-800 border-red-200',
    loading: 'bg-slate-100 text-slate-700 border-slate-200'
  }[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusClasses}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${
        status === 'ok' ? 'bg-green-500' : 
        status === 'degraded' ? 'bg-yellow-500' : 
        status === 'down' ? 'bg-red-500' : 'bg-slate-400'
      }`} />
      Gateway: {status}
    </span>
  );
}
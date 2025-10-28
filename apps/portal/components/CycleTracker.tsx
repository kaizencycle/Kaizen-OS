'use client';
import { useEffect, useState } from 'react';

type Tracker = {
  cycle: string;          // e.g., "C-118"
  gi: number;             // e.g., 0.993
  room: string;           // e.g., "Consensus Chamber"
};

type CycleTrackerProps = {
  cycle?: string;
  gi?: number;
  room?: string;
  autoFetch?: boolean;
};

export default function CycleTracker(props?: CycleTrackerProps) {
  const [now, setNow] = useState(new Date());
  const [tracker, setTracker] = useState<Tracker>({
    cycle: props?.cycle ?? 'C-118',
    gi: props?.gi ?? 0.993,
    room: props?.room ?? 'Consensus Chamber',
  });

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Try to fetch live cycle if available; otherwise keep defaults
    if (props?.autoFetch !== false) {
      (async () => {
        try {
          const r = await fetch('/api/cycle/current', { cache: 'no-store' });
          if (r.ok) {
            const j = await r.json();
            setTracker({
              cycle: j.cycle ?? tracker.cycle,
              gi:    j.gi    ?? tracker.gi,
              room:  j.room  ?? tracker.room,
            });
          }
        } catch { /* keep defaults */ }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const date = now.toLocaleDateString(undefined, { year:'numeric', month:'2-digit', day:'2-digit' });
  const time = now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });

  return (
    <div style={{border:'1px solid #e5e7eb', padding:'16px', borderRadius:8, backgroundColor: '#fafafa'}}>
      <pre style={{margin:0, whiteSpace:'pre-wrap', fontFamily: 'monospace', fontSize: '14px'}}>
{`🕓  CYCLE LOG
──────────────────────────────
Date: ${date}
Time: ${time}
Cycle ID: ${tracker.cycle}
Status: Active
Integrity: ${tracker.gi.toFixed(3)}
Host: Kaizen OS — ${tracker.room}
──────────────────────────────
"Consistency becomes proof of life."`}
      </pre>
    </div>
  );
}

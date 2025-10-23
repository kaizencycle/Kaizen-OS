import { useState, useEffect } from 'react';

interface GuardStatus {
  noopCount: number;
  maxNoop: number;
  lastHash: string;
  nextAllowedAt: number;
  cooldownSec: number;
}

export default function AgentStatusBanner() {
  const [status, setStatus] = useState<GuardStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [loopGuardRes, cooldownRes] = await Promise.all([
          fetch('/api/dev/loop-guard'),
          fetch('/api/dev/agent-cooldown')
        ]);
        
        if (loopGuardRes.ok && cooldownRes.ok) {
          const [loopGuard, cooldown] = await Promise.all([
            loopGuardRes.json(),
            cooldownRes.json()
          ]);
          
          setStatus({
            noopCount: loopGuard.noopCount || 0,
            maxNoop: loopGuard.maxNoop || 3,
            lastHash: loopGuard.lastHash || '',
            nextAllowedAt: cooldown.nextAllowedAt || 0,
            cooldownSec: cooldown.cooldownSec || 240
          });
        }
      } catch (error) {
        console.error('Failed to fetch agent status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !status) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const cooldownRemaining = Math.max(0, status.nextAllowedAt - now);
  const cooldownMinutes = Math.ceil(cooldownRemaining / 60);
  
  const noopRatio = status.noopCount / status.maxNoop;
  const isNearLimit = noopRatio >= 0.7;
  const isAtLimit = status.noopCount >= status.maxNoop;

  return (
    <div style={{
      marginBottom: 20,
      padding: 12,
      background: isAtLimit ? '#2d1b1b' : isNearLimit ? '#2d2b1b' : '#1b2d1b',
      border: `1px solid ${isAtLimit ? '#ff6a6a' : isNearLimit ? '#ffaa6a' : '#6aff6a'}`,
      borderRadius: 8,
      fontSize: 14
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>🤖 Agent Status</strong>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
            Noop: {status.noopCount}/{status.maxNoop} 
            {cooldownRemaining > 0 && ` • Cooldown: ${cooldownMinutes}m`}
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {isAtLimit ? '🚫 BLOCKED' : isNearLimit ? '⚠️ WARNING' : '✅ READY'}
        </div>
      </div>
      {status.lastHash && (
        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6, fontFamily: 'monospace' }}>
          Last: {status.lastHash.slice(0, 8)}...
        </div>
      )}
    </div>
  );
}
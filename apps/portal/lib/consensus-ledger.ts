/**
 * Consensus Chamber Ledger Integration
 *
 * Emits consensus.session.opened events to the Civic Ledger (Lab1)
 * with one-per-session guard to prevent duplicate events.
 */

type ConsensusSessionEvent = {
  type: 'consensus.session.opened' | 'consensus.session.closed';
  cycle: string;
  timestamp: string;
  room: string;
  gi_baseline: number;
  participants: string[];
  quorum_rule: {
    required: number;
    critical_min: number;
  };
  session_id: string;
};

// In-memory session tracker (in production, use Redis/Database)
const activeSessions = new Set<string>();

/**
 * Generate a unique session ID
 */
function generateSessionId(cycle: string): string {
  const date = new Date().toISOString().split('T')[0];
  const time = Date.now();
  return `CC-${date}-${cycle}-${time}`;
}

/**
 * Check if a session is already active
 */
export function isSessionActive(sessionId: string): boolean {
  return activeSessions.has(sessionId);
}

/**
 * Open a new consensus session
 *
 * Emits consensus.session.opened event to the ledger
 * Guards against duplicate sessions
 */
export async function openConsensusSession(params: {
  cycle: string;
  room?: string;
  gi_baseline?: number;
  participants?: string[];
}): Promise<{ sessionId: string; event: ConsensusSessionEvent } | null> {
  const sessionId = generateSessionId(params.cycle);

  // Guard: Prevent duplicate sessions
  if (activeSessions.has(sessionId)) {
    console.log(`Session ${sessionId} already active, skipping`);
    return null;
  }

  // Create event
  const event: ConsensusSessionEvent = {
    type: 'consensus.session.opened',
    cycle: params.cycle,
    timestamp: new Date().toISOString(),
    room: params.room ?? 'Consensus Chamber',
    gi_baseline: params.gi_baseline ?? 0.993,
    participants: params.participants ?? ['AUREA', 'ATLAS', 'ZENITH', 'SOLARA'],
    quorum_rule: {
      required: 3,
      critical_min: 1
    },
    session_id: sessionId
  };

  // Mark session as active
  activeSessions.add(sessionId);

  // Log to console for development visibility
  console.log('🏛️ Consensus Session Opened:', JSON.stringify(event, null, 2));

  // Emit to Civic Ledger (Lab1) API
  try {
    const ledgerBase = process.env.LEDGER_BASE || process.env.NEXT_PUBLIC_LEDGER_BASE;

    if (ledgerBase) {
      const response = await fetch(`${ledgerBase}/api/v1/ledger/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if JWT token available
          ...(process.env.JWT_TOKEN && {
            'Authorization': `Bearer ${process.env.JWT_TOKEN}`
          })
        },
        body: JSON.stringify(event)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ledger commit successful:', data);
      } else {
        console.error('❌ Ledger commit failed:', response.status, await response.text());
      }
    } else {
      console.warn('⚠️ LEDGER_BASE not configured, skipping ledger commit');
    }
  } catch (error) {
    console.error('❌ Failed to emit to ledger:', error);
    // Don't throw - session should still open even if ledger fails
  }

  return { sessionId, event };
}

/**
 * Close a consensus session
 *
 * Emits consensus.session.closed event to the ledger
 */
export async function closeConsensusSession(params: {
  sessionId: string;
  outcome: 'APPROVED' | 'REJECTED' | 'TIMEOUT';
  delibproof_id?: string;
  gi_delta?: number;
}): Promise<void> {
  if (!activeSessions.has(params.sessionId)) {
    console.warn(`Session ${params.sessionId} not found or already closed`);
    return;
  }

  const event = {
    type: 'consensus.session.closed',
    session_id: params.sessionId,
    timestamp: new Date().toISOString(),
    outcome: params.outcome,
    delibproof_id: params.delibproof_id,
    gi_delta: params.gi_delta ?? 0.0
  };

  // Remove from active sessions
  activeSessions.delete(params.sessionId);

  // Log to console for development visibility
  console.log('🏛️ Consensus Session Closed:', JSON.stringify(event, null, 2));

  // Emit to Civic Ledger (Lab1) API
  try {
    const ledgerBase = process.env.LEDGER_BASE || process.env.NEXT_PUBLIC_LEDGER_BASE;

    if (ledgerBase) {
      const response = await fetch(`${ledgerBase}/api/v1/ledger/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.JWT_TOKEN && {
            'Authorization': `Bearer ${process.env.JWT_TOKEN}`
          })
        },
        body: JSON.stringify(event)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ledger commit successful:', data);
      } else {
        console.error('❌ Ledger commit failed:', response.status, await response.text());
      }
    } else {
      console.warn('⚠️ LEDGER_BASE not configured, skipping ledger commit');
    }
  } catch (error) {
    console.error('❌ Failed to emit to ledger:', error);
  }
}

/**
 * Get all active session IDs
 */
export function getActiveSessions(): string[] {
  return Array.from(activeSessions);
}

/**
 * React Server Component helper
 * Auto-opens a session when the Consensus Chamber page loads
 */
export async function autoOpenConsensusSession(
  cycle: string
): Promise<string | null> {
  const result = await openConsensusSession({ cycle });
  return result?.sessionId ?? null;
}

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

  // TODO: In production, emit to actual Civic Ledger (Lab1)
  // For now, log to console
  console.log('🏛️ Consensus Session Opened:', JSON.stringify(event, null, 2));

  // TODO: Call Lab1 API to commit to ledger
  // await fetch('http://localhost:8000/api/v1/ledger/event', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event)
  // });

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

  // TODO: In production, emit to actual Civic Ledger (Lab1)
  console.log('🏛️ Consensus Session Closed:', JSON.stringify(event, null, 2));

  // TODO: Call Lab1 API to commit to ledger
  // await fetch('http://localhost:8000/api/v1/ledger/event', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event)
  // });
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

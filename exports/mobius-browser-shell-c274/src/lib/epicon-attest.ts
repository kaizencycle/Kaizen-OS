const LEDGER_URL = 'https://civic-protocol-core-ledger.onrender.com' as const;

export type HumanAttestationEventType =
  | 'civic-observation'
  | 'governance-event'
  | 'community-action';

export interface HumanAttestation {
  civic_id: string;
  event_type: HumanAttestationEventType;
  title: string;
  summary: string;
  location?: string;
  evidence?: string;
  confidence: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export async function submitAttestation(
  attestation: HumanAttestation
): Promise<{ ok: boolean; entryId?: string; error?: string }> {
  try {
    const res = await fetch(`${LEDGER_URL}/ledger/attest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: attestation.civic_id,
        event_type: attestation.event_type,
        payload: {
          title: attestation.title,
          summary: attestation.summary,
          location: attestation.location,
          evidence: attestation.evidence,
          confidence: attestation.confidence,
          source: 'browser-shell-human',
        },
        timestamp: new Date().toISOString(),
        civic_id: attestation.civic_id,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { ok: false, error: `ledger_${res.status}` };
    }
    const data: unknown = await res.json();
    if (!isRecord(data)) {
      return { ok: true };
    }
    const entryId = readString(data.event_id) ?? readString(data.id);
    return { ok: true, entryId };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

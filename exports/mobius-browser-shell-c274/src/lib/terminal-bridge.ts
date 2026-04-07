const TERMINAL_SNAPSHOT =
  'https://mobius-civic-ai-terminal.vercel.app/api/terminal/snapshot' as const;

export type TerminalIntegrityMode = 'green' | 'yellow' | 'red';

export interface TerminalState {
  gi: number;
  mode: TerminalIntegrityMode;
  cycle: string;
  sentiment: Record<string, { score: number; agent: string }>;
  anomalies: Array<{ label: string; severity: string }>;
  echo: {
    totalIngested: number;
    avgMii: number;
  };
  timestamp: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function readMode(value: unknown): TerminalIntegrityMode {
  if (value === 'green' || value === 'yellow' || value === 'red') {
    return value;
  }
  return 'yellow';
}

function readAnomalyEntry(value: unknown): { label: string; severity: string } | null {
  if (!isRecord(value)) return null;
  return {
    label: readString(value.label, ''),
    severity: readString(value.severity, ''),
  };
}

function readDomainEntry(
  value: unknown
): { key: string; score: number; agent: string } | null {
  if (!isRecord(value)) return null;
  const key = readString(value.key, '');
  if (!key) return null;
  return {
    key,
    score: readNumber(value.score, 0),
    agent: readString(value.agent, ''),
  };
}

export async function fetchTerminalState(): Promise<TerminalState | null> {
  try {
    const res = await fetch(TERMINAL_SNAPSHOT, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();

    if (!isRecord(data)) return null;

    const integrity = isRecord(data.integrity) ? data.integrity : null;
    const integrityData = integrity && isRecord(integrity.data) ? integrity.data : null;

    const sentiment = isRecord(data.sentiment) ? data.sentiment : null;
    const sentimentData = sentiment && isRecord(sentiment.data) ? sentiment.data : null;
    const domainsRaw = sentimentData?.domains;
    const domains = Array.isArray(domainsRaw) ? domainsRaw : [];

    const signals = isRecord(data.signals) ? data.signals : null;
    const signalsData = signals && isRecord(signals.data) ? signals.data : null;
    const anomaliesRaw = signalsData?.anomalies;
    const anomaliesList = Array.isArray(anomaliesRaw) ? anomaliesRaw : [];

    const echo = isRecord(data.echo) ? data.echo : null;
    const echoData = echo && isRecord(echo.data) ? echo.data : null;
    const echoStatus = echoData && isRecord(echoData.status) ? echoData.status : null;
    const echoIntegrity =
      echoData && isRecord(echoData.integrity) ? echoData.integrity : null;

    const sentimentMap: Record<string, { score: number; agent: string }> = {};
    for (const item of domains) {
      const d = readDomainEntry(item);
      if (d) {
        sentimentMap[d.key] = { score: d.score, agent: d.agent };
      }
    }

    const anomalies: Array<{ label: string; severity: string }> = [];
    for (const item of anomaliesList) {
      const a = readAnomalyEntry(item);
      if (a) anomalies.push(a);
    }

    return {
      gi: integrityData ? readNumber(integrityData.global_integrity, 0) : 0,
      mode: integrityData ? readMode(integrityData.mode) : 'yellow',
      cycle: integrityData ? readString(integrityData.cycle, 'C-?') : 'C-?',
      sentiment: sentimentMap,
      anomalies,
      echo: {
        totalIngested: echoStatus ? readNumber(echoStatus.totalIngested, 0) : 0,
        avgMii: echoIntegrity ? readNumber(echoIntegrity.avgMii, 0) : 0,
      },
      timestamp: readString(data.timestamp, new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

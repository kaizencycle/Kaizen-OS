const LEDGER_BASE_URL = process.env.LEDGER_BASE_URL || 'https://ledger.mobius';

export async function postMicLedgerJson(path: string, body: unknown): Promise<void> {
  const url = `${LEDGER_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ledger MIC POST failed (${path}): ${response.status} ${text}`);
  }
}

export async function postMicLedgerJsonBestEffort(path: string, body: unknown, logLabel: string): Promise<void> {
  try {
    await postMicLedgerJson(path, body);
  } catch (error) {
    console.warn(`[tokenomics-engine] ${logLabel} not persisted:`, error);
  }
}

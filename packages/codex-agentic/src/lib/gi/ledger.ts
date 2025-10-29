/**
 * Civic Ledger Attestation
 * Writes deliberation records to the immutable Civic Ledger
 */

import type { LedgerAttestation } from '../../types';

/**
 * Attest a deliberation result to the Civic Ledger
 * This is fire-and-forget by default to avoid blocking the deliberation flow
 */
export async function attestToLedger(entry: LedgerAttestation): Promise<void> {
  const ledgerBase = process.env.LEDGER_API_BASE;

  if (!ledgerBase) {
    console.warn('[Ledger] LEDGER_API_BASE not set, skipping attestation');
    return;
  }

  try {
    const response = await fetch(`${ledgerBase}/ledger/attest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LEDGER_API_KEY || '',
      },
      body: JSON.stringify({
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error(
        `[Ledger] Attestation failed: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    // Soft fail - don't throw, just log
    console.error('[Ledger] Attestation error:', error);
  }
}

/**
 * Batch attest multiple entries
 */
export async function batchAttest(entries: LedgerAttestation[]): Promise<void> {
  const ledgerBase = process.env.LEDGER_API_BASE;

  if (!ledgerBase) {
    console.warn('[Ledger] LEDGER_API_BASE not set, skipping batch attestation');
    return;
  }

  try {
    const response = await fetch(`${ledgerBase}/ledger/attest/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LEDGER_API_KEY || '',
      },
      body: JSON.stringify({
        entries: entries.map((e) => ({
          ...e,
          timestamp: e.timestamp || new Date().toISOString(),
        })),
      }),
    });

    if (!response.ok) {
      console.error(
        `[Ledger] Batch attestation failed: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error('[Ledger] Batch attestation error:', error);
  }
}

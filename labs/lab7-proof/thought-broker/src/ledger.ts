import fetch from 'node-fetch';

export async function attestDeliberation(ledgerBase: string, token: string, payload: any) {
  try {
    const r = await fetch(`${ledgerBase.replace(/\/$/,'')}/ledger/attest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ "@type": "DeliberationProof", ...payload })
    });
    if (!r.ok) throw new Error(`ledger_http_${r.status}`);
    const j = await r.json();
    return j?.id || 'ledger://proofs/deliberations/mock';
  } catch (e) {
    // best-effort; return a placeholder ref
    return 'ledger://proofs/deliberations/pending';
  }
}

import type { SealRuntimeRecord } from "./types.js";
import {
  listCanonicalSeals,
  loadCanonicalSeal,
  loadReconciliationMeta,
  makeDefaultReconciliationMeta,
  saveReconciliationMeta
} from "./store.js";

export async function loadRuntimeSeal(sealId: string): Promise<SealRuntimeRecord> {
  const seal = await loadCanonicalSeal(sealId);
  let reconciliation = await loadReconciliationMeta(sealId);
  if (!reconciliation) {
    reconciliation = makeDefaultReconciliationMeta(seal);
    await saveReconciliationMeta(sealId, reconciliation);
  }
  return { seal, reconciliation };
}

export async function listQuarantinedSeals(): Promise<SealRuntimeRecord[]> {
  const seals = await listCanonicalSeals();
  const runtime = await Promise.all(seals.map(async (seal) => loadRuntimeSeal(seal.seal_id)));
  return runtime.filter(({ reconciliation }) => reconciliation.status === "quarantined");
}

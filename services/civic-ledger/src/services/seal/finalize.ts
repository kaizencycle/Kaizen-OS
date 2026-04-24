import { loadRuntimeSeal } from "./reconcile.js";
import { saveReconciliationMeta } from "./store.js";

export async function finalizeSeal(sealId: string) {
  const runtime = await loadRuntimeSeal(sealId);

  if (runtime.reconciliation.status === "finalized") {
    return { ok: true, already_finalized: true, seal_id: sealId, reconciliation: runtime.reconciliation };
  }

  if (runtime.reconciliation.status !== "re_attesting_passed") {
    return {
      ok: false,
      reason: "not_ready_for_finalize",
      status: runtime.reconciliation.status,
      seal_id: sealId
    };
  }

  const finalized = {
    ...runtime.reconciliation,
    status: "finalized" as const,
    finalized_at: new Date().toISOString()
  };

  await saveReconciliationMeta(sealId, finalized);

  return {
    ok: true,
    seal_id: sealId,
    reconciliation: finalized,
    ledger_anchor: {
      event: "seal.finalized",
      note: "civic-core anchor stub; integrate signer path next"
    }
  };
}

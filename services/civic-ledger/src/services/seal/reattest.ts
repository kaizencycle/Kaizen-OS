import { attestAtlas, attestHermes, attestZeus } from "./attestors.js";
import { loadRuntimeSeal } from "./reconcile.js";
import { saveReconciliationMeta } from "./store.js";

export async function reattestSeal(sealId: string, forcePass: boolean) {
  const runtime = await loadRuntimeSeal(sealId);

  if (runtime.reconciliation.status !== "quarantined") {
    return { ok: false, reason: "not_quarantined", runtime };
  }

  const nextMeta = {
    ...runtime.reconciliation,
    status: "re_attesting" as const,
    attempt_count: runtime.reconciliation.attempt_count + 1,
    last_attempt_at: new Date().toISOString()
  };
  await saveReconciliationMeta(sealId, nextMeta);

  const zeus = await attestZeus(sealId, forcePass);
  const atlas = await attestAtlas(sealId, forcePass);
  const hermes = await attestHermes(sealId);

  runtime.seal.attestations = {
    ...runtime.seal.attestations,
    ZEUS: zeus,
    ATLAS: atlas,
    HERMES: hermes
  };

  const passed = zeus.verdict === "pass" && atlas.verdict === "pass";
  const finalMeta = {
    ...nextMeta,
    status: passed ? ("re_attesting_passed" as const) : ("quarantined" as const),
    last_attempt_result: passed ? ("pass" as const) : ("fail" as const),
    failed_at: passed ? null : runtime.reconciliation.failed_at
  };

  await saveReconciliationMeta(sealId, finalMeta);

  return {
    ok: true,
    passed,
    seal_id: sealId,
    status: finalMeta.status,
    attestations: {
      ZEUS: zeus,
      ATLAS: atlas,
      HERMES: hermes
    },
    reconciliation: finalMeta
  };
}

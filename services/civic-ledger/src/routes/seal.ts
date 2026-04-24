import type { Request, Response } from "express";
import { finalizeSeal } from "../services/seal/finalize.js";
import { listQuarantinedSeals } from "../services/seal/reconcile.js";
import { reattestSeal } from "../services/seal/reattest.js";

export async function listQuarantineRoute(_req: Request, res: Response) {
  try {
    const items = await listQuarantinedSeals();
    return res.json({
      ok: true,
      items: items.map(({ seal, reconciliation }) => ({
        seal_id: seal.seal_id,
        cycle_at_seal: seal.cycle_at_seal,
        reserve: seal.reserve,
        status: reconciliation.status,
        quarantine_reason: reconciliation.quarantine_reason,
        attempt_count: reconciliation.attempt_count,
        last_attempt_result: reconciliation.last_attempt_result
      }))
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

export async function reattestRoute(req: Request, res: Response) {
  try {
    const sealId = req.body?.seal_id;
    const forcePass = Boolean(req.body?.force_pass);
    if (!sealId || typeof sealId !== "string") {
      return res.status(400).json({ ok: false, error: "seal_id_required" });
    }
    const result = await reattestSeal(sealId, forcePass);
    if (!result.ok) {
      return res.status(409).json(result);
    }
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

export async function finalizeRoute(req: Request, res: Response) {
  try {
    const sealId = req.body?.seal_id;
    if (!sealId || typeof sealId !== "string") {
      return res.status(400).json({ ok: false, error: "seal_id_required" });
    }
    const result = await finalizeSeal(sealId);
    if (!result.ok) {
      return res.status(409).json(result);
    }
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

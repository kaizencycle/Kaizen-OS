import fs from "node:fs/promises";
import path from "node:path";
import type { SealRecord, SealReconciliationMeta } from "./types.js";

const CANONICAL_DIR = process.env.SEAL_CANONICAL_DIR
  ? path.resolve(process.env.SEAL_CANONICAL_DIR)
  : path.resolve(process.cwd(), "../../seals");

const RECONCILIATION_DIR = process.env.SEAL_RECONCILIATION_DIR
  ? path.resolve(process.env.SEAL_RECONCILIATION_DIR)
  : path.resolve(process.cwd(), "../../data/seal-reconciliation");

function canonicalPath(sealId: string): string {
  return path.join(CANONICAL_DIR, `${sealId}.json`);
}

function reconciliationPath(sealId: string): string {
  return path.join(RECONCILIATION_DIR, `${sealId}.json`);
}

export async function loadCanonicalSeal(sealId: string): Promise<SealRecord> {
  const raw = await fs.readFile(canonicalPath(sealId), "utf-8");
  return JSON.parse(raw) as SealRecord;
}

export async function listCanonicalSeals(): Promise<SealRecord[]> {
  await fs.mkdir(CANONICAL_DIR, { recursive: true });
  const files = await fs.readdir(CANONICAL_DIR);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));
  const rows = await Promise.all(
    jsonFiles.map(async (file) => {
      const raw = await fs.readFile(path.join(CANONICAL_DIR, file), "utf-8");
      return JSON.parse(raw) as SealRecord;
    })
  );
  return rows;
}

export async function loadReconciliationMeta(sealId: string): Promise<SealReconciliationMeta | null> {
  try {
    const raw = await fs.readFile(reconciliationPath(sealId), "utf-8");
    return JSON.parse(raw) as SealReconciliationMeta;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function saveReconciliationMeta(sealId: string, meta: SealReconciliationMeta): Promise<void> {
  await fs.mkdir(RECONCILIATION_DIR, { recursive: true });
  await fs.writeFile(reconciliationPath(sealId), JSON.stringify(meta, null, 2));
}

export function makeDefaultReconciliationMeta(seal: SealRecord): SealReconciliationMeta {
  return {
    seal_id: seal.seal_id,
    status: seal.status === "quarantined" ? "quarantined" : "candidate",
    quarantine_reason: seal.status === "quarantined" ? "attestation_timeout" : null,
    attempt_count: 0,
    last_attempt_at: null,
    last_attempt_result: null,
    finalized_at: null,
    failed_at: null
  };
}

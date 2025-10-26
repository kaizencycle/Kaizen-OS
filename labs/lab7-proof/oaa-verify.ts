import nacl from "tweetnacl";
import { createHash } from "crypto";

// ---- Canonical JSON (match server: sort keys, no spaces) ----
export function canonicalJSON(obj: unknown): string {
  // stable stringify (no cycles)
  return JSON.stringify(sortKeys(obj as any));
}

function sortKeys(x: any): any {
  if (Array.isArray(x)) return x.map(sortKeys);
  if (x && typeof x === "object") {
    const out: Record<string, any> = {};
    for (const k of Object.keys(x).sort()) out[k] = sortKeys(x[k]);
    return out;
  }
  return x;
}

// ---- Hash helper ----
export function sha256Hex(str: string): string {
  return createHash("sha256").update(str, "utf8").digest("hex");
}

// ---- Base64 helpers ----
function b64ToUint8(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"));
}

// ---- Verify an attestation object from OAA ----
export type OAAAttestation = {
  content: Record<string, any>;
  content_hash: string;           // e.g. "sha256:<hex>"
  signature: string;              // e.g. "ed25519:<base64sig>"
  public_key_b64: string;         // base64 raw 32-byte Ed25519 pubkey
  signing_key?: string;           // e.g. "oaa:ed25519:v1"
  ledger_receipt?: any;
};

export function verifyAttestation(att: OAAAttestation): {
  ok: boolean;
  reason?: string;
  recomputed_hash?: string;
} {
  // 1) Check hash
  const canon = canonicalJSON(att.content);
  const recomputed = sha256Hex(canon);
  const got = att.content_hash?.startsWith("sha256:")
    ? att.content_hash.slice("sha256:".length)
    : att.content_hash;
  if (!got || got !== recomputed) {
    return { ok: false, reason: "hash_mismatch", recomputed_hash: recomputed };
  }

  // 2) Verify signature
  if (!att.signature?.startsWith("ed25519:")) {
    return { ok: false, reason: "bad_sig_format" };
  }
  const sigB64 = att.signature.slice("ed25519:".length);
  const sig = b64ToUint8(sigB64);
  const pub = b64ToUint8(att.public_key_b64);
  const msg = Buffer.from(canon, "utf8");

  const ok = nacl.sign.detached.verify(msg, sig, pub);
  if (!ok) return { ok: false, reason: "signature_invalid" };

  return { ok: true, recomputed_hash: recomputed };
}

// ---- Optional: fetch current keyset from your OAA ----
export async function fetchOAAKeyset(baseUrl: string) {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/.well-known/oaa-keys.json`);
  if (!res.ok) throw new Error(`Keyset fetch failed: ${res.status}`);
  return res.json();
}

// ---- Example usage ----
async function main() {
  // Example: attestation returned by /oaa/repute/vote or /oaa/state/anchor
  const att = {
    content: {
      type: "oaa.repute.vote",
      source_id: "src:open-meteo",
      voter_id: "citizen:kaizen",
      stake_gic: 25,
      opinion: "up",
      ts: "2025-10-12T18:03:11Z",
      nonce: "…"
    },
    content_hash: "sha256:3e0b7f…",
    signature: "ed25519:Xv5…",
    public_key_b64: "f8r…",
    signing_key: "oaa:ed25519:v1"
  };

  // Option A: trust the attestation's embedded public key (quick start)
  console.log(verifyAttestation(att));

  // Option B (recommended): fetch your published keyset and enforce match
  const OAA_BASE = "https://your-lab7-api.onrender.com";
  const keyset = await fetchOAAKeyset(OAA_BASE);
  const allowedPubs = new Set(keyset.keys.map((k: any) => k.x));
  if (!allowedPubs.has(att.public_key_b64)) {
    throw new Error("Attestation signed by unknown key (not in /.well-known/oaa-keys.json)");
  }
  console.log(verifyAttestation(att));
}

// Uncomment to run example
// main().catch(console.error);


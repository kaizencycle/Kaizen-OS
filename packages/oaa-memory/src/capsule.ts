/* .gic Capsule codec (v1)
 * - encode: spec→capsule (compress + hash + merkle)
 * - decode: capsule→spec (verify + decompress)
 * - verify: schema-ish checks + signatures + GI threshold
 *
 * Peer deps: pako, js-sha256, tweetnacl, yaml
 */
import * as pako from "pako";
import { sha256 } from "js-sha256";
import nacl from "tweetnacl";
import YAML from "yaml";

type Hex = string;

export type Capsule = {
  version: string;               // "1.0"
  kind: "memory"|"project"|"agent"|"site"|"game";
  id: string;                    // "sha256:<hex>"
  owner: { handle: string; pubkey: string; uri?: string };
  provenance: {
    created: string;             // ISO
    cycle: string;               // e.g., "C-109"
    sources: { type: "repo"|"doc"|"ledger"|"capsule"; ref: string; hash: string }[];
  };
  ethics: { gi_threshold: number; accords: string[]; notes?: string };
  payload: { level: number; format: "json"|"yaml"; data: string };   // hex of zlib-compressed text
  integrity: {
    merkle_root: string;         // "sha256:<hex>"
    chunks: { path: string; sha256: string }[];
    signatures: { by: "JADE"|"EVE"|"ZEUS"|"HERMES"|"OWNER"; alg: "ed25519"; sig: string }[];
  };
  policy?: { ruleset_uri?: string; blocked_ops?: string[]; allowed_tools?: string[] };
  restore: { recipe: string[]; env?: Record<string,string> };
};

// ---------- helpers
function utf8(s: string) { return new TextEncoder().encode(s); }
function hex(b: Uint8Array): Hex { return Array.from(b).map(x=>x.toString(16).padStart(2,"0")).join(""); }
function unhex(h: Hex): Uint8Array {
  const bytes = new Uint8Array(h.length/2);
  for (let i=0;i<bytes.length;i++) bytes[i] = parseInt(h.substr(i*2,2),16);
  return bytes;
}
function shaHex(input: Uint8Array|string) {
  const bytes = typeof input === "string" ? utf8(input) : input;
  return sha256.update(bytes).hex();
}
function canonicalJSON(obj: any) {
  // stable stringify (keys sorted, no whitespace)
  return JSON.stringify(sortKeys(obj));
}
function sortKeys(v: any): any {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    return Object.keys(v).sort().reduce((o,k)=> (o[k]=sortKeys(v[k]), o), {} as any);
  }
  return v;
}
function compress(text: string, level=9): string {
  const deflated = pako.deflate(utf8(text), { level });
  return hex(deflated);
}
function decompress(hexData: string): string {
  const inflated = pako.inflate(unhex(hexData));
  return new TextDecoder().decode(inflated);
}

// Merkle over chunk hashes (sha256 hex WITHOUT "sha256:" prefix)
function merkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return "sha256:" + "0".repeat(64);
  let layer = hashes.map(h => h.replace(/^sha256:/,""));
  while (layer.length > 1) {
    const next: string[] = [];
    for (let i=0;i<layer.length;i+=2) {
      const a = layer[i];
      const b = layer[i+1] ?? layer[i]; // duplicate last if odd
      next.push(shaHex(utf8(a+b)));
    }
    layer = next;
  }
  return "sha256:" + layer[0];
}

// ---------- core
export function encodeCapsule(params: {
  kind: Capsule["kind"];
  owner: Capsule["owner"];
  provenance: Capsule["provenance"];
  ethics: Capsule["ethics"];
  restore: Capsule["restore"];
  chunks?: { path: string; content: string }[];   // optional content-index
  payloadObject: any;                              // spec/tests/intents minimal summary
  payloadFormat?: "json"|"yaml";
  payloadLevel?: number;                           // zlib level depth (1-10 conceptual)
}): Capsule {
  const payloadFormat = params.payloadFormat ?? "json";
  const summaryText = payloadFormat === "json"
    ? canonicalJSON(params.payloadObject)
    : YAML.stringify(params.payloadObject);

  const dataHex = compress(summaryText, 9);
  const chunkHashes = (params.chunks ?? []).map(c => ({
    path: c.path,
    sha256: "sha256:" + shaHex(utf8(c.content))
  }));
  const root = merkleRoot(chunkHashes.map(c => c.sha256));

  // assemble header without id/signatures
  const base: Capsule = {
    version: "1.0",
    kind: params.kind,
    id: "", // fill below
    owner: params.owner,
    provenance: params.provenance,
    ethics: params.ethics,
    payload: { level: Math.min(Math.max(params.payloadLevel ?? 10,1),10), format: payloadFormat, data: dataHex },
    integrity: { merkle_root: root, chunks: chunkHashes, signatures: [] },
    restore: params.restore
  };

  const id = "sha256:" + shaHex(utf8(canonicalJSON({ ...base, id: undefined, integrity: { ...base.integrity, signatures: [] } }))+unhex(dataHex));
  base.id = id;
  return base;
}

export function decodeCapsule(capsule: Capsule): { payload: any; summaryText: string } {
  const text = decompress(capsule.payload.data);
  const obj = capsule.payload.format === "json" ? JSON.parse(text) : YAML.parse(text);
  return { payload: obj, summaryText: text };
}

export function verifyCapsule(c: Capsule, opts?: {
  minGI?: number;
  requireSigners?: ("JADE"|"EVE"|"OWNER")[];
}): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  // version/kind/owner quick checks
  if (c.version.split(".")[0] !== "1") errors.push("unsupported_version");
  if (!c.owner?.handle || !c.owner?.pubkey) errors.push("bad_owner");

  // GI threshold
  const minGI = opts?.minGI ?? 0.92;
  if ((c.ethics?.gi_threshold ?? 0) < minGI) errors.push("gi_threshold_below_policy");

  // payload integrity
  try {
    const text = decompress(c.payload.data);
    if (c.payload.format === "json") JSON.parse(text); else YAML.parse(text);
  } catch {
    errors.push("payload_decompress_parse_failed");
  }

  // merkle root recompute
  const root = merkleRoot(c.integrity.chunks.map(x => x.sha256));
  if (root !== c.integrity.merkle_root) errors.push("merkle_root_mismatch");

  // id recompute (no signatures)
  const idRe = "sha256:" + shaHex(utf8(
    canonicalJSON({ ...c, id: undefined, integrity: { ...c.integrity, signatures: [] } })
  ) + c.payload.data);
  if (idRe !== c.id) errors.push("id_mismatch");

  // signatures (OPTIONAL but recommended)
  const required = new Set(opts?.requireSigners ?? []);
  const by = new Set(c.integrity.signatures.map(s => s.by));
  for (const r of required) if (!by.has(r)) errors.push(`missing_sig_${r}`);

  // Owner signature structural check (verification requires owner pubkey)
  for (const sig of c.integrity.signatures) {
    if (sig.alg !== "ed25519") { errors.push("unsupported_sig_alg"); continue; }
    if (sig.by === "OWNER") {
      try {
        const msg = utf8(c.id); // sign the capsule id
        const pub = base64urlToBytes(c.owner.pubkey);
        const sigb = base64urlToBytes(sig.sig);
        const ok = nacl.sign.detached.verify(msg, sigb, pub);
        if (!ok) errors.push("owner_sig_invalid");
      } catch {
        errors.push("owner_sig_invalid");
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function signOwner(c: Capsule, ownerSecretBase64Url: string): Capsule {
  const sk = base64urlToBytes(ownerSecretBase64Url);
  if (sk.length !== 64) throw new Error("ed25519 secret key must be 64 bytes (seed+pub)");
  const msg = utf8(c.id);
  const sig = nacl.sign.detached(msg, sk);
  const signed: Capsule = JSON.parse(JSON.stringify(c));
  signed.integrity.signatures = [
    ...signed.integrity.signatures,
    { by: "OWNER", alg: "ed25519", sig: bytesToBase64url(sig) }
  ];
  return signed;
}

// ---- base64url utils (no padding)
function bytesToBase64url(b: Uint8Array): string {
  const bin = Buffer.from(b).toString("base64").replace(/=+$/,"").replace(/\+/g,"-").replace(/\//g,"_");
  return bin;
}
function base64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : "";
  const b64 = s.replace(/-/g,"+").replace(/_/g,"/") + pad;
  return new Uint8Array(Buffer.from(b64, "base64"));
}
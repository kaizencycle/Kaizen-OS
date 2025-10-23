#!/usr/bin/env node
import fs from "node:fs";
import { createHash } from "node:crypto";
import nacl from "tweetnacl";

function sortKeys(x) {
  if (Array.isArray(x)) return x.map(sortKeys);
  if (x && typeof x === "object") {
    const out = {};
    for (const k of Object.keys(x).sort()) out[k] = sortKeys(x[k]);
    return out;
  }
  return x;
}
function canonicalJSON(obj) { return JSON.stringify(sortKeys(obj)); }
function sha256Hex(str) { return createHash("sha256").update(str, "utf8").digest("hex"); }
function b64ToUint8(b64) { return new Uint8Array(Buffer.from(b64, "base64")); }

function verify(att) {
  const canon = canonicalJSON(att.content);
  const recomputed = sha256Hex(canon);
  const got = (att.content_hash || "").replace(/^sha256:/, "");
  if (!got || got !== recomputed) return { ok: false, reason: "hash_mismatch", recomputed_hash: recomputed };
  if (!att.signature?.startsWith("ed25519:")) return { ok: false, reason: "bad_sig_format" };
  const sig = b64ToUint8(att.signature.slice(8));
  const pub = b64ToUint8(att.public_key_b64);
  const msg = Buffer.from(canon, "utf8");
  const ok = nacl.sign.detached.verify(msg, sig, pub);
  return ok ? { ok: true, recomputed_hash: recomputed } : { ok: false, reason: "signature_invalid" };
}

function usage() {
  console.log(`Usage:
  oaa-verify <attestation.json> [--keyset <url>]

If --keyset is provided, the attestation's public_key_b64 must appear in .well-known/oaa-keys.json`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) { usage(); process.exit(1); }
  const file = args[0];
  let keysetUrl = null;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--keyset") keysetUrl = args[++i];
  }

  const raw = fs.readFileSync(file, "utf8");
  const att = JSON.parse(raw);

  if (keysetUrl) {
    const res = await fetch(`${keysetUrl.replace(/\/$/, "")}/.well-known/oaa-keys.json`);
    if (!res.ok) {
      console.error("Keyset fetch failed:", res.status);
      process.exit(2);
    }
    const ks = await res.json();
    const allowed = new Set((ks.keys || []).map(k => k.x));
    if (!allowed.has(att.public_key_b64)) {
      console.error("Attestation signed by unknown key (not in keyset).");
      process.exit(3);
    }
  }

  const r = verify(att);
  if (!r.ok) {
    console.error("INVALID:", r);
    process.exit(4);
  }
  console.log("VALID:", r);
}

main().catch(e => { console.error(e); process.exit(99); });

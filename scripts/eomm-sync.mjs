#!/usr/bin/env node
/**
 * E.O.M.M. → Civic Ledger Sync (with quarantine)
 * - Reads JSON files from ./data/eomm/
 * - Validates shape; quarantines invalid to ./data/eomm/_invalid
 * - Computes sha256; wraps JSON-LD; POSTs to LEDGER/ledger/attest
 * - Writes back ledger proof and beacon URL to memory files
 *
 * Env:
 *   LEDGER_BASE_URL, LEDGER_ADMIN_TOKEN (required)
 *   EOMM_DIR (default: ./data/eomm)
 *   DRY_RUN ("true" logs only)
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const LEDGER = (process.env.LEGER_BASE_URL || process.env.LEDGER_BASE_URL || "").replace(/\/$/,"");
const TOKEN  = process.env.LEDGER_ADMIN_TOKEN || "";
const EOMM_DIR = process.env.EOMM_DIR || path.join(process.cwd(), "data", "eomm");
const INVALID_DIR = path.join(EOMM_DIR, "_invalid");
const SUMMARY = path.join(INVALID_DIR, "SUMMARY.json");
const DRY = String(process.env.DRY_RUN || "false").toLowerCase() === "true";

if (!LEDGER || !TOKEN) {
  console.error("Missing LEDGER_BASE_URL or LEDGER_ADMIN_TOKEN");
  process.exit(1);
}

function ensureDirs() {
  fs.mkdirSync(EOMM_DIR, { recursive: true });
  fs.mkdirSync(INVALID_DIR, { recursive: true });
}

function sha256Hex(bufOrStr) {
  return crypto.createHash("sha256").update(bufOrStr).digest("hex");
}

function safeParseJson(p) {
  try { return [JSON.parse(fs.readFileSync(p, "utf8")), null]; }
  catch (e) { return [null, `parse_error: ${e.message}`]; }
}

function validateEntry(entry) {
  const errs = [];
  if (!entry || typeof entry !== "object") { errs.push("not_an_object"); return errs; }
  for (const k of ["title","timestamp","agent","cycle","content"]) {
    if (!entry[k] || String(entry[k]).trim().length === 0) errs.push(`missing_${k}`);
  }
  if (entry.sources && !Array.isArray(entry.sources)) errs.push("sources_not_array");
  return errs;
}

function toJsonLd(entry, sha, filename) {
  // Build citations from sources
  const citations = (entry.sources || []).map((s) => ({
    "@type": s.type === "repo" ? "SoftwareSourceCode" :
             s.type === "dataset" ? "Dataset" :
             "WebPage",
    "name": s.name || s.url,
    "url": s.url,
    "hash": s.hash,
    "note": s.note
  }));

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": entry.title,
    "author": entry.author || "Michael Judan",
    "agent": entry.agent,
    "dateCreated": entry.timestamp,
    "text": entry.content,
    "keywords": entry.tags || ["EOMM","OAA","Reflection"],
    "integrityHash": `sha256:${sha}`,
    "attestation": { "signer": "oaa_hub", "signature": `sha256:${sha}` },
    "citation": citations,
    "isBasedOn": citations.map((c) => c.url).slice(0, 32),
    "prov": {
      "generatedAtTime": new Date().toISOString(),
      "wasAttributedTo": entry.agent,
      "used": citations.map((c) => c.url)
    },
    "oaa": { "kind": "memory", "cycle": entry.cycle, "companion": entry.agent },
    "_source": { "eomm_file": filename }
  };
}

async function postAttest(jsonld) {
  const r = await fetch(`${LEDGER}/ledger/attest`, {
    method: "POST",
    headers: { "content-type":"application/json", "authorization": `Bearer ${TOKEN}` },
    body: JSON.stringify(jsonld)
  });
  const txt = await r.text();
  return { ok: r.ok, status: r.status, body: txt };
}

function loadSummary() {
  try { return JSON.parse(fs.readFileSync(SUMMARY,"utf8")); } catch { return { ok:0, posted:0, invalid:0, errors:[] }; }
}
function saveSummary(s) { fs.writeFileSync(SUMMARY, JSON.stringify(s, null, 2)); }

function updateMemoryFile(filePath, ledgerProof, beaconUrl) {
  try {
    const entry = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!entry.links) entry.links = {};
    entry.links.ledgerProof = ledgerProof;
    entry.links.beaconUrl = beaconUrl;
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
    console.log(`[updated] ${filePath} with ledger proof and beacon URL`);
  } catch (e) {
    console.warn(`[warning] Failed to update ${filePath}: ${e.message}`);
  }
}

async function main(){
  ensureDirs();
  const files = fs.readdirSync(EOMM_DIR).filter(f => f.endsWith(".json") && !f.startsWith("_")).sort();
  const sum = loadSummary();

  for (const f of files) {
    const fp = path.join(EOMM_DIR, f);
    const raw = fs.readFileSync(fp);
    const [entry, parseErr] = safeParseJson(fp);
    if (parseErr) {
      const target = path.join(INVALID_DIR, f);
      fs.renameSync(fp, target);
      sum.invalid++; sum.errors.push({ file:f, reason: parseErr });
      console.warn(`[quarantine] ${f} → ${path.relative(process.cwd(), target)} (${parseErr})`);
      continue;
    }

    const errs = validateEntry(entry);
    if (errs.length) {
      const target = path.join(INVALID_DIR, f);
      fs.renameSync(fp, target);
      sum.invalid++; sum.errors.push({ file:f, reason: errs.join(",") });
      console.warn(`[quarantine] ${f} → ${path.relative(process.cwd(), target)} (${errs.join(",")})`);
      continue;
    }

    const sha = sha256Hex(raw);
    const jsonld = toJsonLd(entry, sha, f);

    if (DRY) {
      console.log(`[dry-run] ${f} → sha256=${sha}`);
      sum.ok++; continue;
    }

    try {
      const res = await postAttest(jsonld);
      if (!res.ok) {
        console.warn(`[fail] ${f} → ${res.status} ${res.body.slice(0,200)}`);
        // keep the file so it can retry later
      } else {
        console.log(`[ok] ${f} → sha256=${sha}`);
        sum.ok++; sum.posted++;
        
        // Parse response to get proof ID
        try {
          const responseData = JSON.parse(res.body);
          const proofId = responseData.proofId;
          if (proofId) {
            const ledgerProof = `${LEDGER}/ledger/proofs/${proofId}`;
            const beaconUrl = `/public/ai-seo/beacons/${sha}.jsonld`;
            updateMemoryFile(fp, ledgerProof, beaconUrl);
          }
        } catch (e) {
          console.warn(`[warning] Failed to parse ledger response: ${e.message}`);
        }
      }
    } catch (e) {
      console.warn(`[error] ${f}: ${e.message}`);
    }
  }

  saveSummary(sum);
  console.log(`::notice title=EOMM Sync::ok=${sum.ok}, posted=${sum.posted}, invalid=${sum.invalid}`);
  process.exit(0);
}

main().catch(e=>{ console.error(e); process.exit(1); });

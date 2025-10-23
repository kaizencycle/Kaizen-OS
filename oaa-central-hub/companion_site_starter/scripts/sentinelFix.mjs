/**
 * Sentinel Auto-Fix
 * - Lint/format changed files
 * - Normalize markdown frontmatter
 * - If constitution changed: recompute sha + (optionally) seal via mock ledger
 * - Open a branch & commit (local); CI workflow will turn it into a PR
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const CONSTITUTION = path.join(ROOT, "public/constitution/virtue_accords.md");
const HISTORY = path.join(ROOT, "public/constitution/history.json");

// ---------- helpers ----------
const sh = (cmd, args, opts={}) =>
  spawnSync(cmd, args, { stdio: "inherit", ...opts });

const changed = () => {
  const out = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
  return out.stdout.split("\n").filter(Boolean).map(l => l.trim().split(/\s+/).pop());
};

const sha256hex = (txt) => "0x" + crypto.createHash("sha256").update(txt, "utf8").digest("hex");

function ensureFrontmatter(md) {
  // Simple normalizer: ensure --- title/date block exists
  if (!md.startsWith("---")) {
    const title = (md.match(/^#\s+(.+)$/m)?.[1] || "Untitled").trim();
    const date = new Date().toISOString();
    return `---\ntitle: ${title}\ndate: ${date}\n---\n\n${md}`;
  }
  return md; // leave as-is for now
}

// ---------- 1) run formatters ----------
console.log("▶ Running formatters");
sh("npx", ["-y", "prettier", "--write", "." ], { cwd: ROOT });
sh("npx", ["-y", "eslint", "--fix", "." ],   { cwd: ROOT });

// ---------- 2) normalize content frontmatter ----------
console.log("▶ Normalizing content frontmatter");
const contentDir = path.join(ROOT, "content");
if (fs.existsSync(contentDir)) {
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir)) {
      const p = path.join(dir, e);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (p.endsWith(".md")) {
        const raw = fs.readFileSync(p, "utf8");
        const fixed = ensureFrontmatter(raw);
        if (fixed !== raw) {
          fs.writeFileSync(p, fixed);
          console.log("  • frontmatter added:", path.relative(ROOT, p));
        }
      }
    }
  };
  walk(contentDir);
}

// ---------- 3) Constitution: recompute sha + optional seal ----------
let sealedEntry = null;
if (fs.existsSync(CONSTITUTION) && fs.existsSync(HISTORY)) {
  console.log("▶ Checking constitution hash");
  const md = fs.readFileSync(CONSTITUTION, "utf8");
  const hash = sha256hex(md);

  const history = JSON.parse(fs.readFileSync(HISTORY, "utf8"));
  const latest = history[0];
  if (!latest || String(latest.sha256).toLowerCase() !== hash.toLowerCase()) {
    console.log("  • Content changed, updating history sha");
    const entry = {
      version: latest?.version ? bump(latest.version) : "1.0.0",
      date: new Date().toISOString(),
      title: "Constitution Update (auto)",
      summary: "Auto-sealed amendment",
      sha256: hash,
      proof: null
    };

    // Optional: seal via mock/prod ledger if env present
    const base = process.env.LEDGER_BASE_URL;
    const token = process.env.LEDGER_ADMIN_TOKEN || "";
    if (base) {
      try {
        const r = await fetch(`${base}/seal`, {
          method: "POST",
          headers: { "content-type":"application/json", "authorization": `Bearer ${token}` },
          body: JSON.stringify({ title:"Virtue Accords", slug:"constitution", companion:"civic", sha256: hash })
        });
        const j = await r.json();
        if (j?.ok && j?.proof) {
          entry.proof = j.proof;
          console.log("  • Sealed to ledger:", j.proof.slice(0,12), "…");
        } else {
          console.log("  • Seal skipped/failed:", j?.error || r.status);
        }
      } catch (e) {
        console.log("  • Seal error:", e?.message);
      }
    }

    history.unshift(entry);
    fs.writeFileSync(HISTORY, JSON.stringify(history, null, 2));
    sealedEntry = entry;
  } else {
    console.log("  • No constitution content change");
  }
}

// ---------- 4) commit if anything changed ----------
const changedFiles = changed();
if (changedFiles.length) {
  const branch = `sentinel/fix-${Date.now()}`;
  sh("git", ["config", "user.name", "echo-sentinel"]);
  sh("git", ["config", "user.email", "sentinel@civic.gic"]);
  sh("git", ["checkout", "-b", branch]);
  sh("git", ["add", "-A"]);
  const msg = sealedEntry
    ? `chore(sentinel): fix + constitution seal ${sealedEntry.sha256.slice(0,12)}`
    : "chore(sentinel): auto-fix (lint/format/normalize)";
  sh("git", ["commit", "-m", msg]);
  sh("git", ["push", "origin", branch]);
  console.log(`✅ Pushed ${branch}. Open a PR if CI didn't auto-create one.`);
} else {
  console.log("✓ Clean — no changes to commit.");
}

// ---- utils ----
function bump(v) {
  const [maj, min] = (v || "1.0.0").split(".").map(n=>parseInt(n||"0",10));
  return [maj, min + 1, 0].join(".");
}
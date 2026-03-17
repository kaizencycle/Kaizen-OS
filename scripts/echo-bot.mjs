#!/usr/bin/env node
/**
 * scripts/echo-bot.mjs
 *
 * ECHO-bot — Mobius Cycle & Catalog Maintenance Automation
 *
 * Responsibilities:
 *   1. Update the current cycle number across key files
 *   2. Regenerate catalog/mobius_catalog.json
 *   3. Optionally commit + push
 *
 * Usage:
 *   node scripts/echo-bot.mjs C-253                    # dry run
 *   node scripts/echo-bot.mjs C-253 --commit           # update + commit
 *   node scripts/echo-bot.mjs C-253 --commit --push    # update + commit + push
 *   node scripts/echo-bot.mjs --catalog-only           # just regenerate catalog
 *
 * @author ECHO Agent (Mobius Substrate)
 */

import fs from "fs/promises";
import path from "path";
import { execSync, spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const cycleArg = args.find((a) => /^C-\d+$/.test(a)) ?? null;
const shouldCommit = args.includes("--commit");
const shouldPush = args.includes("--push");
const catalogOnly = args.includes("--catalog-only");

// ─── Constants ───────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0];

/**
 * Files where the "current cycle" string lives.
 * Each entry describes one regex replacement.
 */
const CYCLE_TARGETS = [
  {
    file: "CLAUDE.md",
    // matches: **Current Cycle:** C-199 (...)
    pattern: /(\*\*Current Cycle:\*\* )C-\d+([^\n]*)/g,
    replace: (cycle) => `$1${cycle}`,
  },
  {
    file: "docs/00-START-HERE/README.md",
    // matches: *Cycle C-199 • YYYY-MM-DD*
    pattern: /(\*Cycle )C-\d+( •[^\n]*\*)/g,
    replace: (cycle) => `$1${cycle}$2`,
  },
  {
    file: "docs/README.md",
    // matches: **Last Updated:** YYYY-MM-DD (C-199)
    pattern: /(\*\*Last Updated:\*\* )\d{4}-\d{2}-\d{2} \(C-\d+\)/g,
    replace: (cycle) => `$1${TODAY} (${cycle})`,
  },
  {
    file: "CLAUDE.md",
    // matches: **Last Updated:** C-199
    pattern: /(\*\*Last Updated:\*\* )C-\d+/g,
    replace: (cycle) => `$1${cycle}`,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg) {
  process.stdout.write(msg + "\n");
}

function section(title) {
  log(`\n╔${"═".repeat(title.length + 4)}╗`);
  log(`║  ${title}  ║`);
  log(`╚${"═".repeat(title.length + 4)}╝`);
}

function run(cmd, opts = {}) {
  const result = spawnSync(cmd, { shell: true, cwd: ROOT, encoding: "utf8", ...opts });
  if (result.error) throw result.error;
  return { stdout: result.stdout?.trim(), stderr: result.stderr?.trim(), status: result.status };
}

// ─── Step 1: Cycle number update ─────────────────────────────────────────────

async function updateCycleNumber(cycle) {
  section(`Cycle bump → ${cycle}`);
  let updated = 0;

  // Group by file to avoid double-reads
  const byFile = {};
  for (const target of CYCLE_TARGETS) {
    byFile[target.file] = byFile[target.file] ?? [];
    byFile[target.file].push(target);
  }

  for (const [file, targets] of Object.entries(byFile)) {
    const abs = path.join(ROOT, file);
    let content;
    try {
      content = await fs.readFile(abs, "utf8");
    } catch {
      log(`   ⚠  ${file} not found — skipping`);
      continue;
    }

    let original = content;
    for (const { pattern, replace } of targets) {
      content = content.replace(pattern, replace(cycle));
    }

    if (content !== original) {
      await fs.writeFile(abs, content, "utf8");
      log(`   ✅ ${file}`);
      updated++;
    } else {
      log(`   ⬜ ${file} (no change)`);
    }
  }

  log(`\n   ${updated} file(s) updated`);
  return updated;
}

// ─── Step 2: Catalog regeneration ────────────────────────────────────────────

async function regenerateCatalog() {
  section("Catalog regeneration");
  const { stdout, stderr, status } = run("npx tsx scripts/exportCatalog.ts");
  if (status !== 0) {
    log(`   ❌ Catalog export failed:\n${stderr}`);
    process.exit(1);
  }
  log(stdout ?? "   Done");
}

// ─── Step 3: Commit ──────────────────────────────────────────────────────────

function gitCommit(cycle) {
  section("Git commit");

  run("git add CLAUDE.md docs/00-START-HERE/README.md docs/README.md catalog/mobius_catalog.json");

  const status = run("git status --porcelain");
  if (!status.stdout) {
    log("   ⬜ Nothing to commit");
    return false;
  }

  const msg = catalogOnly
    ? `chore(echo-bot): regenerate catalog — ${TODAY}`
    : `chore(echo-bot): bump cycle to ${cycle}, regenerate catalog — ${TODAY}`;

  const result = run(`git commit -m "${msg}"`);
  log(result.stdout || "   Committed");
  return true;
}

// ─── Step 4: Push ────────────────────────────────────────────────────────────

function gitPush() {
  section("Git push");
  const branch = run("git rev-parse --abbrev-ref HEAD").stdout;
  log(`   Branch: ${branch}`);

  let attempts = 0;
  const delays = [2000, 4000, 8000, 16000];
  while (attempts <= delays.length) {
    const { status, stderr } = run(`git push -u origin ${branch}`);
    if (status === 0) {
      log("   ✅ Pushed");
      return;
    }
    if (attempts < delays.length) {
      log(`   ⚠  Push failed (attempt ${attempts + 1}), retrying in ${delays[attempts] / 1000}s…`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delays[attempts]);
    } else {
      log(`   ❌ Push failed after ${attempts + 1} attempts:\n${stderr}`);
      process.exit(1);
    }
    attempts++;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  log("");
  log("  ╔═════════════════════════════════════╗");
  log("  ║        ECHO-BOT  🌀  Mobius         ║");
  log("  ╚═════════════════════════════════════╝");
  log(`  Mode  : ${catalogOnly ? "catalog-only" : cycleArg ? `cycle bump → ${cycleArg}` : "dry run"}`);
  log(`  Commit: ${shouldCommit}`);
  log(`  Push  : ${shouldPush}`);
  log(`  Date  : ${TODAY}`);

  if (!catalogOnly && !cycleArg) {
    log("\n  Usage: node scripts/echo-bot.mjs C-NNN [--commit] [--push]");
    log("         node scripts/echo-bot.mjs --catalog-only [--commit] [--push]");
    process.exit(1);
  }

  if (!catalogOnly && cycleArg) {
    await updateCycleNumber(cycleArg);
  }

  await regenerateCatalog();

  if (shouldCommit) {
    gitCommit(cycleArg);
  }

  if (shouldPush) {
    gitPush();
  }

  log("\n  ✅ ECHO-bot complete.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

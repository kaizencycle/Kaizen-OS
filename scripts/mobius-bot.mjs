#!/usr/bin/env node
/**
 * scripts/mobius-bot.mjs
 *
 * mobius-bot — GitHub PR/Issue Automation Bot
 *
 * Triggered by GitHub Actions on:
 *   - issue_comment events containing /mobius commands
 *   - workflow_dispatch for manual runs
 *
 * Commands (posted in PR/issue comments):
 *   /mobius catalog          — regenerate + commit catalog
 *   /mobius cycle C-253      — bump cycle + regenerate catalog
 *   /mobius status           — post current system status
 *   /mobius label <label>    — apply label to current PR/issue
 *   /mobius help             — list available commands
 *
 * Environment variables (GitHub Actions context):
 *   GITHUB_TOKEN             — for GitHub API calls
 *   GITHUB_REPOSITORY        — owner/repo
 *   MOBIUS_COMMENT_BODY      — the comment that triggered this run
 *   MOBIUS_PR_NUMBER         — PR/issue number
 *   MOBIUS_ACTOR             — who triggered the command
 *   MOBIUS_CYCLE             — cycle override for workflow_dispatch
 *   MOBIUS_COMMAND           — command override for workflow_dispatch
 *
 * @author ATLAS + ECHO Agents (Mobius Substrate)
 */

import { execSync, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Config ──────────────────────────────────────────────────────────────────

const {
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  MOBIUS_COMMENT_BODY = "",
  MOBIUS_PR_NUMBER,
  MOBIUS_ACTOR = "unknown",
  MOBIUS_CYCLE,
  MOBIUS_COMMAND,
} = process.env;

const [OWNER, REPO] = (GITHUB_REPOSITORY ?? "/").split("/");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg) {
  process.stdout.write(msg + "\n");
}

function run(cmd, opts = {}) {
  const result = spawnSync(cmd, { shell: true, cwd: ROOT, encoding: "utf8", ...opts });
  if (result.error) throw result.error;
  return { stdout: result.stdout?.trim(), stderr: result.stderr?.trim(), status: result.status };
}

async function githubPost(path, body) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }
  return response.json();
}

async function postComment(number, body) {
  if (!GITHUB_TOKEN || !number) {
    log(`[dry-run] Comment → #${number}:\n${body}`);
    return;
  }
  await githubPost(`/issues/${number}/comments`, { body });
}

async function applyLabel(number, labels) {
  if (!GITHUB_TOKEN || !number) {
    log(`[dry-run] Labels → #${number}: ${labels.join(", ")}`);
    return;
  }
  await githubPost(`/issues/${number}/labels`, { labels });
}

// ─── Command: help ────────────────────────────────────────────────────────────

async function cmdHelp(prNumber) {
  const msg = [
    "## 🌀 mobius-bot — Available Commands",
    "",
    "| Command | Description |",
    "|---------|-------------|",
    "| `/mobius catalog` | Regenerate `catalog/mobius_catalog.json` and commit |",
    "| `/mobius cycle C-NNN` | Bump cycle number across key files + regenerate catalog |",
    "| `/mobius status` | Post current cycle, GI baseline, and catalog stats |",
    "| `/mobius label <label>` | Apply a label to this PR/issue |",
    "| `/mobius help` | Show this help message |",
    "",
    "*ECHO-bot running on Mobius Substrate 🌀*",
  ].join("\n");

  await postComment(prNumber, msg);
}

// ─── Command: status ─────────────────────────────────────────────────────────

async function cmdStatus(prNumber) {
  let catalogStats = "unavailable";
  try {
    const raw = (await import("fs")).readFileSync(
      path.join(ROOT, "catalog/mobius_catalog.json"),
      "utf8"
    );
    const cat = JSON.parse(raw);
    catalogStats = `${cat.stats.docCount} docs, ${cat.stats.epiconCount} EPICONs (generated ${cat.generated_at.split("T")[0]})`;
  } catch {}

  const branch = run("git rev-parse --abbrev-ref HEAD").stdout;
  const lastCommit = run("git log -1 --format='%h %s'").stdout;

  const msg = [
    "## 🌀 Mobius System Status",
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Cycle** | ${process.env.KAIZEN_CURRENT_CYCLE ?? "C-253 (env not set)"} |`,
    `| **GI Baseline** | ${process.env.KAIZEN_GI_BASELINE ?? "0.993 (env default)"} |`,
    `| **Catalog** | ${catalogStats} |`,
    `| **Branch** | \`${branch}\` |`,
    `| **Last commit** | \`${lastCommit}\` |`,
    `| **Triggered by** | @${MOBIUS_ACTOR} |`,
    "",
    "*ECHO-bot — Mobius Substrate 🌀*",
  ].join("\n");

  await postComment(prNumber, msg);
}

// ─── Command: catalog ────────────────────────────────────────────────────────

async function cmdCatalog(prNumber) {
  log("Running ECHO-bot in catalog-only mode…");

  const { status, stdout, stderr } = run(
    "node scripts/echo-bot.mjs --catalog-only --commit"
  );

  if (status !== 0) {
    await postComment(
      prNumber,
      `❌ **ECHO-bot catalog regeneration failed**\n\`\`\`\n${stderr}\n\`\`\``
    );
    process.exit(1);
  }

  const catalogLine = stdout?.split("\n").find((l) => l.includes("Docs:")) ?? "";
  await postComment(
    prNumber,
    [
      "✅ **ECHO-bot: Catalog regenerated and committed**",
      "",
      catalogLine ? `> ${catalogLine.trim()}` : "",
      "",
      "The catalog will be pushed with the next `git push` or via the push step of this workflow.",
      "",
      "*ECHO-bot — Mobius Substrate 🌀*",
    ]
      .filter(Boolean)
      .join("\n")
  );
}

// ─── Command: cycle ───────────────────────────────────────────────────────────

async function cmdCycle(cycle, prNumber) {
  if (!/^C-\d+$/.test(cycle)) {
    await postComment(prNumber, `❌ Invalid cycle format \`${cycle}\`. Expected: \`C-NNN\``);
    process.exit(1);
  }

  log(`Running ECHO-bot: cycle bump to ${cycle}…`);
  const { status, stdout, stderr } = run(
    `node scripts/echo-bot.mjs ${cycle} --commit`
  );

  if (status !== 0) {
    await postComment(
      prNumber,
      `❌ **ECHO-bot cycle bump failed**\n\`\`\`\n${stderr}\n\`\`\``
    );
    process.exit(1);
  }

  await postComment(
    prNumber,
    [
      `✅ **ECHO-bot: Cycle bumped to \`${cycle}\`**`,
      "",
      "Files updated:",
      "- `CLAUDE.md`",
      "- `docs/00-START-HERE/README.md`",
      "- `docs/README.md`",
      "- `catalog/mobius_catalog.json`",
      "",
      "*ECHO-bot — Mobius Substrate 🌀*",
    ].join("\n")
  );
}

// ─── Command: label ───────────────────────────────────────────────────────────

async function cmdLabel(labelArg, prNumber) {
  const label = labelArg?.trim();
  if (!label) {
    await postComment(prNumber, "❌ `/mobius label` requires a label name.");
    process.exit(1);
  }
  await applyLabel(prNumber, [label]);
  await postComment(prNumber, `✅ Label \`${label}\` applied by @${MOBIUS_ACTOR}.`);
}

// ─── Parse and dispatch ───────────────────────────────────────────────────────

function parseCommand() {
  // workflow_dispatch override
  if (MOBIUS_COMMAND) return MOBIUS_COMMAND.trim();
  // parse from comment
  const match = MOBIUS_COMMENT_BODY.match(/\/mobius\s+(.+)/);
  return match ? match[1].trim() : null;
}

async function main() {
  const prNumber = MOBIUS_PR_NUMBER ?? null;
  const rawCmd = parseCommand();

  log(`mobius-bot 🌀`);
  log(`  actor  : ${MOBIUS_ACTOR}`);
  log(`  pr/issue: #${prNumber ?? "N/A"}`);
  log(`  command: ${rawCmd ?? "(none)"}`);

  if (!rawCmd) {
    log("No /mobius command found. Exiting.");
    process.exit(0);
  }

  const [cmd, ...rest] = rawCmd.split(/\s+/);

  switch (cmd.toLowerCase()) {
    case "help":
      await cmdHelp(prNumber);
      break;

    case "status":
      await cmdStatus(prNumber);
      break;

    case "catalog":
      await cmdCatalog(prNumber);
      break;

    case "cycle": {
      const cycle = rest[0] ?? MOBIUS_CYCLE;
      await cmdCycle(cycle, prNumber);
      break;
    }

    case "label":
      await cmdLabel(rest.join(" "), prNumber);
      break;

    default:
      await postComment(
        prNumber,
        `❓ Unknown command \`/mobius ${cmd}\`. Try \`/mobius help\`.`
      );
  }

  log("\nmobius-bot: done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

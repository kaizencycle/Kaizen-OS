#!/usr/bin/env tsx
/**
 * scripts/exportCatalog.ts
 *
 * Simple catalog exporter for Mobius-Substrate.
 * Scans epicon/ and docs/ and emits catalog/mobius_catalog.json
 *
 * Run with: npm run export:catalog
 *
 * @author Michael Judan
 * @license MIT
 */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import matter from "gray-matter";

// ============================================================================
// TYPES
// ============================================================================

type EpiconEntry = {
  epicon_id: string;
  path: string;
  title: string;
  cycle: string | null;
  epoch: string | null;
  tier: string | null;
  epicon_type: string | null;
  status: string;
  author_name: string | null;
  author_wallet: string | null;
  tags: string[];
  related_prs: string[];
  related_commits: string[];
  related_epicons: string[];
  integrity_index_baseline: number | null;
  risk_level: string | null;
  created_at: string | null;
  updated_at: string | null;
  content_hash: string;
  summary: string;
};

type DocEntry = {
  path: string;
  title: string;
  category: string;
  tags: string[];
  content_hash: string;
  summary: string;
};

type Catalog = {
  mobius_catalog_version: string;
  generated_at: string;
  repo: {
    name: string;
    url: string;
    default_branch: string;
    commit: string;
  };
  stats: {
    epiconCount: number;
    docCount: number;
  };
  epicons: EpiconEntry[];
  docs: DocEntry[];
};

// ============================================================================
// CONSTANTS
// ============================================================================

const REPO_NAME = "Mobius-Substrate";
const REPO_URL = "https://github.com/kaizencycle/Mobius-Substrate";
const DEFAULT_BRANCH = "main";
const CATALOG_VERSION = "1.0.0";

const repoRoot = process.cwd();

function resolveCurrentCommit(): string {
  const fromEnv =
    process.env.GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    "";
  if (fromEnv) return fromEnv;
  try {
    return execSync("git rev-parse HEAD", {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    const catalogPath = path.join(repoRoot, "catalog", "mobius_catalog.json");
    try {
      const prior = JSON.parse(fsSync.readFileSync(catalogPath, "utf8")) as Catalog;
      return prior.repo?.commit || "";
    } catch {
      return "";
    }
  }
}

const CURRENT_COMMIT = resolveCurrentCommit();

// Directories to skip
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".cache",
  "__pycache__",
]);

// Auto-generated docs that workflows rewrite + commit with [skip ci] (so the
// catalog is never regenerated). Cataloguing their content hash guarantees
// perpetual drift — every later PR fails "Check Catalog Freshness" through no
// fault of its own. These are machine output, not documentation:
//   - docs/divergence/dashboard.md     (mobius-divergence-dashboard.yml, 6-hourly)
//   - docs/divergence/WEEKLY_DIGEST.md (mobius-pulse-unified.yml, weekly)
const IGNORE_DOC_PATHS = new Set<string>([
  "docs/divergence/dashboard.md",
  "docs/divergence/WEEKLY_DIGEST.md",
]);

// ============================================================================
// UTILITIES
// ============================================================================

const hashContent = (content: string): string =>
  "sha256:" + crypto.createHash("sha256").update(content, "utf8").digest("hex");

/**
 * Recursively walk a directory and collect markdown files.
 */
async function walkMarkdownFiles(root: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries: Awaited<ReturnType<typeof fs.readdir>>;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (err: unknown) {
      // If dir doesn't exist, just skip
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return;
      throw err;
    }

    for (const entry of entries) {
      // Skip excluded directories
      if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
      ) {
        results.push(fullPath);
      }
    }
  }

  await walk(root);
  return results;
}

/**
 * Extract the first H1 heading from markdown content.
 */
function extractFirstHeading(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Infer category from file path.
 */
function inferCategory(relPath: string): string {
  const parts = relPath.split(path.sep);
  // Skip the root directory name (e.g., "docs")
  if (parts.length > 1) {
    return parts[1];
  }
  return "general";
}

// ============================================================================
// BUILDERS
// ============================================================================

/**
 * Build EPICON entries from the epicon/ directory.
 */
async function buildEpiconEntries(epiconRoot = "epicon"): Promise<EpiconEntry[]> {
  const epicons: EpiconEntry[] = [];
  const rootPath = path.join(repoRoot, epiconRoot);

  let files: string[] = [];
  try {
    files = await walkMarkdownFiles(rootPath);
  } catch {
    // If no epicon dir yet, just return empty
    console.log(`  ⚠ No ${epiconRoot}/ directory found, skipping EPICONs`);
    return [];
  }

  for (const fullPath of files) {
    try {
      const raw = await fs.readFile(fullPath, "utf8");
      const { data } = matter(raw);
      const relPath = path.relative(repoRoot, fullPath);

      // Skip template files
      if (path.basename(fullPath).toLowerCase().includes("template")) {
        continue;
      }

      const entry: EpiconEntry = {
        epicon_id:
          (data as Record<string, unknown>).epicon_id as string ||
          path.basename(fullPath, path.extname(fullPath)),
        path: relPath,
        title:
          (data as Record<string, unknown>).title as string ||
          extractFirstHeading(raw) ||
          path.basename(fullPath, ".md"),
        cycle: ((data as Record<string, unknown>).cycle as string) || null,
        epoch: ((data as Record<string, unknown>).epoch as string) || null,
        tier: ((data as Record<string, unknown>).tier as string) || null,
        epicon_type: ((data as Record<string, unknown>).epicon_type as string) || null,
        status: ((data as Record<string, unknown>).status as string) || "active",
        author_name: ((data as Record<string, unknown>).author_name as string) || null,
        author_wallet: ((data as Record<string, unknown>).author_wallet as string) || null,
        tags: Array.isArray((data as Record<string, unknown>).tags)
          ? ((data as Record<string, unknown>).tags as string[])
          : [],
        related_prs: Array.isArray((data as Record<string, unknown>).related_prs)
          ? ((data as Record<string, unknown>).related_prs as string[])
          : [],
        related_commits: Array.isArray((data as Record<string, unknown>).related_commits)
          ? ((data as Record<string, unknown>).related_commits as string[])
          : [],
        related_epicons: Array.isArray((data as Record<string, unknown>).related_epicons)
          ? ((data as Record<string, unknown>).related_epicons as string[])
          : [],
        integrity_index_baseline:
          typeof (data as Record<string, unknown>).integrity_index_baseline === "number"
            ? ((data as Record<string, unknown>).integrity_index_baseline as number)
            : null,
        risk_level: ((data as Record<string, unknown>).risk_level as string) || null,
        created_at: ((data as Record<string, unknown>).created_at as string) || null,
        updated_at: ((data as Record<string, unknown>).updated_at as string) || null,
        content_hash: hashContent(raw),
        summary: ((data as Record<string, unknown>).summary as string) || "",
      };

      epicons.push(entry);
    } catch (err) {
      console.warn(`  ⚠ Failed to parse ${fullPath}:`, err);
    }
  }

  return epicons;
}

/**
 * Build doc entries from the docs/ directory.
 */
async function buildDocEntries(docsRoot = "docs"): Promise<DocEntry[]> {
  const docs: DocEntry[] = [];
  const rootPath = path.join(repoRoot, docsRoot);

  let files: string[] = [];
  try {
    files = await walkMarkdownFiles(rootPath);
  } catch {
    console.log(`  ⚠ No ${docsRoot}/ directory found, skipping docs`);
    return [];
  }

  for (const fullPath of files) {
    try {
      const relPath = path.relative(repoRoot, fullPath);

      // Skip auto-generated docs that would otherwise cause perpetual drift.
      if (IGNORE_DOC_PATHS.has(relPath.split(path.sep).join("/"))) {
        continue;
      }

      const raw = await fs.readFile(fullPath, "utf8");

      // Try to extract title from frontmatter or first heading
      const { data } = matter(raw);
      const title =
        (data as Record<string, unknown>).title as string ||
        extractFirstHeading(raw) ||
        path.basename(fullPath).replace(/\.mdx?$/, "");

      const entry: DocEntry = {
        path: relPath,
        title,
        category: inferCategory(relPath),
        tags: Array.isArray((data as Record<string, unknown>).tags)
          ? ((data as Record<string, unknown>).tags as string[])
          : [],
        content_hash: hashContent(raw),
        summary: ((data as Record<string, unknown>).summary as string) || "",
      };

      docs.push(entry);
    } catch (err) {
      console.warn(`  ⚠ Failed to parse ${fullPath}:`, err);
    }
  }

  return docs;
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║              MOBIUS CATALOG EXPORT                           ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log();

  console.log("📚 Scanning for EPICONs...");
  const epicons = await buildEpiconEntries("epicon");
  console.log(`   Found ${epicons.length} EPICON(s)`);

  console.log("📄 Scanning for docs...");
  const docs = await buildDocEntries("docs");
  console.log(`   Found ${docs.length} doc(s)`);

  const catalog: Catalog = {
    mobius_catalog_version: CATALOG_VERSION,
    generated_at: new Date().toISOString(),
    repo: {
      name: REPO_NAME,
      url: REPO_URL,
      default_branch: DEFAULT_BRANCH,
      commit: CURRENT_COMMIT,
    },
    stats: {
      epiconCount: epicons.length,
      docCount: docs.length,
    },
    epicons,
    docs,
  };

  const outPath = path.join(repoRoot, "catalog", "mobius_catalog.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(catalog, null, 2), "utf8");

  console.log();
  console.log("✅ Catalog exported successfully!");
  console.log(`   📁 Output: ${path.relative(repoRoot, outPath)}`);
  console.log(`   📊 EPICONs: ${epicons.length}`);
  console.log(`   📊 Docs: ${docs.length}`);
  console.log(`   🕐 Generated: ${catalog.generated_at}`);
  console.log();
  console.log('"We heal as we walk." — Mobius Systems');
}

main().catch((err) => {
  console.error("❌ Error exporting catalog:", err);
  process.exit(1);
});

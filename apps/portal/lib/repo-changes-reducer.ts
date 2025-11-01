// apps/portal/lib/repo-changes-reducer.ts

type ChangeStatus = "added" | "modified" | "removed" | "renamed";

const BUCKET_RULES: [string, string[]][] = [
  ["infra",  ["vercel.json", ".github/", "Dockerfile", "docker-compose", "render.yaml", "infra/", "k8s/", "terraform/"]],
  ["docs",   ["README", "readme", "docs/", "/consensus-chamber", "/architecture", ".md", ".rst"]],
  ["tests",  ["tests/", "__tests__/", ".test.", ".spec."]],
  ["data",   ["data/", ".csv", ".jsonl", ".parquet", ".seed.", "seed_"]],
  ["app",    ["apps/", "packages/", "src/", "lib/", "api/", "routes/", "pages/"]],
];

const EXT_TO_BUCKET: Record<string, string> = {
  ".ts": "app", ".tsx": "app", ".js": "app", ".jsx":"app", ".py":"app",
  ".go":"app", ".rs":"app", ".sql":"app", ".yml":"infra", ".yaml":"infra",
  ".sh":"infra"
};

function bucketForPath(path: string): string {
  const p = path.toLowerCase();
  for (const [bucket, needles] of BUCKET_RULES) {
    if (needles.some(n => p.includes(n.toLowerCase()))) {
      return bucket;
    }
  }
  for (const [ext, b] of Object.entries(EXT_TO_BUCKET)) {
    if (p.endsWith(ext)) {
      return b;
    }
  }
  return "misc";
}

export interface ReducedChanges {
  from: string | undefined;
  to: string | undefined;
  totals: Record<ChangeStatus, number>;
  buckets: Record<string, Record<ChangeStatus | "paths", number | string[]>>;
  summary: string;
}

export function reduceComparePayload(compareJson: any): ReducedChanges {
  const files = compareJson.files || [];
  const buckets: Record<string, Record<ChangeStatus | "paths", number | string[]>> = {};
  const totals: Record<ChangeStatus, number> = {
    added: 0,
    modified: 0,
    removed: 0,
    renamed: 0
  };

  for (const f of files) {
    const status = (f.status || "modified") as ChangeStatus;
    const path   = f.filename || "";
    const b      = bucketForPath(path);
    
    if (!buckets[b]) {
      buckets[b] = { added: 0, modified: 0, removed: 0, renamed: 0, paths: [] };
    }
    
    buckets[b][status] = (buckets[b][status] as number || 0) + 1;
    (buckets[b].paths as string[]).push(path);
    totals[status] = (totals[status] || 0) + 1;
  }

  // short NL summary
  const parts: string[] = [];
  const order = ["infra","app","docs","tests","data","misc"];
  for (const k of order) {
    if (buckets[k]) {
      const b = buckets[k];
      const cnt = (b.added as number || 0) + (b.modified as number || 0) + (b.removed as number || 0) + (b.renamed as number || 0);
      const paths = b.paths as string[];
      const top = paths.slice(0, 3).join(", ");
      parts.push(`${k}: ${cnt} files (e.g., ${top})`);
    }
  }
  const nl = parts.length > 0 ? parts.join(" | ") : "no file changes detected";

  return {
    from: compareJson.base_commit?.sha,
    to: compareJson.merge_base_commit?.sha || compareJson.commits?.[compareJson.commits.length - 1]?.sha,
    totals,
    buckets,
    summary: nl
  };
}

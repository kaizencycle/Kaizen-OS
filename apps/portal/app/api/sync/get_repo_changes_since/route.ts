// apps/portal/app/api/sync/get_repo_changes_since/route.ts
import { NextResponse } from "next/server";
import { reduceComparePayload } from "@/lib/repo-changes-reducer";

const GH = "https://api.github.com";
const OWNER = process.env.REPO_OWNER ?? "kaizencycle";
const REPO  = process.env.REPO_NAME  ?? "Kaizen-OS";
const HDRS: HeadersInit = {
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` } : {})
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since');
  
  if (!since) {
    return NextResponse.json({ error: "since parameter required" }, { status: 400 });
  }

  try {
    if (since.includes('T')) {
      // ISO date - use commits API
      const commits = await fetch(`${GH}/repos/${OWNER}/${REPO}/commits?since=${since}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json());
      return NextResponse.json({ changes: commits });
    } else {
      // SHA - use compare API
      const repo = await fetch(`${GH}/repos/${OWNER}/${REPO}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json());
      const head_sha = await fetch(`${GH}/repos/${OWNER}/${REPO}/commits/${repo.default_branch}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json()).then(h=>h.sha);
      const compare = await fetch(`${GH}/repos/${OWNER}/${REPO}/compare/${since}...${head_sha}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json());
      const digest = reduceComparePayload(compare);
      return NextResponse.json({ changes: digest });
    }
  } catch (e: any) {
    return NextResponse.json({ error: "changes_failed", message: e.message }, { status: 500 });
  }
}

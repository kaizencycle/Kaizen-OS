// apps/portal/app/api/repo/digest/route.ts
import { NextResponse } from "next/server";

const GH = "https://api.github.com";
const OWNER = process.env.REPO_OWNER ?? "kaizencycle";
const REPO  = process.env.REPO_NAME  ?? "Kaizen-OS";
const HDRS: HeadersInit = {
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` } : {})
};

export async function GET() {
  try {
    const repo = await fetch(`${GH}/repos/${OWNER}/${REPO}`, { headers: HDRS, cache: "no-store" }).then(r=>r.json());
    const branch = repo.default_branch ?? "main";
    const head   = await fetch(`${GH}/repos/${OWNER}/${REPO}/commits/${branch}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json());
    const short  = String(head.sha ?? "").slice(0,7);

    const prs = await fetch(`${GH}/repos/${OWNER}/${REPO}/pulls?state=open&per_page=1`, { headers: HDRS, cache:"no-store" })
      .then(r => Promise.all([r, r.clone().headers.get("link")]))
      .then(async ([resp, link]) => {
        if (!link) return (await resp.json()).length; // small repos
        // Parse last page from Link header
        const m = /[?&]page=(\d+)>; rel="last"/.exec(link);
        return m ? Number(m[1]) : (await resp.json()).length;
      }).catch(()=>0);

    const issues = await fetch(`${GH}/search/issues?q=repo:${OWNER}/${REPO}+type:issue+state:open&per_page=1`, { headers: HDRS, cache:"no-store" })
      .then(r=>r.json()).then(j=>Number(j.total_count ?? 0)).catch(()=>0);

    return NextResponse.json({
      repo: `${OWNER}/${REPO}`,
      default_branch: branch,
      head_sha: head.sha,
      head_short: short,
      open_prs: prs,
      open_issues: issues,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    return NextResponse.json({ error: "digest_failed" }, { status: 500 });
  }
}

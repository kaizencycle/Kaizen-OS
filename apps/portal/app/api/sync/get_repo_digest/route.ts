// apps/portal/app/api/sync/get_repo_digest/route.ts
import { NextResponse } from "next/server";

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
  const org_wide = searchParams.get('org_wide') === 'true';

  try {
    const repo = await fetch(`${GH}/repos/${OWNER}/${REPO}`, { headers: HDRS, cache: "no-store" }).then(r=>r.json());
    const branch = repo.default_branch ?? "main";
    const head = await fetch(`${GH}/repos/${OWNER}/${REPO}/commits/${branch}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json());
    const latest_sha = head.sha;

    // Count open PRs
    const prsResp = await fetch(`${GH}/repos/${OWNER}/${REPO}/pulls?state=open&per_page=1`, { headers: HDRS, cache:"no-store" });
    const link = prsResp.headers.get("link");
    let open_prs = 0;
    if (link) {
      const m = /[?&]page=(\d+)>; rel="last"/.exec(link);
      open_prs = m ? Number(m[1]) : (await prsResp.json()).length;
    } else {
      open_prs = (await prsResp.json()).length;
    }

    // Count open issues
    const issuesResp = await fetch(`${GH}/search/issues?q=repo:${OWNER}/${REPO}+type:issue+state:open&per_page=1`, { headers: HDRS, cache:"no-store" });
    const issuesData = await issuesResp.json();
    const open_issues = issuesData.total_count ?? 0;

    // Get tags
    const tagsResp = await fetch(`${GH}/repos/${OWNER}/${REPO}/tags?per_page=10`, { headers: HDRS, cache:"no-store" });
    const tags = await tagsResp.json();
    const tagNames = tags.map((t: any) => t.name).slice(0, 10);

    // Get releases
    const relsResp = await fetch(`${GH}/repos/${OWNER}/${REPO}/releases?per_page=5`, { headers: HDRS, cache:"no-store" });
    const rels = await relsResp.json();
    const relNames = rels.map((r: any) => r.tag_name).slice(0, 5);

    const digest = {
      repo: `${OWNER}/${REPO}`,
      default_branch: branch,
      latest_sha: latest_sha,
      open_prs: open_prs,
      open_issues: open_issues,
      tags: tagNames,
      releases: relNames,
      ts: Math.floor(Date.now() / 1000)
    };

    return NextResponse.json(digest);
  } catch (e: any) {
    return NextResponse.json({ error: "digest_failed", message: e.message }, { status: 500 });
  }
}

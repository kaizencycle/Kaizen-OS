import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.DEV_MODE !== "1") {
    return res.status(403).json({ ok: false, error: "dev_routes_disabled" });
  }

  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const workflow = process.env.SENTINEL_WORKFLOW!;
  const token = process.env.GITHUB_PAT;

  const headers: Record<string, string> = { "User-Agent": "civic-sentinel" };
  if (token) headers.authorization = `Bearer ${token}`;
  headers.accept = "application/vnd.github+json";

  try {
    // 1) Last run of sentinel workflow
    const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(
      workflow
    )}/runs?per_page=1`;
    const runsRes = await fetch(runsUrl, { headers });
    const runsJson = await runsRes.json();
    const run = runsJson?.workflow_runs?.[0];

    // 2) Last sentinel PR opened
    const prsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&sort=created&direction=desc&per_page=5`;
    const prsRes = await fetch(prsUrl, { headers });
    const prsJson = await prsRes.json();
    const sentinelPr =
      Array.isArray(prsJson) && prsJson.find((p: any) => /sentinel/i.test(p.title));

    // Normalize badge state
    let state: "green" | "amber" | "red" = "amber";
    const conclusion = run?.conclusion || run?.status;
    if (conclusion === "success") state = "green";
    else if (conclusion === "failure" || conclusion === "cancelled" || conclusion === "timed_out")
      state = "red";

    const payload = {
      ok: true,
      state,                                   // green | amber | red
      run: run
        ? {
            id: run.id,
            status: run.status,
            conclusion: run.conclusion,
            created_at: run.created_at,
            updated_at: run.updated_at,
            html_url: run.html_url,
          }
        : null,
      pr: sentinelPr
        ? {
            number: sentinelPr.number,
            title: sentinelPr.title,
            html_url: sentinelPr.html_url,
            head: sentinelPr.head?.ref,
            created_at: sentinelPr.created_at,
          }
        : null,
      repo: { owner, repo, workflow },
      ts: Date.now(),
    };

    // cache for 60s
    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(payload);
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "sentinel_status_failed" });
  }
}


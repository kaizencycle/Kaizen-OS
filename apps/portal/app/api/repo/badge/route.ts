// apps/portal/app/api/repo/badge/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_PORTAL_BASE || "http://localhost:3002";
  const r = await fetch(`${base}/api/repo/digest`, { cache: "no-store" }).catch(()=>null);
  if (!r || !r.ok) {
    return NextResponse.json({ schemaVersion:1, label:"Repo", message:"unavailable", color:"gray" });
  }
  const d = await r.json();
  return NextResponse.json({
    schemaVersion: 1,
    label: "Repo",
    message: `${d.repo}@${d.head_short} • PRs ${d.open_prs} • Issues ${d.open_issues}`,
    color: "blue"
  });
}

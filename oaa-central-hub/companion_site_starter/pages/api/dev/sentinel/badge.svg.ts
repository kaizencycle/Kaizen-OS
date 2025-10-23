import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const j = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/dev/sentinel/status`).then(r=>r.json()).catch(()=>({}));
  const state = j?.state || "amber";
  const color = state === "green" ? "#1ecb6b" : state === "red" ? "#ff5a5a" : "#f5b942";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="164" height="20" role="img" aria-label="sentinel:${state}">
  <linearGradient id="g" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <rect rx="3" width="164" height="20" fill="#0b1020"/>
  <rect rx="3" x="76" width="88" height="20" fill="${color}"/>
  <path fill="${color}" d="M76 0h4v20h-4z"/>
  <rect rx="3" width="164" height="20" fill="url(#g)"/>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="38" y="14">sentinel</text>
    <text x="120" y="14">${state}</text>
  </g>
</svg>`;
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
  res.send(svg.trim());
}
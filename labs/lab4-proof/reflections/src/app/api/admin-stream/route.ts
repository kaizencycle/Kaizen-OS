import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const base = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
  const url = `${base}/admin/agents/stream`;

  const resp = await fetch(url, {
    headers: { "x-admin-token": token },
  });

  if (!resp.ok || !resp.body) {
    return new Response(await resp.text(), { status: resp.status });
  }

  // Stream the SSE through Next.js
  const { readable, writable } = new TransformStream();
  resp.body.pipeTo(writable);
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}

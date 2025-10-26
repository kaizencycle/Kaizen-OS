import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const handle = url.searchParams.get("handle") || "";
  const base = process.env.GIC_INDEXER_URL!;
  if (!handle) return new Response("Missing handle", { status: 400 });

  const stream = new ReadableStream({
    start(controller) {
      const enc = (data: any) =>
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));

      let active = true;
      const tick = async () => {
        if (!active) return;
        try {
          const [b, f] = await Promise.all([
            fetch(`${base}/balances/${handle}`, { cache: "no-store" }).then(r => r.json()),
            fetch(`${base}/forest/user/${handle}`, { cache: "no-store" }).then(r => r.json())
          ]);
          enc({ type: "state", balance: b, forest: f, ts: Date.now() });
        } catch (e) {
          enc({ type: "error", message: String(e) });
        } finally {
          if (active) setTimeout(tick, 5000);
        }
      };
      tick();
      const close = () => { active = false; controller.close(); };
      // @ts-ignore
      (controller as any)._close = close;
    },
    cancel() {}
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}


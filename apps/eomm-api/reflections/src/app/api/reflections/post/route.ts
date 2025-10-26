import { NextRequest, NextResponse } from "next/server";

type Item = { id:string; user:string; text:string; ts:number; archetype?:string };
const MEM: Item[] = []; // MVP in-memory (per instance); optional Redis below
const USE_REDIS = !!process.env.REDIS_URL;

async function dominantArchetype(user:string, text:string){
  // ask our local analyzer to update + return the top label (for tagging the post)
  try{
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/archetype/analyze`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ user, text })
    });
    const j = await r.json();
    if (j?.scores){
      const entries = Object.entries(j.scores as Record<string,number>).sort((a,b)=>b[1]-a[1]);
      return entries[0]?.[0];
    }
  }catch{}
  return undefined;
}

export async function POST(req: NextRequest){
  try{
    const { user, text } = await req.json();
    if (!text || !user) return NextResponse.json({ error:"missing user or text" }, { status:400 });
    const archetype = await dominantArchetype(user, text);
    const item: Item = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, user, text, ts: Date.now(), archetype };

    if (USE_REDIS){
      // @ts-ignore: dynamic import only if configured
      const { default: Redis } = await import("ioredis");
      const r = new Redis(process.env.REDIS_URL as string);
      await r.lpush("reflections", JSON.stringify(item));
      await r.ltrim("reflections", 0, 199); // keep last 200
      r.disconnect();
    }else{
      MEM.unshift(item); if (MEM.length>200) MEM.pop();
    }

    // Optionally record an Indexer event
    if (process.env.GIC_INDEXER_URL && process.env.GIC_INDEXER_KEY){
      try{
        await fetch(`${process.env.GIC_INDEXER_URL}/events/reflection`, {
          method:"POST",
          headers:{ "Content-Type":"application/json", "X-API-Key": process.env.GIC_INDEXER_KEY as string },
          body: JSON.stringify({ user, text, ts: item.ts, archetype })
        });
      }catch{}
    }

    return NextResponse.json({ ok:true, item });
  }catch(e:any){
    return NextResponse.json({ error: e?.message || "post failed" }, { status:500 });
  }
}

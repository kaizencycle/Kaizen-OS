import { NextResponse } from "next/server";
const USE_REDIS = !!process.env.REDIS_URL;

export async function GET(){
  try{
    if (USE_REDIS){
      // @ts-ignore
      const { default: Redis } = await import("ioredis");
      const r = new Redis(process.env.REDIS_URL as string);
      const raw = await r.lrange("reflections", 0, 50);
      r.disconnect();
      return NextResponse.json({ items: raw.map(x=>JSON.parse(x)) });
    }else{
      // in-memory list lives on the post route module via Node process cache
      // for SSR route isolation, just return empty when not available
      // (client still sees its own posts after redirect)
      // You can later switch to Redis/Supabase for persistence.
      // @ts-ignore
      const mem = (global as any).__REFL_MEM as any[] | undefined;
      return NextResponse.json({ items: Array.isArray(mem)?mem:[] });
    }
  }catch{
    return NextResponse.json({ items: [] });
  }
}

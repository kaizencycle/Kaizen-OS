import express from "express";
import { Pool } from "pg";
import fetch from "node-fetch";

const app = express(); app.use(express.json());
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const LEDGER = process.env.LEDGER_BASE_URL!;
const TOKEN  = process.env.LEDGER_ADMIN_TOKEN!;
const UBI_BASE = Number(process.env.UBI_BASE || 10);
const CAP = Number(process.env.MAX_MERIT_CAP || 250);

async function getGeoWeight(region:string){
  const r = await db.query("SELECT weight FROM geo_weights WHERE region=$1",[region]);
  return r.rows[0]?.weight ?? Number(process.env.REGION_DEFAULT || 1.0);
}

async function proofsForUserCycle(userId:string, cycle:string){
  // Pull verified proofs for user+cycle from Ledger (you can refine filters server-side)
  const r = await fetch(`${LEDGER.replace(/\/$/,"")}/ledger/proofs?userId=${encodeURIComponent(userId)}&cycle=${encodeURIComponent(cycle)}`,{
    headers: { authorization:`Bearer ${TOKEN}` }
  });
  if (!r.ok) return [];
  return (await r.json()).items || [];
}

function meritFromProofs(items:any[]){
  let total = 0; const proofs:any[] = [];
  for(const it of items){
    const integrity = Number(it?.integrity ?? 1);
    const impact    = Number(it?.impact ?? 1);
    const weight    = Number(it?.weight ?? 1);
    const inc = integrity * impact * weight;
    if (isFinite(inc) && inc>0){
      total += inc;
      proofs.push({ proofId: it.id || it.proofId, integrity, impact, weight });
    }
  }
  return { total: Math.min(total, CAP), proofs };
}

app.post("/ubi/run", async (req,res)=>{
  const cycle = String(req.query.cycle||"").trim() || "C-000";
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return res.status(401).json({ ok:false, error:"unauthorized" });

  const users = (await db.query("SELECT id, region, status FROM citizens WHERE status='active'")).rows;
  const results:any[] = [];

  for(const u of users){
    const base = UBI_BASE * (await getGeoWeight(u.region));
    const raw = await proofsForUserCycle(u.id, cycle);
    const { total: merit, proofs } = meritFromProofs(raw);
    const penalty = 0; // placeholder: plug in Shield signals
    const total = Math.max(0, base + merit - penalty);

    const breakdown = { proofs };
    await db.query(`
      INSERT INTO gic_ubi_payouts(cycle,user_id,ubi_base,geo_weight,merit,penalty,total,breakdown)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT DO NOTHING
    `,[cycle,u.id,UBI_BASE,await getGeoWeight(u.region),merit,penalty,total,breakdown]);

    // attest payout summary to Ledger
    await fetch(`${LEDGER.replace(/\/$/,"")}/ledger/attest`,{
      method:"POST",
      headers:{ "content-type":"application/json", authorization:`Bearer ${TOKEN}` },
      body: JSON.stringify({
        "@type":"GICPayout",
        "cycle": cycle,
        "userId": u.id,
        "total": total,
        "citation": (proofs||[]).map((p:any)=>({
          "@type":"WebPage",
          "name":"Ledger Proof",
          "url": `/ledger/proofs/${p.proofId}`
        })),
        "oaa": { kind:"gic", cycle }
      })
    }).catch(()=>{ /* best-effort */ });

    results.push({ userId:u.id, cycle, total });
  }

  res.json({ ok:true, cycle, count: results.length });
});

app.get("/ubi/:userId", async (req,res)=>{
  const cycle = String(req.query.cycle||"").trim();
  const r = await db.query(
    "SELECT cycle,user_id as userId, ubi_base as ubiBase, geo_weight as geoWeight, merit, penalty, total, breakdown FROM gic_ubi_payouts WHERE user_id=$1 AND ($2='' OR cycle=$2) ORDER BY created_at DESC LIMIT 1",
    [req.params.userId, cycle]
  );
  if (!r.rowCount) return res.status(404).json({ ok:false, error:"not_found" });
  res.setHeader("Cache-Control","public, max-age=60");
  res.json(r.rows[0]);
});

app.get("/ubi/summary", async (req,res)=>{
  const cycle = String(req.query.cycle||"").trim();
  const q = cycle ? "WHERE cycle=$1" : "";
  const args:any[] = cycle ? [cycle] : [];
  const r = await db.query(`SELECT ${cycle? "$1 as cycle,": ""} COUNT(*) as users, COALESCE(SUM(total),0) as total FROM gic_ubi_payouts ${q}`, args);
  res.setHeader("Cache-Control","public, max-age=60");
  res.json(r.rows[0] || { users:0, total:0, cycle: cycle||null });
});

export default app;

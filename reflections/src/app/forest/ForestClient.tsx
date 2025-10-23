"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetchJSON } from "@/lib/fetchers";

export default function ForestClient(){
  const [handle, setHandle] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [amt, setAmt] = useState<string>("1");
  const [busy, setBusy] = useState(false);
  const base = process.env.NEXT_PUBLIC_GIC_INDEXER_URL!;
  const router = useRouter();
  const [mode, setMode] = useState<"month"|"quarter">("month");
  const [period, setPeriod] = useState<string>(() => isoMonth(new Date())); // YYYY-MM
  const [range, setRange] = useState<{since:string, until:string}>(() => monthRange(new Date()));

  // Initialize from URL params after component mounts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get("mode") === "quarter" ? "quarter" : "month";
    const urlPeriod = params.get("period") || isoMonth(new Date());
    setMode(urlMode);
    setPeriod(urlPeriod);
    setRange(urlMode === "month" ? monthRange(fromIsoMonth(urlPeriod)) : quarterRange(fromIsoMonth(urlPeriod)));
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/me"); const j = r.ok?await r.json():{};
      setHandle(j.handle||"");
    })();
  }, []);
  useEffect(() => { loadStats(); }, [range.since, range.until]);

  async function loadStats(){
    try{
      const qs = `?since=${encodeURIComponent(range.since)}&until=${encodeURIComponent(range.until)}`;
      const r = await fetch(`${base}/forest/stats${qs}`, { cache: "no-store" });
      if (r.ok) setStats(await r.json());
    }catch{}
  }
  async function stake(){
    if (!handle) return alert("Please sign in.");
    const amount = Number(amt);
    if (!amount || amount <= 0) return;
    setBusy(true);
    const r = await authedFetchJSON("/api/stake/trees", {
      method: "POST",
      body: JSON.stringify({ user: handle, amount })
    });
    setBusy(false);
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Stake failed");
    alert(`🌳 Staked ${j.staked} GIC → ~${j.trees.toFixed(2)} trees`);
    loadStats();
  }

  return (
    <section className="container">
      <h1 className="title">Forest</h1>
      <p className="muted">Stake GIC to fund tree planting. Public stats are derived from the civic ledger.</p>

      {/* Season selector */}
      <div className="card" style={{marginBottom:12}}>
        <strong>Season</strong>
        <div className="row" style={{gap:8, marginTop:8}}>
          <select className="field" value={mode} onChange={(e)=>{
            const m = e.target.value as "month"|"quarter";
            setMode(m);
            if (m==="month"){
              const d = fromIsoMonth(period);
              setRange(monthRange(d));
              setPeriod(isoMonth(d));
            }else{
              const {start} = quarterRange(fromIsoMonth(period));
              setRange(quarterRange(start));
              setPeriod(isoMonth(start)); // anchor is the quarter's start month
            }
            // reflect in URL
            router.replace(`/forest?mode=${m}&period=${encodeURIComponent(period)}`);
          }}>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
          </select>

          {mode==="month" ? (
            <input
              className="field"
              type="month"
              value={period}
              onChange={(e)=>{
                setPeriod(e.target.value);
                const d = fromIsoMonth(e.target.value);
                setRange(monthRange(d));
                router.replace(`/forest?mode=month&period=${encodeURIComponent(e.target.value)}`);
              }}
            />
          ) : (
            <QuarterPicker period={period} onChange={(ym)=>{
              setPeriod(ym);
              const d = fromIsoMonth(ym);
              setRange(quarterRange(d));
              router.replace(`/forest?mode=quarter&period=${encodeURIComponent(ym)}`);
            }} />
          )}
        </div>
        <small className="muted">
          Window: {range.since} → {range.until}
        </small>
      </div>

      <div className="card">
        <div className="row" style={{justifyContent:"space-between"}}>
          <strong>Stake GIC</strong>
          <small className="muted">1 stake = burn (records on ledger)</small>
        </div>
        <div className="row">
          <input className="field" value={amt} onChange={e=>setAmt(e.target.value)} />
          <button className="btn primary" onClick={stake} disabled={busy || !handle}>
            {busy ? "Staking..." : "Stake"}
          </button>
        </div>
        <small className="muted">You'll burn {amt} GIC → plant ~{(Number(amt)||0).toFixed(2)} trees</small>
      </div>

      {stats && (
        <div className="card" style={{marginTop:12}}>
          <strong>Global Stats ({mode})</strong>
          <div className="row" style={{marginTop:8}}>
            <div className="col">
              <div className="muted">Total Staked</div>
              <div className="title">{stats.total_staked_gic?.toFixed(2) || 0} GIC</div>
            </div>
            <div className="col">
              <div className="muted">Trees Planted</div>
              <div className="title">~{stats.total_trees?.toFixed(1) || 0}</div>
            </div>
            <div className="col">
              <div className="muted">Rate</div>
              <div className="title">{stats.gic_per_tree || 1} GIC/tree</div>
            </div>
          </div>
          <div className="card mini" style={{marginTop:12}}>
            <strong>Top Planters</strong>
            <ul>
              {stats.leaderboard.map((x:any, i:number)=>(
                <li key={i} style={{margin:"6px 0"}}>{x.handle}: {x.staked.toFixed(2)} GIC → {x.trees.toFixed(2)} trees</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- helpers (inline for simplicity) ---------- */
function isoMonth(d: Date){ // YYYY-MM
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function fromIsoMonth(s: string){
  const [y,m] = s.split("-").map(Number);
  return new Date(y, (m||1)-1, 1);
}
function monthRange(d: Date){
  const since = new Date(d.getFullYear(), d.getMonth(), 1, 0,0,0);
  const until = new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59);
  return { since: since.toISOString(), until: until.toISOString() };
}
function quarterRange(anchor: Date){
  const m = anchor.getMonth(); // 0..11
  const qStartMonth = m - (m % 3);
  const start = new Date(anchor.getFullYear(), qStartMonth, 1);
  const end = new Date(anchor.getFullYear(), qStartMonth + 3, 0, 23,59,59);
  return { since: start.toISOString(), until: end.toISOString(), start };
}

function QuarterPicker({period, onChange}:{period:string; onChange:(ym:string)=>void}){
  // period holds an ISO month (YYYY-MM) representing the quarter start
  const d = fromIsoMonth(period);
  const y = d.getFullYear();
  const qStartMonth = d.getMonth(); // 0,3,6,9
  const [year, setYear] = useState(y);
  const [q, setQ] = useState(qStartMonth/3 + 1 as 1|2|3|4);
  useEffect(()=>{
    const month0 = (q-1)*3;
    const ym = `${year}-${String(month0+1).padStart(2,"0")}`;
    onChange(ym);
  },[year,q]); // eslint-disable-line
  return (
    <div className="row" style={{gap:8}}>
      <input className="field" type="number" value={year} onChange={e=>setYear(parseInt(e.target.value||`${y}`,10))} />
      <select className="field" value={q} onChange={e=>setQ(Number(e.target.value) as any)}>
        <option value={1}>Q1 (Jan–Mar)</option>
        <option value={2}>Q2 (Apr–Jun)</option>
        <option value={3}>Q3 (Jul–Sep)</option>
        <option value={4}>Q4 (Oct–Dec)</option>
      </select>
    </div>
  );
}

import { useEffect, useState } from "react";

type Status = {
  ok: boolean;
  state?: "green" | "amber" | "red";
  run?: { html_url: string; status: string; conclusion: string | null; updated_at: string };
  pr?: { html_url: string; number: number; title: string; head?: string; created_at: string };
  repo?: { owner: string; repo: string; workflow: string };
  ts?: number;
  error?: string;
};

type Vitals = { 
  ok: boolean; 
  state: "green" | "amber" | "red"; 
  depth: number; 
  failRate: number; 
  windowMin: number;
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  ts: number;
};

type SparklinePoint = {
  depth: number;
  timestamp: number;
};

export default function SentinelBadge() {
  const [s, setS] = useState<Status>({ ok: false });
  const [v, setV] = useState<Vitals | null>(null);
  const [sparkline, setSparkline] = useState<SparklinePoint[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [status, vitals] = await Promise.all([
          fetch("/api/dev/sentinel/status").then(r=>r.json()),
          fetch("/api/dev/sentinel/vitals").then(r=>r.json()).catch(()=>null)
        ]);
        if (!alive) return;
        setS(status);
        if (vitals?.ok) {
          setV(vitals);
          
          // Add to sparkline (keep last 120 points = 2 hours at 1 sample/min)
          setSparkline(prev => {
            const newPoint = { depth: vitals.depth, timestamp: vitals.ts };
            const updated = [...prev, newPoint].slice(-120);
            return updated;
          });
        }
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 60000); // Poll every minute for sparkline
    return () => { alive = false; clearInterval(id); };
  }, []);

  // choose the worst state between CI status and runtime vitals
  const rank = (x?: string) => x==="red"?2 : x==="amber"?1 : 0;
  const worst = rank(s.state) >= rank(v?.state) ? s.state : v?.state;
  const color = worst==="green" ? "#1ecb6b" : worst==="red" ? "#ff5a5a" : "#f5b942";

  // Generate sparkline SVG path
  const generateSparklinePath = () => {
    if (sparkline.length < 2) return "";
    
    const maxDepth = Math.max(...sparkline.map(p => p.depth), 1);
    const width = 120;
    const height = 20;
    
    const points = sparkline.map((point, index) => {
      const x = (index / (sparkline.length - 1)) * width;
      const y = height - (point.depth / maxDepth) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(" L ")}`;
  };

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
      border: "1px solid #1b2440",
      borderRadius: 10,
      background: "linear-gradient(135deg, #0b1020 0%, #1a1f3a 100%)",
      color: "#cfe0ff",
      cursor: "pointer",
      transition: "all 0.2s",
      position: "relative"
    }}
    onClick={() => setShowDetails(!showDetails)}
    onMouseEnter={() => setShowDetails(true)}
    onMouseLeave={() => setShowDetails(false)}
    >
      <span style={{
        width: 10,
        height: 10,
        borderRadius: 999,
        background: color,
        boxShadow: `0 0 10px ${color}`,
        animation: worst === "red" ? "pulse 2s infinite" : "none"
      }}/>
      <strong>Sentinel</strong>
      <span style={{opacity: .85}}>{(worst||"...").toUpperCase()}</span>
      
      {/* Sparkline */}
      {sparkline.length > 1 && (
        <svg width="120" height="20" style={{ marginLeft: "8px" }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          <path
            d={generateSparklinePath()}
            stroke="url(#sparklineGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      
      {/* Quick vitals */}
      {v && (
        <span style={{opacity: .85, fontSize: "0.9em"}}>
          • {v.depth}q • {(v.failRate*100).toFixed(1)}%f
        </span>
      )}

      {/* Details popup */}
      {showDetails && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: "8px",
          padding: "12px",
          background: "#1b2440",
          border: "1px solid #2a3a5a",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 1000,
          minWidth: "300px",
          fontSize: "0.9em"
        }}>
          <div style={{ marginBottom: "8px", fontWeight: "bold", color: "#9fd1ff" }}>
            Sentinel Details
          </div>
          
          {/* CI Status */}
          {s.ok && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ color: "#9fd1ff", marginBottom: "4px" }}>CI Status:</div>
              <div style={{ marginLeft: "8px" }}>
                <span style={{ color: color, fontWeight: "bold" }}>
                  {s.state?.toUpperCase() || "UNKNOWN"}
                </span>
                {s.run?.html_url && (
                  <div style={{ marginTop: "2px" }}>
                    <a href={s.run.html_url} target="_blank" rel="noreferrer" 
                       style={{color: "#9fd1ff", textDecoration: "none"}}>
                      Last Run: {s.run.status} {s.run.conclusion && `(${s.run.conclusion})`}
                    </a>
                  </div>
                )}
                {s.pr?.html_url && (
                  <div style={{ marginTop: "2px" }}>
                    <a href={s.pr.html_url} target="_blank" rel="noreferrer" 
                       style={{color: "#9fd1ff", textDecoration: "none"}}>
                      PR #{s.pr.number}: {s.pr.title}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Runtime Vitals */}
          {v && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ color: "#9fd1ff", marginBottom: "4px" }}>Runtime Vitals:</div>
              <div style={{ marginLeft: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                <div>Depth: <span style={{ color: v.depth > 100 ? "#ff5a5a" : "#1ecb6b" }}>{v.depth}</span></div>
                <div>Fail Rate: <span style={{ color: v.failRate > 0.1 ? "#ff5a5a" : "#1ecb6b" }}>{(v.failRate*100).toFixed(1)}%</span></div>
                <div>Waiting: {v.waiting}</div>
                <div>Active: {v.active}</div>
                <div>Delayed: {v.delayed}</div>
                <div>Failed: {v.failed}</div>
                <div>Completed: {v.completed}</div>
                <div>Window: {v.windowMin}m</div>
              </div>
            </div>
          )}

          {/* Sparkline Legend */}
          {sparkline.length > 1 && (
            <div>
              <div style={{ color: "#9fd1ff", marginBottom: "4px" }}>Queue Depth Trend (2h):</div>
              <div style={{ marginLeft: "8px", fontSize: "0.8em", opacity: 0.8 }}>
                {sparkline.length} samples • Latest: {sparkline[sparkline.length - 1]?.depth || 0}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: "8px", 
            paddingTop: "8px", 
            borderTop: "1px solid #2a3a5a",
            fontSize: "0.8em",
            opacity: 0.7
          }}>
            Click to toggle details • Updates every minute
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
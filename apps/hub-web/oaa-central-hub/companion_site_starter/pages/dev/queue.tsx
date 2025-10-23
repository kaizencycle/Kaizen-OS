import { useState, useEffect } from "react";
import Head from "next/head";
import DevLayout from "../../components/DevLayout";

type QueueStats = {
  ok: boolean;
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  depth: number;
  failRate: number;
  windowMin: number;
  ts: number;
};

type QueueAction = "pause" | "resume" | "retryFailed" | "drain";

export default function QueueAdmin() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dev/queue/stats");
      const data = await res.json();
      if (data.ok) {
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  };

  const performAction = async (action: QueueAction) => {
    if (!adminToken.trim()) {
      setMessage({ type: "error", text: "Admin token required for write operations" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/dev/queue/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-admin-token": adminToken,
        },
      });

      const data = await res.json();
      
      if (data.ok) {
        setMessage({ type: "success", text: `Queue ${action} successful` });
        await fetchStats(); // Refresh stats
      } else {
        setMessage({ type: "error", text: data.error || `Queue ${action} failed` });
      }
    } catch (e) {
      setMessage({ type: "error", text: `Network error: ${e}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (n: number) => n.toLocaleString();
  const formatPercent = (n: number) => (n * 100).toFixed(1) + "%";

  return (
    <>
      <Head>
        <title>Queue Admin - OAA Hub</title>
      </Head>
      
      <DevLayout>
        <p style={{ 
          opacity: 0.8, 
          marginBottom: "2rem",
          fontSize: "1.1rem"
        }}>
          Monitor and control the BullMQ publish queue. Requires admin token for write operations.
        </p>

          {/* Admin Token Input */}
          <div style={{ 
            background: "#1b2440", 
            padding: "1.5rem", 
            borderRadius: "12px", 
            marginBottom: "2rem",
            border: "1px solid #2a3a5a"
          }}>
            <h3 style={{ marginBottom: "1rem", color: "#9fd1ff" }}>Admin Authentication</h3>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input
                type="password"
                placeholder="Enter admin token (DEV_ADMIN_TOKEN)"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "#0b1020",
                  border: "1px solid #2a3a5a",
                  borderRadius: "8px",
                  color: "#cfe0ff",
                  fontSize: "1rem"
                }}
              />
              <span style={{ 
                fontSize: "0.9rem", 
                opacity: 0.7,
                fontFamily: "monospace"
              }}>
                Required for write operations
              </span>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div style={{
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              background: message.type === "success" ? "#1a4d3a" : "#4d1a1a",
              border: `1px solid ${message.type === "success" ? "#1ecb6b" : "#ff5a5a"}`,
              color: message.type === "success" ? "#9fd1ff" : "#ff9f9f"
            }}>
              {message.text}
            </div>
          )}

          {/* Queue Statistics */}
          {stats ? (
            <div style={{ 
              background: "#1b2440", 
              padding: "2rem", 
              borderRadius: "12px", 
              marginBottom: "2rem",
              border: "1px solid #2a3a5a"
            }}>
              <h3 style={{ marginBottom: "1.5rem", color: "#9fd1ff" }}>Queue Statistics</h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "1.5rem",
                marginBottom: "2rem"
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#1ecb6b" }}>
                    {formatNumber(stats.depth)}
                  </div>
                  <div style={{ opacity: 0.8 }}>Queue Depth</div>
                </div>
                
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f5b942" }}>
                    {formatNumber(stats.waiting)}
                  </div>
                  <div style={{ opacity: 0.8 }}>Waiting</div>
                </div>
                
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#9fd1ff" }}>
                    {formatNumber(stats.active)}
                  </div>
                  <div style={{ opacity: 0.8 }}>Active</div>
                </div>
                
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#ff5a5a" }}>
                    {formatNumber(stats.failed)}
                  </div>
                  <div style={{ opacity: 0.8 }}>Failed</div>
                </div>
                
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#1ecb6b" }}>
                    {formatNumber(stats.completed)}
                  </div>
                  <div style={{ opacity: 0.8 }}>Completed</div>
                </div>
                
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: stats.failRate > 0.1 ? "#ff5a5a" : "#1ecb6b" }}>
                    {formatPercent(stats.failRate)}
                  </div>
                  <div style={{ opacity: 0.8 }}>Fail Rate ({stats.windowMin}m)</div>
                </div>
              </div>

              <div style={{ 
                fontSize: "0.9rem", 
                opacity: 0.6, 
                textAlign: "center",
                fontFamily: "monospace"
              }}>
                Last updated: {new Date(stats.ts).toLocaleString()}
              </div>
            </div>
          ) : (
            <div style={{ 
              background: "#1b2440", 
              padding: "2rem", 
              borderRadius: "12px", 
              marginBottom: "2rem",
              border: "1px solid #2a3a5a",
              textAlign: "center"
            }}>
              <div style={{ opacity: 0.6 }}>Loading queue statistics...</div>
            </div>
          )}

          {/* Queue Controls */}
          <div style={{ 
            background: "#1b2440", 
            padding: "2rem", 
            borderRadius: "12px",
            border: "1px solid #2a3a5a"
          }}>
            <h3 style={{ marginBottom: "1.5rem", color: "#9fd1ff" }}>Queue Controls</h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: "1rem"
            }}>
              <button
                onClick={() => performAction("pause")}
                disabled={loading}
                style={{
                  padding: "1rem",
                  background: "#f5b942",
                  color: "#0b1020",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
              >
                ⏸️ Pause Queue
              </button>
              
              <button
                onClick={() => performAction("resume")}
                disabled={loading}
                style={{
                  padding: "1rem",
                  background: "#1ecb6b",
                  color: "#0b1020",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
              >
                ▶️ Resume Queue
              </button>
              
              <button
                onClick={() => performAction("retryFailed")}
                disabled={loading}
                style={{
                  padding: "1rem",
                  background: "#9fd1ff",
                  color: "#0b1020",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
              >
                🔄 Retry Failed Jobs
              </button>
              
              <button
                onClick={() => performAction("drain")}
                disabled={loading}
                style={{
                  padding: "1rem",
                  background: "#ff5a5a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
              >
                🗑️ Drain Queue
              </button>
            </div>

            <div style={{ 
              marginTop: "1.5rem", 
              padding: "1rem", 
              background: "#0b1020", 
              borderRadius: "8px",
              fontSize: "0.9rem",
              opacity: 0.8
            }}>
              <strong>⚠️ Warning:</strong> These operations affect the live queue. Use with caution in production.
              <br />
              • <strong>Pause:</strong> Stops processing new jobs
              <br />
              • <strong>Resume:</strong> Resumes processing
              <br />
              • <strong>Retry Failed:</strong> Re-queues all failed jobs
              <br />
              • <strong>Drain:</strong> Removes all waiting jobs (destructive)
            </div>
          </div>
      </DevLayout>
    </>
  );
}
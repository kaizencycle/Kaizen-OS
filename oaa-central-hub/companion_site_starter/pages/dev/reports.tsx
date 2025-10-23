import { useState, useEffect } from "react";
import DevLayout from "../../components/DevLayout";

type ReportData = {
  ok: boolean;
  reports: Array<{
    id: string;
    title: string;
    type: "daily" | "weekly" | "monthly";
    createdAt: string;
    status: "completed" | "processing" | "failed";
    summary: {
      totalEvents: number;
      successRate: number;
      avgProcessingTime: number;
    };
  }>;
  generatedAt: string;
};

export default function DevReports() {
  const [reports, setReports] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dev/reports");
      const data = await res.json();
      if (data.ok) {
        setReports(data);
      } else {
        setError(data.error || "Failed to fetch reports");
      }
    } catch (e) {
      setError("Network error: " + e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <DevLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p>System reports and analytics for OAA operations.</p>
        <button
          onClick={fetchReports}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#1ecb6b",
            color: "#0b1020",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "12px",
          background: "#4d1a1a",
          border: "1px solid #ff5a5a",
          borderRadius: "8px",
          color: "#ff9f9f",
          marginBottom: "1rem"
        }}>
          Error: {error}
        </div>
      )}

      {reports ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          {reports.reports.length === 0 ? (
            <div style={{
              padding: "2rem",
              textAlign: "center",
              background: "#1b2440",
              border: "1px solid #2a3a5a",
              borderRadius: "8px",
              opacity: 0.6
            }}>
              No reports available yet
            </div>
          ) : (
            reports.reports.map((report) => (
              <div
                key={report.id}
                style={{
                  background: "#1b2440",
                  border: "1px solid #2a3a5a",
                  borderRadius: "8px",
                  padding: "1.5rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#9fd1ff", fontSize: "1.2rem" }}>
                      {report.title}
                    </h3>
                    <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "0.9rem", opacity: 0.7 }}>
                      <span>Type: {report.type}</span>
                      <span>Created: {formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    background: report.status === "completed" ? "#1a4d3a" : 
                              report.status === "processing" ? "#4d3a1a" : "#4d1a1a",
                    color: report.status === "completed" ? "#9fd1ff" : 
                           report.status === "processing" ? "#f5b942" : "#ff9f9f"
                  }}>
                    {report.status.toUpperCase()}
                  </div>
                </div>

                {report.status === "completed" && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1rem",
                    padding: "1rem",
                    background: "#0b1020",
                    borderRadius: "6px"
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1ecb6b" }}>
                        {report.summary.totalEvents.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Total Events</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9fd1ff" }}>
                        {(report.summary.successRate * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Success Rate</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f5b942" }}>
                        {formatDuration(report.summary.avgProcessingTime)}
                      </div>
                      <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Avg Processing</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <div style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#0b1020",
            border: "1px solid #1b2440",
            borderRadius: "6px",
            fontSize: "0.9rem",
            opacity: 0.7,
            textAlign: "center"
          }}>
            Last updated: {formatDate(reports.generatedAt)}
          </div>
        </div>
      ) : (
        <div style={{
          padding: "2rem",
          textAlign: "center",
          background: "#1b2440",
          border: "1px solid #2a3a5a",
          borderRadius: "8px",
          opacity: 0.6
        }}>
          {loading ? "Loading reports..." : "No data available"}
        </div>
      )}
    </DevLayout>
  );
}
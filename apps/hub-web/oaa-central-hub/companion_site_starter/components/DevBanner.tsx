export default function DevBanner() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1f3a 0%, #0b1020 100%)",
      borderBottom: "1px solid #1b2440",
      padding: "12px 20px",
      color: "#cfe0ff",
      fontSize: "14px",
      fontWeight: "500"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#9fd1ff" }}>🔧</span>
        <span>Development Mode</span>
        <span style={{ opacity: 0.6 }}>•</span>
        <span style={{ opacity: 0.8 }}>OAA Hub</span>
      </div>
    </div>
  );
}
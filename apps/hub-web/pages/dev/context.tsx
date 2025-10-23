import { useOaaContext } from "../../lib/context/useOaaContext";
import DevLayout from "../../components/DevLayout";
import MemoryManager from "../../components/MemoryManager";
import AgentStatusBanner from "../../components/AgentStatusBanner";

export default function DevContext() {
  const ctx = useOaaContext();
  
  if (ctx.status === "loading") {
    return (
      <DevLayout>
        <p>Loading...</p>
      </DevLayout>
    );
  }
  
  if (ctx.status === "error") {
    return (
      <DevLayout>
        <p style={{ color: "#ff6a6a" }}>Error: {ctx.error}</p>
      </DevLayout>
    );
  }

  return (
    <DevLayout>
      <p>Canonical context data for the OAA system.</p>
      
      <AgentStatusBanner />
      
      <div style={{ marginTop: 20 }}>
        <h2>Raw Context Data</h2>
        <pre style={{ 
          padding: 16, 
          background: "#0b1020", 
          border: "1px solid #1b2440", 
          borderRadius: 8,
          overflow: "auto",
          fontSize: 12
        }}>
          {JSON.stringify(ctx.data, null, 2)}
        </pre>
      </div>

      <MemoryManager />
    </DevLayout>
  );
}
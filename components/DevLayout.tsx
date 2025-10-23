import { ReactNode } from "react";
import AgentGuardBanner from "./AgentGuardBanner";

interface DevLayoutProps {
  children: ReactNode;
}

export default function DevLayout({ children }: DevLayoutProps) {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0a0e1a", 
      color: "#e2e8f0", 
      fontFamily: "system-ui, sans-serif",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "20px" }}>
          <h1 style={{ margin: "0 0 12px 0", fontSize: "24px", fontWeight: "600" }}>
            Developer Surface
          </h1>
          <AgentGuardBanner />
        </header>
        {children}
      </div>
    </div>
  );
}
export interface OaaContext {
  version: string;
  updatedAt: string;
  constitution: {
    current: string;
    sha256: string;
    history: Array<{
      version: string;
      date: string;
      title: string;
      summary: string;
      sha256: string;
      proof: string | null;
      url?: string;
    }>;
  };
  companions: Array<{
    id: string;
    name: string;
    status: "active" | "inactive" | "pending";
    lastSeen: string;
    capabilities: string[];
  }>;
  ledger: {
    baseUrl: string;
    status: "connected" | "disconnected" | "error";
    lastSync: string;
  };
  system: {
    environment: "development" | "staging" | "production";
    nodeVersion: string;
    uptime: number;
  };
}

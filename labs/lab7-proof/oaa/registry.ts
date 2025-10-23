// OAA Central Hub - Agent Registry
// Central registry for all labs, tools, and orchestration components

export interface Lab {
  id: string;
  name: string;
  routes: string[];
  status: 'active' | 'inactive' | 'maintenance';
  description: string;
  health_endpoint?: string;
  last_health_check?: Date;
}

export interface Tool {
  name: string;
  description: string;
  endpoint: string;
  call: (args: any) => Promise<ToolResult>;
  breaker?: CircuitBreaker;
  policy: string;
  last_used?: Date;
  success_rate?: number;
}

export interface ToolResult {
  ok: boolean;
  data?: any;
  meta?: any;
  error?: string;
  timestamp: Date;
  execution_time_ms: number;
}

export interface CircuitBreaker {
  error_rate_pct: number;
  timeout_ms: number;
  max_retries: number;
  state: 'closed' | 'open' | 'half-open';
  failure_count: number;
  last_failure?: Date;
}

// Lab Registry
export const labs: Lab[] = [
  {
    id: "lab7-oaa",
    name: "Open Attestation Authority",
    routes: ["/oaa", "/api/oaa/*"],
    status: "active",
    description: "Cryptographic verification and digital integrity services",
    health_endpoint: "/oaa/health"
  },
  {
    id: "lab4-frontend",
    name: "Frontend Dashboard",
    routes: ["/", "/oaa"],
    status: "active",
    description: "User interface and dashboard components",
    health_endpoint: "/health"
  },
  {
    id: "lab6-citizen-shield",
    name: "Citizen Shield Gateway",
    routes: ["/gateway/*", "/agent/*"],
    status: "active",
    description: "HMAC authentication and agent endpoint protection",
    health_endpoint: "/gateway/health"
  },
  {
    id: "civic-ledger",
    name: "Civic Ledger",
    routes: ["/ledger/*"],
    status: "active",
    description: "Immutable storage and audit trail services",
    health_endpoint: "/ledger/health"
  },
  {
    id: "gic-indexer",
    name: "GIC Indexer",
    routes: ["/gic/*"],
    status: "active",
    description: "Global Integrity Chain indexing services",
    health_endpoint: "/gic/health"
  }
];

// Tool Registry
export const tools: Record<string, Tool> = {
  webDataScout: {
    name: "webDataScout",
    description: "Web data extraction and monitoring",
    endpoint: process.env.SCOUT_ENDPOINT || "http://localhost:8001/scout",
    call: webDataScoutCall,
    breaker: {
      error_rate_pct: 20,
      timeout_ms: 20000,
      max_retries: 3,
      state: "closed",
      failure_count: 0
    },
    policy: "allowlist_domains"
  },
  
  healthSentinel: {
    name: "healthSentinel",
    description: "System health monitoring and pulse collection",
    endpoint: process.env.SENTINEL_ENDPOINT || "http://localhost:8002/sentinel",
    call: healthSentinelCall,
    breaker: {
      error_rate_pct: 10,
      timeout_ms: 5000,
      max_retries: 2,
      state: "closed",
      failure_count: 0
    },
    policy: "internal_only"
  }
};

// Tool Implementation Functions
async function webDataScoutCall(args: any): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    // Import the actual webDataScout function
    const { extract } = await import("../lib/webDataScout");
    
    const result = await extract(args);
    const executionTime = Date.now() - startTime;
    
    return {
      ok: true,
      data: result.data,
      meta: result.meta,
      timestamp: new Date(),
      execution_time_ms: executionTime
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
      execution_time_ms: executionTime
    };
  }
}

async function healthSentinelCall(args: any): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    // Import the actual health sentinel function
    const { getHealthStatus } = await import("../global-health-sentinel/pulse_sentinel");
    
    const result = await getHealthStatus(args);
    const executionTime = Date.now() - startTime;
    
    return {
      ok: true,
      data: result,
      meta: { source: "health_sentinel" },
      timestamp: new Date(),
      execution_time_ms: executionTime
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
      execution_time_ms: executionTime
    };
  }
}

// Registry Management Functions
export class RegistryManager {
  private static instance: RegistryManager;
  
  static getInstance(): RegistryManager {
    if (!RegistryManager.instance) {
      RegistryManager.instance = new RegistryManager();
    }
    return RegistryManager.instance;
  }
  
  getLab(id: string): Lab | undefined {
    return labs.find(lab => lab.id === id);
  }
  
  getTool(name: string): Tool | undefined {
    return tools[name];
  }
  
  getAllLabs(): Lab[] {
    return [...labs];
  }
  
  getAllTools(): Record<string, Tool> {
    return { ...tools };
  }
  
  updateLabHealth(id: string, isHealthy: boolean): void {
    const lab = this.getLab(id);
    if (lab) {
      lab.last_health_check = new Date();
      // Update status based on health
      if (!isHealthy && lab.status === 'active') {
        lab.status = 'maintenance';
      }
    }
  }
  
  updateToolMetrics(name: string, success: boolean, executionTime: number): void {
    const tool = this.getTool(name);
    if (tool) {
      tool.last_used = new Date();
      
      // Update success rate (simple moving average)
      if (tool.success_rate === undefined) {
        tool.success_rate = success ? 100 : 0;
      } else {
        tool.success_rate = (tool.success_rate * 0.9) + (success ? 10 : 0);
      }
      
      // Update circuit breaker state
      if (tool.breaker) {
        if (!success) {
          tool.breaker.failure_count++;
          tool.breaker.last_failure = new Date();
          
          const errorRate = (tool.breaker.failure_count / 10) * 100; // Last 10 calls
          if (errorRate > tool.breaker.error_rate_pct) {
            tool.breaker.state = 'open';
          }
        } else {
          tool.breaker.failure_count = Math.max(0, tool.breaker.failure_count - 1);
          if (tool.breaker.state === 'open' && tool.breaker.failure_count === 0) {
            tool.breaker.state = 'half-open';
          }
        }
      }
    }
  }
  
  isToolAvailable(name: string): boolean {
    const tool = this.getTool(name);
    if (!tool) return false;
    
    if (tool.breaker?.state === 'open') {
      // Check if enough time has passed to try half-open
      const cooldownMs = 60000; // 1 minute
      if (tool.breaker.last_failure && 
          Date.now() - tool.breaker.last_failure.getTime() > cooldownMs) {
        tool.breaker.state = 'half-open';
        return true;
      }
      return false;
    }
    
    return true;
  }
}

// Export singleton instance
export const registry = RegistryManager.getInstance();
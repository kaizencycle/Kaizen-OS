// OAA Central Hub - Main Router
// One API to rule them all - Plan • Act • Learn • Seal

import express from "express";
import { registry, ToolResult } from "./registry";
import { readFileSync } from "fs";
import { join } from "path";

// Load policy configuration
let policy: any = {};
try {
  const policyPath = join(process.cwd(), "ops", "policy.json");
  policy = JSON.parse(readFileSync(policyPath, "utf-8"));
} catch (error) {
  console.warn("Policy file not found, using default policy");
  policy = {
    allowed_domains: ["github.com", "render.com", "localhost", "127.0.0.1"],
    circuit_breakers: {
      global_timeout_ms: 30000,
      max_concurrent_requests: 100
    }
  };
}

export const hub = express.Router();

// Middleware for logging and observability
hub.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.headers['x-request-id'] = requestId;
  req.headers['x-start-time'] = startTime.toString();
  
  // Log the request
  console.log(`[OAA Hub] ${req.method} ${req.path} - ${requestId}`);
  
  // Override res.json to add observability
  const originalJson = res.json;
  res.json = function(body: any) {
    const executionTime = Date.now() - startTime;
    
    // Log to ops logs
    logToOpsLogs({
      request_id: requestId,
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString(),
      body: body
    });
    
    return originalJson.call(this, body);
  };
  
  next();
});

// Jade Planner - Decision Engine
hub.post("/plan", async (req, res) => {
  try {
    const { goals, state, context } = req.body || {};
    
    // Simple planning logic (can be enhanced with AI/ML)
    const plan = await generatePlan(goals, state, context);
    
    res.json({
      ok: true,
      plan: plan,
      meta: {
        planner: "jade",
        timestamp: new Date().toISOString(),
        version: "0.1.0"
      }
    });
  } catch (error) {
    console.error("[OAA Hub] Plan error:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Planning failed",
      meta: {
        planner: "jade",
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Zeus Executor - Action Engine
hub.post("/act", async (req, res) => {
  try {
    const { tool, args, context } = req.body || {};
    
    if (!tool) {
      return res.status(400).json({
        ok: false,
        error: "missing_tool",
        message: "Tool name is required"
      });
    }
    
    // Check if tool exists
    const toolDef = registry.getTool(tool);
    if (!toolDef) {
      return res.status(400).json({
        ok: false,
        error: "unknown_tool",
        message: `Tool '${tool}' not found in registry`
      });
    }
    
    // Check if tool is available (circuit breaker)
    if (!registry.isToolAvailable(tool)) {
      return res.status(503).json({
        ok: false,
        error: "tool_unavailable",
        message: `Tool '${tool}' is currently unavailable (circuit breaker open)`
      });
    }
    
    // Enforce policy before execution
    const policyResult = enforcePolicy(tool, args, toolDef.policy);
    if (!policyResult.allowed) {
      return res.status(403).json({
        ok: false,
        error: "policy_violation",
        message: policyResult.reason,
        policy: toolDef.policy
      });
    }
    
    // Execute the tool
    const startTime = Date.now();
    const result: ToolResult = await toolDef.call(args);
    const executionTime = Date.now() - startTime;
    
    // Update tool metrics
    registry.updateToolMetrics(tool, result.ok, executionTime);
    
    // Log the action
    logAction({
      tool,
      args,
      result,
      execution_time_ms: executionTime,
      context
    });
    
    res.json({
      ok: result.ok,
      data: result.data,
      meta: {
        ...result.meta,
        tool,
        execution_time_ms: executionTime,
        executor: "zeus",
        timestamp: result.timestamp
      },
      error: result.error
    });
    
  } catch (error) {
    console.error("[OAA Hub] Act error:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Action failed",
      meta: {
        executor: "zeus",
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Hermes I/O - Status and Health
hub.get("/status", async (req, res) => {
  try {
    const labs = registry.getAllLabs();
    const tools = registry.getAllTools();
    
    // Check lab health
    const labStatus = await Promise.all(
      labs.map(async (lab) => {
        const isHealthy = await checkLabHealth(lab);
        registry.updateLabHealth(lab.id, isHealthy);
        return {
          id: lab.id,
          name: lab.name,
          status: lab.status,
          healthy: isHealthy,
          last_check: lab.last_health_check
        };
      })
    );
    
    res.json({
      ok: true,
      hub: {
        name: "OAA Central",
        version: "0.1.0",
        status: "active"
      },
      labs: labStatus,
      tools: Object.keys(tools).map(name => ({
        name,
        available: registry.isToolAvailable(name),
        success_rate: tools[name].success_rate,
        last_used: tools[name].last_used
      })),
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id']
      }
    });
  } catch (error) {
    console.error("[OAA Hub] Status error:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Status check failed"
    });
  }
});

// Eve Human Gate - Approval and Review
hub.post("/gate", async (req, res) => {
  try {
    const { action, context, human_approval } = req.body || {};
    
    if (!human_approval) {
      return res.status(400).json({
        ok: false,
        error: "human_approval_required",
        message: "Human approval is required for this action"
      });
    }
    
    // Log human approval
    logHumanGate({
      action,
      context,
      approved: human_approval,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      ok: true,
      message: "Human gate processed",
      meta: {
        gate: "eve",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("[OAA Hub] Gate error:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Gate processing failed"
    });
  }
});

// Helper Functions

async function generatePlan(goals: any, state: any, context: any): Promise<any> {
  // Simple planning logic - can be enhanced with AI/ML
  const availableTools = Object.keys(registry.getAllTools());
  
  // Example: If goal is to fetch data, plan to use webDataScout
  if (goals?.type === "fetch_data" && availableTools.includes("webDataScout")) {
    return {
      step: "fetch",
      tool: "webDataScout",
      args: {
        url: goals.url,
        selector: goals.selector
      },
      next_steps: ["process_data", "store_results"]
    };
  }
  
  // Example: If goal is to check health, plan to use healthSentinel
  if (goals?.type === "health_check" && availableTools.includes("healthSentinel")) {
    return {
      step: "monitor",
      tool: "healthSentinel",
      args: {
        check_type: "full_system"
      },
      next_steps: ["analyze_health", "alert_if_needed"]
    };
  }
  
  // Default plan
  return {
    step: "unknown",
    tool: null,
    args: {},
    next_steps: ["manual_review"]
  };
}

function enforcePolicy(tool: string, args: any, policyType: string): { allowed: boolean; reason?: string } {
  switch (policyType) {
    case "allowlist_domains":
      if (args?.url) {
        const url = new URL(args.url);
        const allowedDomains = policy.allowed_domains || [];
        if (!allowedDomains.some((domain: string) => url.hostname.includes(domain))) {
          return {
            allowed: false,
            reason: `Domain '${url.hostname}' not in allowlist`
          };
        }
      }
      break;
      
    case "internal_only":
      // Only allow internal tools
      if (!tool.startsWith("internal_")) {
        return {
          allowed: false,
          reason: "Tool requires internal access"
        };
      }
      break;
      
    default:
      // Default policy - allow
      break;
  }
  
  return { allowed: true };
}

async function checkLabHealth(lab: any): Promise<boolean> {
  if (!lab.health_endpoint) return true;
  
  try {
    const response = await fetch(`http://localhost:8000${lab.health_endpoint}`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn(`[OAA Hub] Health check failed for ${lab.id}:`, error);
    return false;
  }
}

function logToOpsLogs(data: any): void {
  const opsLogsDir = ".github/ops_logs";
  const timestamp = new Date().toISOString().split('T')[0];
  const logFile = `${opsLogsDir}/oaa-hub-${timestamp}.jsonl`;
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Ensure directory exists
    fs.mkdirSync(opsLogsDir, { recursive: true });
    
    // Append to log file
    fs.appendFileSync(logFile, JSON.stringify(data) + '\n');
  } catch (error) {
    console.error("[OAA Hub] Failed to write to ops logs:", error);
  }
}

function logAction(data: any): void {
  logToOpsLogs({
    type: "action",
    ...data
  });
}

function logHumanGate(data: any): void {
  logToOpsLogs({
    type: "human_gate",
    ...data
  });
}

export default hub;

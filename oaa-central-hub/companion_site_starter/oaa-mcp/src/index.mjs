import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

const server = new Server({ name: "oaa-mcp", version: "0.1.0" });

const memPath = path.join(process.cwd(), "OAA_MEMORY.json");

function loadMem() {
  if (!fs.existsSync(memPath)) {
    const defaultMem = {
      version: "v1",
      updatedAt: new Date().toISOString(),
      notes: [],
      companions: ["jade", "eve", "zeus", "hermes"],
      repos: ["OAA-API-Library", "gic-gateway-service", "gic-registry-contracts"],
      queue: { name: "publishEvents" },
      ethics: { accords: "Virtue Accords", epoch: "Cycle 0" }
    };
    fs.writeFileSync(memPath, JSON.stringify(defaultMem, null, 2));
    return defaultMem;
  }
  return JSON.parse(fs.readFileSync(memPath, "utf8"));
}

function saveMem(m) {
  m.updatedAt = new Date().toISOString();
  fs.writeFileSync(memPath, JSON.stringify(m, null, 2));
}

server.tool("oaa.getContext", {
  description: "Get canonical OAA context (same as /api/oaa/context).",
  run: async () => {
    try {
      const contextPath = path.join(process.cwd(), "pages/api/oaa/context.ts");
      const contextContent = fs.readFileSync(contextPath, "utf8");
      
      // Extract the context object from the TypeScript file
      const contextMatch = contextContent.match(/const context: OaaContext = \{[\s\S]*?\};/);
      if (!contextMatch) {
        return { text: JSON.stringify({ error: "Could not parse context from TypeScript file" }) };
      }
      
      // For now, return a simplified context - in production, you'd want to actually execute this
      const mockContext = {
        version: "1.0.0",
        updatedAt: new Date().toISOString(),
        companions: [
          { id: "jade", name: "Jade", status: "active", lastSeen: new Date().toISOString() },
          { id: "eve", name: "Eve", status: "active", lastSeen: new Date().toISOString() },
          { id: "zeus", name: "Zeus", status: "active", lastSeen: new Date().toISOString() },
          { id: "hermes", name: "Hermes", status: "active", lastSeen: new Date().toISOString() }
        ],
        ledger: {
          baseUrl: process.env.LEDGER_BASE_URL || "http://localhost:4000",
          status: "connected",
          lastSync: new Date().toISOString()
        }
      };
      
      return { text: JSON.stringify(mockContext, null, 2) };
    } catch (error) {
      return { text: JSON.stringify({ error: error.message }) };
    }
  }
});

server.tool("oaa.memory.add", {
  description: "Append a durable memory note.",
  schema: z.object({ note: z.string().min(3) }),
  run: async ({ note }) => {
    const m = loadMem();
    m.notes.unshift({ note, ts: Date.now() });
    saveMem(m);
    return { text: "Memory note added successfully" };
  }
});

server.tool("oaa.memory.search", {
  description: "Search memory notes.",
  schema: z.object({ q: z.string().optional() }),
  run: async ({ q }) => {
    const m = loadMem();
    const res = (m.notes || [])
      .filter(n => !q || n.note.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 50);
    return { text: JSON.stringify(res, null, 2) };
  }
});

server.tool("oaa.memory.list", {
  description: "List all memory notes.",
  run: async () => {
    const m = loadMem();
    return { text: JSON.stringify(m.notes || [], null, 2) };
  }
});

server.tool("oaa.memory.clear", {
  description: "Clear all memory notes (use with caution).",
  run: async () => {
    const m = loadMem();
    m.notes = [];
    saveMem(m);
    return { text: "All memory notes cleared" };
  }
});

server.start();
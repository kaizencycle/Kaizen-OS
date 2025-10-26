import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const memPath = path.join(process.cwd(), "OAA_MEMORY.json");

type MemoryNote = {
  ts: number;
  note: string;
};

type MemoryData = {
  version: string;
  updatedAt: string;
  notes: MemoryNote[];
  companions: string[];
  repos: string[];
  queue: { name: string };
  ethics: { accords: string; epoch: string };
};

function loadMemory(): MemoryData {
  if (!fs.existsSync(memPath)) {
    const defaultMem: MemoryData = {
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

function saveMemory(memory: MemoryData): void {
  memory.updatedAt = new Date().toISOString();
  fs.writeFileSync(memPath, JSON.stringify(memory, null, 2));
}

function verifyHmac(req: NextApiRequest): boolean {
  const signature = req.headers["x-hmac-signature"] as string;
  const body = JSON.stringify(req.body);
  const secret = process.env.DEV_ADMIN_TOKEN || "dev-secret";
  
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  
  return signature === expectedSignature;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // GET: List memory notes
      const memory = loadMemory();
      const { q, limit = "50" } = req.query;
      
      let notes = memory.notes || [];
      
      if (q && typeof q === "string") {
        const query = q.toLowerCase();
        notes = notes.filter(note => 
          note.note.toLowerCase().includes(query)
        );
      }
      
      const limitNum = parseInt(limit as string, 10);
      notes = notes.slice(0, limitNum);
      
      return res.status(200).json({
        ok: true,
        notes,
        total: memory.notes?.length || 0,
        updatedAt: memory.updatedAt
      });
    }
    
    if (req.method === "POST") {
      // POST: Add new memory note
      if (!verifyHmac(req)) {
        return res.status(401).json({ error: "Invalid HMAC signature" });
      }
      
      const { note } = req.body;
      if (!note || typeof note !== "string" || note.trim().length < 3) {
        return res.status(400).json({ error: "Note must be at least 3 characters" });
      }
      
      const memory = loadMemory();
      memory.notes.unshift({
        ts: Date.now(),
        note: note.trim()
      });
      
      // Keep only last 1000 notes
      memory.notes = memory.notes.slice(0, 1000);
      
      saveMemory(memory);
      
      return res.status(200).json({
        ok: true,
        message: "Memory note added",
        note: memory.notes[0]
      });
    }
    
    if (req.method === "DELETE") {
      // DELETE: Clear all memory notes
      if (!verifyHmac(req)) {
        return res.status(401).json({ error: "Invalid HMAC signature" });
      }
      
      const memory = loadMemory();
      memory.notes = [];
      saveMemory(memory);
      
      return res.status(200).json({
        ok: true,
        message: "All memory notes cleared"
      });
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({
      error: "memory_operation_failed",
      message: error?.message || "Unknown error"
    });
  }
}


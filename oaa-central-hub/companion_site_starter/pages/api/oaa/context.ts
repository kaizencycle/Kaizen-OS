import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { OaaContext } from "../../../lib/context/types";

const ROOT = process.cwd();
const CONSTITUTION = path.join(ROOT, "public/constitution/virtue_accords.md");
const HISTORY = path.join(ROOT, "public/constitution/history.json");

function sha256hex(txt: string) {
  return "0x" + crypto.createHash("sha256").update(txt, "utf8").digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Read constitution
    const constitutionText = fs.existsSync(CONSTITUTION) 
      ? fs.readFileSync(CONSTITUTION, "utf8")
      : "# Virtue Accords\n\n*Constitution not found*";
    
    const constitutionSha256 = sha256hex(constitutionText);
    
    // Read history
    const history = fs.existsSync(HISTORY) 
      ? JSON.parse(fs.readFileSync(HISTORY, "utf8"))
      : [];

    // Mock companions data (in real app, this would come from a database)
    const companions = [
      {
        id: "jade",
        name: "Jade",
        status: "active" as const,
        lastSeen: new Date().toISOString(),
        capabilities: ["constitution", "ledger", "verification"]
      },
      {
        id: "echo",
        name: "Echo",
        status: "active" as const,
        lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        capabilities: ["monitoring", "alerts", "maintenance"]
      },
      {
        id: "sage",
        name: "Sage",
        status: "inactive" as const,
        lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        capabilities: ["analysis", "recommendations"]
      }
    ];

    // Check ledger status
    const ledgerBaseUrl = process.env.LEDGER_BASE_URL || "http://localhost:4000";
    let ledgerStatus: "connected" | "disconnected" | "error" = "disconnected";
    let lastSync = new Date().toISOString();

    try {
      const ledgerResponse = await fetch(`${ledgerBaseUrl}/health`, {
        method: "GET",
        headers: {
          "authorization": `Bearer ${process.env.LEDGER_ADMIN_TOKEN || ""}`
        }
      });
      ledgerStatus = ledgerResponse.ok ? "connected" : "error";
    } catch {
      ledgerStatus = "disconnected";
    }

    const context: OaaContext = {
      version: "1.0.0",
      updatedAt: new Date().toISOString(),
      constitution: {
        current: constitutionText,
        sha256: constitutionSha256,
        history
      },
      companions,
      ledger: {
        baseUrl: ledgerBaseUrl,
        status: ledgerStatus,
        lastSync
      },
      system: {
        environment: (process.env.NODE_ENV as any) || "development",
        nodeVersion: process.version,
        uptime: process.uptime()
      }
    };

    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(context);
  } catch (error: any) {
    return res.status(500).json({ 
      error: "context_load_failed", 
      message: error?.message || "Unknown error" 
    });
  }
}
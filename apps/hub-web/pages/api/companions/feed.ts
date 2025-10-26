import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

type FeedItem = {
  slug: string;
  title: string;
  sha256: string;
  proof: string | null;
  ts: number | null;
  integrityScore?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const companion = (req.query.companion as string || "").toLowerCase();
    if (!companion) {
      return res.status(400).json({ ok: false, error: "companion_required" });
    }

    // For now, return mock data since we don't have a file system setup
    // In production, this would read from content/{companion}/posts/*.md
    const mockItems: FeedItem[] = [
      {
        slug: "first-flight",
        title: "First Flight",
        sha256: "0x" + crypto.createHash("sha256").update("first-flight-content").digest("hex"),
        proof: "0x" + crypto.createHash("sha256").update("first-flight-proof").digest("hex"),
        ts: Date.now() - 3600000, // 1 hour ago
        integrityScore: 0.9
      },
      {
        slug: "memory-core",
        title: "Memory Core",
        sha256: "0x" + crypto.createHash("sha256").update("memory-core-content").digest("hex"),
        proof: "0x" + crypto.createHash("sha256").update("memory-core-proof").digest("hex"),
        ts: Date.now() - 7200000, // 2 hours ago
        integrityScore: 0.7
      },
      {
        slug: "reflection",
        title: "Reflection",
        sha256: "0x" + crypto.createHash("sha256").update("reflection-content").digest("hex"),
        proof: "0x" + crypto.createHash("sha256").update("reflection-proof").digest("hex"),
        ts: Date.now() - 10800000, // 3 hours ago
        integrityScore: 0.8
      },
      {
        slug: "virtue-accord",
        title: "Virtue Accord",
        sha256: "0x" + crypto.createHash("sha256").update("virtue-accord-content").digest("hex"),
        proof: null, // No proof yet
        ts: Date.now() - 14400000, // 4 hours ago
        integrityScore: 0.3
      }
    ];

    // Filter by companion if needed (for multi-companion setup)
    const items = mockItems.filter(item => 
      companion === "jade" || companion === "all" || Math.random() > 0.5
    );

    // Sort by timestamp (newest first)
    items.sort((a, b) => (b.ts || 0) - (a.ts || 0));

    return res.status(200).json({ 
      ok: true, 
      items: items.slice(0, 20), // Limit to 20 items
      companion,
      total: items.length
    });
  } catch (e: any) {
    console.error("Feed API error:", e);
    return res.status(500).json({ 
      ok: false, 
      error: e?.message || "feed_failed" 
    });
  }
}


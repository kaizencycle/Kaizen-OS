import type { NextApiRequest, NextApiResponse } from "next";
import { Queue } from "bullmq";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.DEV_MODE !== "1") {
    return res.status(403).json({ ok: false, error: "dev_routes_disabled" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  // Check admin token
  const adminToken = req.headers["x-dev-admin-token"];
  const expectedToken = process.env.DEV_ADMIN_TOKEN;
  
  if (!expectedToken) {
    return res.status(500).json({ ok: false, error: "admin_token_not_configured" });
  }
  
  if (!adminToken || adminToken !== expectedToken) {
    return res.status(401).json({ ok: false, error: "invalid_admin_token" });
  }

  try {
    const redis = process.env.REDIS_URL;
    if (!redis) {
      return res.status(500).json({ ok: false, error: "redis_not_configured" });
    }

    const queue = new Queue("publishEvents", { connection: { url: redis } });
    
    // Pause the queue
    await queue.pause();
    
    // Get updated stats to return
    const [waiting, active, delayed, failed, completed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getDelayedCount(),
      queue.getFailedCount(),
      queue.getCompletedCount()
    ]);

    return res.status(200).json({
      ok: true,
      message: "Queue paused successfully",
      stats: {
        waiting,
        active,
        delayed,
        failed,
        completed,
        depth: waiting + delayed
      },
      ts: Date.now()
    });

  } catch (error: any) {
    console.error("Queue pause error:", error);
    return res.status(500).json({ 
      ok: false, 
      error: error?.message || "queue_pause_failed" 
    });
  }
}

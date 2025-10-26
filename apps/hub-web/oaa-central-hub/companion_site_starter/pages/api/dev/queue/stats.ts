import type { NextApiRequest, NextApiResponse } from "next";
import { Queue } from "bullmq";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.DEV_MODE !== "1") {
    return res.status(403).json({ ok: false, error: "dev_routes_disabled" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const redis = process.env.REDIS_URL;
    if (!redis) {
      return res.status(500).json({ ok: false, error: "redis_not_configured" });
    }

    const queue = new Queue("publishEvents", { connection: { url: redis } });

    // Get comprehensive queue statistics
    const [waiting, active, delayed, failed, completed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getDelayedCount(),
      queue.getFailedCount(),
      queue.getCompletedCount()
    ]);

    const depth = waiting + delayed;

    // Calculate failure rate over the configured window
    const windowMin = Number(process.env.SENTINEL_WINDOW_MIN) || 15;
    const since = Date.now() - windowMin * 60 * 1000;
    
    // Get recent jobs to calculate failure rate
    const recentJobs = await queue.getJobs(["completed", "failed", "waiting", "delayed", "active"], 0, 199);
    
    let totalJobs = 0;
    let failedJobs = 0;
    
    for (const job of recentJobs) {
      const jobTime = job.finishedOn ?? job.processedOn ?? job.timestamp ?? 0;
      if (jobTime >= since) {
        totalJobs++;
        // Consider a job failed if it has failedReason or if it's in failed state
        if (job.failedReason || (job.finishedOn && job.returnvalue === null && job.attemptsMade > 0)) {
          failedJobs++;
        }
      }
    }

    const failRate = totalJobs > 0 ? failedJobs / totalJobs : 0;

    // Cache for 5 seconds to reduce Redis load
    res.setHeader("Cache-Control", "public, max-age=5, s-maxage=10, stale-while-revalidate=30");
    
    return res.status(200).json({
      ok: true,
      waiting,
      active,
      delayed,
      failed,
      completed,
      depth,
      failRate,
      windowMin,
      ts: Date.now()
    });

  } catch (error: any) {
    console.error("Queue stats error:", error);
    return res.status(500).json({ 
      ok: false, 
      error: error?.message || "queue_stats_failed" 
    });
  }
}


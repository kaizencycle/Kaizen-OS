import type { NextApiRequest, NextApiResponse } from "next";
import { Queue } from "bullmq";

function n(v: string | undefined, d: number) { return Number(v ?? d); }
const warnFR = n(process.env.SENTINEL_FAIL_RATE_WARN, 0.05);
const critFR = n(process.env.SENTINEL_FAIL_RATE_CRIT, 0.15);
const warnQD = n(process.env.SENTINEL_DEPTH_WARN, 50);
const critQD = n(process.env.SENTINEL_DEPTH_CRIT, 200);
const windowMin = n(process.env.SENTINEL_WINDOW_MIN, 15);

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (process.env.DEV_MODE !== "1") {
    return res.status(403).json({ ok:false, error:"dev_routes_disabled" });
  }
  try {
    const redis = process.env.REDIS_URL!;
    const queue = new Queue("publishEvents", { connection: { url: redis } });

    // queue depth snapshot
    const [waiting, active, delayed, failed, completed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getDelayedCount(),
      queue.getFailedCount(),
      queue.getCompletedCount()
    ]);
    const depth = waiting + delayed;

    // rolling window failure rate (approx from latest jobs)
    const since = Date.now() - windowMin * 60 * 1000;
    const recent = await queue.getJobs(["completed","failed","waiting","delayed","active"], 0, 199);
    let seen = 0, fails = 0;
    for (const j of recent) {
      const ts = j.finishedOn ?? j.processedOn ?? j.timestamp ?? 0;
      if (ts >= since) {
        seen++;
        // @ts-ignore
        if (j.failedReason || j.finishedOn === undefined && j.attemptsMade && j.attemptsMade > 0 && j.returnvalue === null) fails++;
      }
    }
    const failRate = seen ? fails / seen : 0;

    // status color
    let state: "green"|"amber"|"red" = "green";
    if (depth >= critQD || failRate >= critFR) state = "red";
    else if (depth >= warnQD || failRate >= warnFR) state = "amber";

    res.setHeader("Cache-Control","public, max-age=15, s-maxage=30");
    return res.status(200).json({
      ok: true,
      state,
      depth,
      waiting, active, delayed, failed, completed,
      failRate,
      windowMin,
      ts: Date.now()
    });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error: e?.message || "vitals_failed" });
  }
}
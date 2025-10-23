import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

type Status = {
  ok: boolean;
  state?: "green" | "amber" | "red";
  run?: { html_url: string; status: string; conclusion: string | null; updated_at: string };
  pr?: { html_url: string; number: number; title: string; head?: string; created_at: string };
  repo?: { owner: string; repo: string; workflow: string };
  ts?: number;
  error?: string;
};

type Vitals = { 
  ok: boolean; 
  state: "green" | "amber" | "red"; 
  depth: number; 
  failRate: number; 
  windowMin: number;
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  ts: number;
};

// In-memory state tracking (in production, use Redis)
let lastNotifiedState: string | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.DEV_MODE !== "1") {
    return res.status(403).json({ ok: false, error: "dev_routes_disabled" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    // Fetch current status and vitals
    const [statusRes, vitalsRes] = await Promise.all([
      fetch(`${req.headers.host?.startsWith('http') ? '' : 'http://localhost:3000'}/api/dev/sentinel/status`),
      fetch(`${req.headers.host?.startsWith('http') ? '' : 'http://localhost:3000'}/api/dev/sentinel/vitals`)
    ]);

    const status: Status = await statusRes.json();
    const vitals: Vitals = await vitalsRes.json();

    // Determine worst state
    const rank = (state?: string) => state === "red" ? 3 : state === "amber" ? 2 : state === "green" ? 1 : 0;
    const statusState = status.state || "unknown";
    const vitalsState = vitals.state || "unknown";
    const worstState = rank(statusState) >= rank(vitalsState) ? statusState : vitalsState;

    // Check if state has changed
    if (worstState === lastNotifiedState) {
      return res.status(200).json({
        ok: true,
        sent: false,
        state: worstState,
        message: "No state change detected"
      });
    }

    // Update last notified state
    lastNotifiedState = worstState;

    // Prepare webhook payload
    const payload = {
      event: "sentinel_state_change",
      state: worstState,
      timestamp: new Date().toISOString(),
      source: "oaa-hub-sentinel",
      status: {
        ci: status.ok ? {
          state: status.state,
          run: status.run,
          pr: status.pr
        } : null
      },
      vitals: vitals.ok ? {
        state: vitals.state,
        depth: vitals.depth,
        failRate: vitals.failRate,
        windowMin: vitals.windowMin,
        waiting: vitals.waiting,
        active: vitals.active,
        delayed: vitals.delayed,
        failed: vitals.failed,
        completed: vitals.completed
      } : null
    };

    // Send to Command Ledger if configured
    const webhookUrl = process.env.LEDGER_WEBHOOK_URL;
    const webhookHmac = process.env.LEDGER_WEBHOOK_HMAC;
    
    let webhookSent = false;
    let webhookError: string | null = null;

    if (webhookUrl && webhookHmac) {
      try {
        const payloadJson = JSON.stringify(payload);
        const signature = crypto
          .createHmac("sha256", webhookHmac)
          .update(payloadJson)
          .digest("hex");

        const webhookRes = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Hub-Signature-256": `sha256=${signature}`,
            "User-Agent": "oaa-hub-sentinel/1.0"
          },
          body: payloadJson
        });

        if (webhookRes.ok) {
          webhookSent = true;
        } else {
          webhookError = `Webhook failed: ${webhookRes.status} ${webhookRes.statusText}`;
        }
      } catch (error: any) {
        webhookError = `Webhook error: ${error.message}`;
      }
    }

    return res.status(200).json({
      ok: true,
      sent: webhookSent,
      state: worstState,
      webhookUrl: webhookUrl ? "configured" : "not_configured",
      webhookError,
      payload: webhookSent ? payload : undefined
    });

  } catch (error: any) {
    console.error("Sentinel notify error:", error);
    return res.status(500).json({ 
      ok: false, 
      error: error?.message || "sentinel_notify_failed" 
    });
  }
}
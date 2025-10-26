// oaa/hub.ts
import policy from "../ops/policy.json";
import { tools } from "./registry";

export type Plan = { step: string; tool?: string; args?: any };

export async function plan(_input: any): Promise<Plan> {
  // Jade: very simple planner for now
  return { step: "fetch", tool: "webDataScout" };
}

function domainAllowed(url: string): boolean {
  if (!url) return true;
  const allowed = (policy as any).allowed_domains || [];
  const blocked = (policy as any).blocked_domains || [];
  const pass = allowed.length === 0 || allowed.some((d: string) => url.includes(d));
  const blockedHit = blocked.some((d: string) => url.includes(d.replace("*","")));
  return pass && !blockedHit;
}

export async function act(input: { tool: string; args: any }) {
  const { tool, args } = input || {};
  if (!tool || !tools[tool]) {
    return { ok:false, error:"unknown_tool" };
  }
  // Simple allowlist enforcement for URLs
  if (args?.url && !domainAllowed(args.url)) {
    return { ok:false, error:"domain_not_allowed", url: args.url };
  }
  const out = await tools[tool].call(args);
  return out;
}



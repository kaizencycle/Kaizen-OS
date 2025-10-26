import fs from "fs";
import path from "path";

export type Guard = { enabled:boolean; lastHash:string; noopCount:number; maxNoop:number };
export type Cool  = { nextAllowedAt:number; cooldownSec:number };

export const GUARD_DEFAULT: Guard = { enabled: true, lastHash: "", noopCount: 0, maxNoop: 3 };
export const COOL_DEFAULT:  Cool  = { nextAllowedAt: 0, cooldownSec: 240 };

function safeReadJSON<T>(p:string): T | null {
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch { return null; }
}
function writeJSON(p:string, obj:any) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

/** Ensures guard & cooldown files exist and are valid. Returns shapes + smoked flag. */
export function ensureAgentGuards(root:string){
  const guardPath = path.join(root, "dev", "loop_guard.json");
  const coolPath  = path.join(root, "dev", "agent_cooldown.json");

  let smoked = false;

  let guard = safeReadJSON<Guard>(guardPath);
  if (!guard || typeof guard.enabled !== "boolean" || typeof guard.maxNoop !== "number") {
    guard = { ...GUARD_DEFAULT };
    writeJSON(guardPath, guard);
    smoked = true;
  } else {
    if (typeof guard.noopCount !== "number") { guard.noopCount = 0; smoked = true; }
    if (typeof guard.lastHash  !== "string") { guard.lastHash = ""; smoked = true; }
    if (guard.maxNoop <= 0) { guard.maxNoop = GUARD_DEFAULT.maxNoop; smoked = true; }
    if (smoked) writeJSON(guardPath, guard);
  }

  let cool = safeReadJSON<Cool>(coolPath);
  if (!cool || typeof cool.cooldownSec !== "number") {
    cool = { ...COOL_DEFAULT };
    writeJSON(coolPath, cool);
    smoked = true;
  } else {
    if (typeof cool.nextAllowedAt !== "number") { cool.nextAllowedAt = 0; smoked = true; }
    if (cool.cooldownSec <= 0) { cool.cooldownSec = COOL_DEFAULT.cooldownSec; smoked = true; }
    if (smoked) writeJSON(coolPath, cool);
  }

  const now = Math.floor(Date.now()/1000);
  const remainingSec = Math.max(0, (cool!.nextAllowedAt||0) - now);

  return { smoked, guard: guard!, cooldown: cool!, now, remainingSec, paths: { guardPath, coolPath } };
}

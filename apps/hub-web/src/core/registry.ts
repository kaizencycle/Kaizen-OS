// oaa/registry.ts
export type Tool = { name: string; call: (args:any)=>Promise<any> };
export type Lab  = { id: string; routes: string[] };

export const labs: Lab[] = [
  { id: "lab7-oaa", routes: ["/oaa", "/api/oaa/*"] },
  { id: "lab4-frontend", routes: ["/", "/oaa"] },
  { id: "lab6-citizen-shield", routes: ["/gateway/*", "/agent/*"] },
  { id: "civic-ledger", routes: ["/ledger/*"] },
  { id: "gic-indexer", routes: ["/gic/*"] },
];

// Prefer the real implementation if present:
let webDataScout: any;
try {
  webDataScout = require("../lib/webDataScout").extract;
} catch {
  // Fallback stub to avoid build errors; replace with real lib/webDataScout.ts.
  webDataScout = async (args: any) => ({
    ok: true,
    data: { title: "Stub Scout", note: "Replace with lib/webDataScout.ts", args },
    meta: { url: args?.url || "", fetchedAt: new Date().toISOString(), provider: "stub" }
  });
}

export const tools: Record<string, Tool> = {
  webDataScout: { name: "webDataScout", call: webDataScout }
};



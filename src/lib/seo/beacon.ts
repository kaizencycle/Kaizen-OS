// Build page-level JSON-LD from your ranked feed + per-page hints
export type BeaconOpts = {
  id?: string;            // canonical ID for the page
  url?: string;           // absolute URL
  name?: string;          // page title
  description?: string;   // short summary
  keywords?: string[];    // extra tags per page
  kind?: "pulse"|"ledger"|"memory"|"page";
  integrity?: number;     // override integrity if you have a page-specific score
  sha256?: string;        // optional digest for proofs
  cycle?: string;
  companion?: string;
};

export function makeBeacon(opts: BeaconOpts, site: { baseUrl: string; defaultName: string }) {
  const url = opts.url || site.baseUrl;
  const id  = opts.id  || url;
  const now = new Date().toISOString();
  const integrityScore = typeof opts.integrity === "number" ? opts.integrity : 0.6; // default mid trust

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    id,
    url,
    name: opts.name || site.defaultName,
    description: opts.description || "OAA integrity-beacon page.",
    isAccessibleForFree: true,
    keywords: Array.from(new Set([...(opts.keywords||[]), "OAA","GIC","Civic Ledger","Integrity"])),
    dateModified: now,
    oaa: {
      kind: opts.kind || "page",
      gicScore: 0.6,            // can be refined by your ranker later
      accordsScore: 0.3,
      freshnessScore: 0.1,
      integrityScore,
      sha256: opts.sha256,
      cycle: opts.cycle,
      companion: opts.companion
    }
  };
}

export function toLD(beacon: any) {
  return JSON.stringify(beacon);
}

export function beaconFromRankedItem(item: any) {
  return {
    id: item.id,
    type: item["@type"] || "CreativeWork",
    url: item.url,
    name: item.name,
    description: item.description,
    dateModified: item.dateModified,
    keywords: item.keywords,
    oaa: item.oaa
  };
}

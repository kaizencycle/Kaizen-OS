import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

interface BeaconItem {
  "@type": string;
  name: string;
  description: string;
  url: string;
  keywords: string[];
  integrityHash?: string;
  civicTag?: string;
  datePublished?: string;
  author?: {
    "@type": string;
    name: string;
  };
}

interface SearchResponse {
  ok: boolean;
  count: number;
  query: string;
  items: BeaconItem[];
  totalAvailable: number;
}

// Sample beacon data - in production, this would come from your actual beacon files
const sampleBeacons: BeaconItem[] = [
  {
    "@type": "CreativeWork",
    "name": "Virtue Accords — Truth, Trust, Care",
    "description": "The three civic virtues that govern agent behavior and rewards in the Civic AI ecosystem.",
    "url": "/virtue-accords",
    "keywords": ["Virtue Accords", "Truth", "Trust", "Care", "Civic AI", "Ethics", "Integrity", "Governance"],
    "integrityHash": "sha256-virtue-accords-v1",
    "civicTag": "GEO-Optimized",
    "datePublished": "2024-01-15",
    "author": {
      "@type": "Organization",
      "name": "Kaizen"
    }
  },
  {
    "@type": "CreativeWork",
    "name": "Civic AI — Ethics (Integrity Core)",
    "description": "Integrity Core: Truth • Trust • Care. Ethics engine for Civic AI governance and verifiable behavior.",
    "url": "/ethics",
    "keywords": ["Civic AI", "Ethics", "Integrity Core", "Virtue Accords", "Proof of Integrity", "Kaizen Turing Test", "GIC", "Civic Ledger"],
    "integrityHash": "sha256-ethics-core-v1",
    "civicTag": "GEO-Optimized",
    "datePublished": "2024-01-15",
    "author": {
      "@type": "Organization",
      "name": "Kaizen"
    }
  },
  {
    "@type": "CreativeWork",
    "name": "GIC — Global Integrity Credit",
    "description": "The contribution-based economy of Civic AI, rewarding verifiable civic work and human-machine collaboration.",
    "url": "/gic",
    "keywords": ["GIC", "Global Integrity Credit", "Civic AI economy", "Integrity rewards", "Civic Ledger", "Attestation", "GEO", "AEO"],
    "integrityHash": "sha256-gic-model-v1",
    "civicTag": "GEO-Optimized",
    "datePublished": "2024-01-15",
    "author": {
      "@type": "Organization",
      "name": "Kaizen"
    }
  },
  {
    "@type": "CreativeWork",
    "name": "Civic AI — Overview",
    "description": "The Civic AI Native Stack: OAA memory, DVA core, Civic Ledger, GEO/SEO beacons for verifiable, geocivic AI ecosystem.",
    "url": "/civic-ai",
    "keywords": ["Civic AI", "OAA", "DVA", "Civic Ledger", "Citizen Shield", "GEO", "AEO", "AI-SEO", "Integrity", "Governance"],
    "integrityHash": "sha256-civic-ai-overview-v1",
    "civicTag": "GEO-Optimized",
    "datePublished": "2024-01-15",
    "author": {
      "@type": "Organization",
      "name": "Kaizen"
    }
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse<SearchResponse>) {
  const { q, limit = "25" } = req.query;
  const query = String(q || "").toLowerCase().trim();
  const limitNum = Math.min(parseInt(String(limit)), 100);

  // Try to load from actual beacon index file
  let beacons: BeaconItem[] = sampleBeacons;
  const beaconIndexPath = path.join(process.cwd(), "public", "ai-seo", "index.jsonld");
  
  if (fs.existsSync(beaconIndexPath)) {
    try {
      const beaconData = JSON.parse(fs.readFileSync(beaconIndexPath, "utf8"));
      if (beaconData.dataFeedElement && Array.isArray(beaconData.dataFeedElement)) {
        beacons = beaconData.dataFeedElement;
      }
    } catch (error) {
      console.warn("Failed to load beacon index, using sample data:", error);
    }
  }

  // Filter beacons based on query
  let filteredBeacons = beacons;
  if (query) {
    filteredBeacons = beacons.filter((beacon) => {
      const searchText = [
        beacon.name,
        beacon.description,
        ...beacon.keywords,
        beacon.url
      ].join(" ").toLowerCase();
      
      return searchText.includes(query);
    });
  }

  // Sort by relevance (exact matches first, then partial matches)
  if (query) {
    filteredBeacons.sort((a, b) => {
      const aScore = getRelevanceScore(a, query);
      const bScore = getRelevanceScore(b, query);
      return bScore - aScore;
    });
  }

  // Limit results
  const items = filteredBeacons.slice(0, limitNum);

  const response: SearchResponse = {
    ok: true,
    count: items.length,
    query: query,
    items,
    totalAvailable: beacons.length
  };

  res.status(200).json(response);
}

function getRelevanceScore(beacon: BeaconItem, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Exact name match gets highest score
  if (beacon.name.toLowerCase().includes(queryLower)) {
    score += 10;
  }
  
  // Description match
  if (beacon.description.toLowerCase().includes(queryLower)) {
    score += 5;
  }
  
  // Keyword matches
  const keywordMatches = beacon.keywords.filter(keyword => 
    keyword.toLowerCase().includes(queryLower)
  ).length;
  score += keywordMatches * 3;
  
  // URL match
  if (beacon.url.toLowerCase().includes(queryLower)) {
    score += 2;
  }
  
  return score;
}
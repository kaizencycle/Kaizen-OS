import type { NextApiRequest, NextApiResponse } from "next";

interface GeoResponse {
  ok: boolean;
  region: string;
  code: string;
  attestations: any[];
  count: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<GeoResponse>) {
  const { code } = req.query;
  const regionCode = String(code || "US-NE");

  // Sample attestations for the region
  const attestations = [
    {
      "@type": "Attestation",
      "id": "att-001",
      "region": regionCode,
      "integrityScore": 0.95,
      "civicImpact": 0.88,
      "geoWeight": 0.92,
      "gicEarned": 0.77,
      "dateCreated": "2024-01-15T10:30:00Z",
      "content": "Civic AI ethics framework implementation",
      "author": "Kaizen",
      "verificationStatus": "verified"
    },
    {
      "@type": "Attestation", 
      "id": "att-002",
      "region": regionCode,
      "integrityScore": 0.92,
      "civicImpact": 0.85,
      "geoWeight": 0.90,
      "gicEarned": 0.70,
      "dateCreated": "2024-01-14T14:20:00Z",
      "content": "Community governance proposal",
      "author": "CivicDAO",
      "verificationStatus": "verified"
    }
  ];

  const response: GeoResponse = {
    ok: true,
    region: getRegionName(regionCode),
    code: regionCode,
    attestations,
    count: attestations.length
  };

  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  res.status(200).json(response);
}

function getRegionName(code: string): string {
  const regionMap: { [key: string]: string } = {
    "US-NE": "Nebraska, United States",
    "US-CA": "California, United States", 
    "US-NY": "New York, United States",
    "EU-DE": "Germany, European Union",
    "EU-FR": "France, European Union",
    "AP-JP": "Japan, Asia-Pacific",
    "AP-SG": "Singapore, Asia-Pacific"
  };
  
  return regionMap[code] || `Region ${code}`;
}

import type { NextApiRequest, NextApiResponse } from "next";

interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

interface Attestation {
  "@type": string;
  id: string;
  latitude: number;
  longitude: number;
  distance: number;
  integrityScore: number;
  civicImpact: number;
  geoWeight: number;
  gicEarned: number;
  dateCreated: string;
  content: string;
  author: string;
  verificationStatus: string;
}

interface NearResponse {
  ok: boolean;
  coordinates: GeoCoordinates;
  radius: number;
  attestations: Attestation[];
  count: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<NearResponse>) {
  const { lat, lon, radius = "50" } = req.query;
  
  const latitude = parseFloat(String(lat || "40.7128"));
  const longitude = parseFloat(String(lon || "-74.0060"));
  const radiusKm = parseFloat(String(radius));

  // Sample attestations near the coordinates
  const attestations: Attestation[] = [
    {
      "@type": "Attestation",
      "id": "att-near-001",
      "latitude": latitude + 0.01,
      "longitude": longitude + 0.01,
      "distance:": calculateDistance(latitude, longitude, latitude + 0.01, longitude + 0.01),
      "integrityScore": 0.94,
      "civicImpact": 0.87,
      "geoWeight": 0.89,
      "gicEarned": 0.73,
      "dateCreated": "2024-01-15T09:15:00Z",
      "content": "Local civic AI implementation",
      "author": "LocalCivic",
      "verificationStatus": "verified"
    },
    {
      "@type": "Attestation",
      "id": "att-near-002", 
      "latitude": latitude - 0.005,
      "longitude": longitude + 0.02,
      "distance:": calculateDistance(latitude, longitude, latitude - 0.005, longitude + 0.02),
      "integrityScore": 0.91,
      "civicImpact": 0.83,
      "geoWeight": 0.85,
      "gicEarned": 0.65,
      "dateCreated": "2024-01-14T16:45:00Z",
      "content": "Community ethics workshop",
      "author": "EthicsGroup",
      "verificationStatus": "verified"
    }
  ].filter(att => att.distance <= radiusKm);

  const response: NearResponse = {
    ok: true,
    coordinates: { latitude, longitude },
    radius: radiusKm,
    attestations,
    count: attestations.length
  };

  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  res.status(200).json(response);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

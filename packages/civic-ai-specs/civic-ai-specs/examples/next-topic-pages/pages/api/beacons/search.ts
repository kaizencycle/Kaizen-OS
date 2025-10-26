import { NextApiRequest, NextApiResponse } from 'next';

interface Beacon {
  id: string;
  timestamp: string;
  type: string;
  content: {
    title: string;
    description: string;
    keywords: string[];
  };
  location: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    cultural_context: {
      primary_culture: string;
      languages: string[];
    };
  };
  topics: Array<{
    name: string;
    relevance_score: number;
  }>;
  ai_seo: {
    search_intent: string;
    authority_score: number;
    relevance_score: number;
  };
}

// Mock data - in a real implementation, this would come from a database
const mockBeacons: Beacon[] = [
  {
    id: "beacon-001",
    timestamp: "2025-01-01T00:00:00Z",
    type: "topic_page",
    content: {
      title: "Ethics in Civic AI",
      description: "Comprehensive framework for ethical artificial intelligence systems",
      keywords: ["AI ethics", "artificial intelligence", "ethical AI", "civic AI"]
    },
    location: {
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      cultural_context: {
        primary_culture: "Western",
        languages: ["en", "es"]
      }
    },
    topics: [
      { name: "AI Ethics", relevance_score: 0.95 },
      { name: "Community Governance", relevance_score: 0.85 }
    ],
    ai_seo: {
      search_intent: "informational",
      authority_score: 0.9,
      relevance_score: 0.95
    }
  },
  {
    id: "beacon-002",
    timestamp: "2025-01-01T00:00:00Z",
    type: "cultural_knowledge",
    content: {
      title: "Yautja Cultural Accord",
      description: "Framework for integrating traditional cultural wisdom into AI systems",
      keywords: ["cultural wisdom", "traditional knowledge", "AI integration", "community values"]
    },
    location: {
      coordinates: {
        latitude: 35.6762,
        longitude: 139.6503
      },
      cultural_context: {
        primary_culture: "Eastern",
        languages: ["ja", "en"]
      }
    },
    topics: [
      { name: "Cultural Integration", relevance_score: 0.9 },
      { name: "Traditional Knowledge", relevance_score: 0.85 }
    ],
    ai_seo: {
      search_intent: "informational",
      authority_score: 0.85,
      relevance_score: 0.9
    }
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      query, 
      type, 
      culture, 
      lat, 
      lng, 
      radius = 100, 
      limit = 10,
      min_authority = 0,
      min_relevance = 0
    } = req.query;

    let filteredBeacons = [...mockBeacons];

    // Filter by query
    if (query && typeof query === 'string') {
      const searchQuery = query.toLowerCase();
      filteredBeacons = filteredBeacons.filter(beacon => 
        beacon.content.title.toLowerCase().includes(searchQuery) ||
        beacon.content.description.toLowerCase().includes(searchQuery) ||
        beacon.content.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchQuery)
        )
      );
    }

    // Filter by type
    if (type && typeof type === 'string') {
      filteredBeacons = filteredBeacons.filter(beacon => 
        beacon.type === type
      );
    }

    // Filter by culture
    if (culture && typeof culture === 'string') {
      filteredBeacons = filteredBeacons.filter(beacon => 
        beacon.location.cultural_context.primary_culture.toLowerCase() === culture.toLowerCase()
      );
    }

    // Filter by location (simple distance calculation)
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const searchRadius = parseFloat(radius as string);

      filteredBeacons = filteredBeacons.filter(beacon => {
        const distance = calculateDistance(
          userLat, userLng,
          beacon.location.coordinates.latitude,
          beacon.location.coordinates.longitude
        );
        return distance <= searchRadius;
      });
    }

    // Filter by authority and relevance scores
    const minAuth = parseFloat(min_authority as string);
    const minRel = parseFloat(min_relevance as string);

    filteredBeacons = filteredBeacons.filter(beacon => 
      beacon.ai_seo.authority_score >= minAuth &&
      beacon.ai_seo.relevance_score >= minRel
    );

    // Sort by relevance score (descending)
    filteredBeacons.sort((a, b) => 
      b.ai_seo.relevance_score - a.ai_seo.relevance_score
    );

    // Apply limit
    const limitNum = parseInt(limit as string);
    filteredBeacons = filteredBeacons.slice(0, limitNum);

    // Return results
    res.status(200).json({
      success: true,
      query: {
        query,
        type,
        culture,
        lat,
        lng,
        radius,
        limit,
        min_authority,
        min_relevance
      },
      results: {
        total: filteredBeacons.length,
        beacons: filteredBeacons
      },
      metadata: {
        search_timestamp: new Date().toISOString(),
        search_id: `search_${Date.now()}`
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred while searching beacons'
    });
  }
}

// Simple distance calculation (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Scout Test API Endpoint
 * 
 * Provides testing and debugging capabilities for the WebDataScout system.
 * Includes endpoints for single extraction, batch extraction, cache management,
 * and health checks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { extract, extractBatch, clearCache, getCacheStats, type ScoutSchema, type ScoutConfig } from '@/lib/webDataScout';

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

// GET /api/scout-test - Health check and cache stats
export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const stats = getCacheStats();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      cache: stats,
      config: {
        scoutEndpoint: !!process.env.SCOUT_ENDPOINT || !!process.env.NEXT_PUBLIC_SCOUT_ENDPOINT,
        scoutApiKey: !!process.env.SCOUT_API_KEY || !!process.env.NEXT_PUBLIC_SCOUT_API_KEY,
      }
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/scout-test/extract - Single URL extraction
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { url, fields, config } = body;

    if (!url || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Missing required fields: url, fields' },
        { status: 400 }
      );
    }

    // Validate fields schema
    const schema: ScoutSchema = fields.map((field: any) => ({
      name: field.name,
      selector: field.selector,
      required: field.required || false,
      type: field.type || 'string',
      transform: field.transform ? (new Function('value', `return ${field.transform}`) as (value: any) => any) : undefined,
    }));

    const result = await extract(url, schema, config || {});
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Extraction failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/scout-test/batch - Batch extraction
export async function PUT(request: NextRequest) {
  const ip = getClientIP(request);
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { requests } = body;

    if (!requests || !Array.isArray(requests)) {
      return NextResponse.json(
        { error: 'Missing required field: requests (array)' },
        { status: 400 }
      );
    }

    if (requests.length > 10) {
      return NextResponse.json(
        { error: 'Batch size too large (max 10 requests)' },
        { status: 400 }
      );
    }

    // Validate and transform requests
    const validatedRequests = requests.map((req: any) => ({
      url: req.url,
      fields: req.fields.map((field: any) => ({
        name: field.name,
        selector: field.selector,
        required: field.required || false,
        type: field.type || 'string',
        transform: field.transform ? new Function('value', `return ${field.transform}`) : undefined,
      })),
      config: req.config || {}
    }));

    const results = await extractBatch(validatedRequests);
    
    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.ok).length,
        failed: results.filter(r => !r.ok).length,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Batch extraction failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/scout-test/cache - Clear cache
export async function DELETE(request: NextRequest) {
  const ip = getClientIP(request);
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    await clearCache(url || undefined);
    
    return NextResponse.json({
      success: true,
      message: url ? `Cache cleared for ${url}` : 'All cache cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Cache clear failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Example usage endpoints for common scenarios
export async function PATCH(request: NextRequest) {
  const ip = getClientIP(request);
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { scenario } = body;

    const scenarios = {
      'oaa-lesson': {
        url: 'https://example.com/blog/post',
        fields: [
          { name: 'title', required: true, type: 'string' },
          { name: 'author', type: 'string' },
          { name: 'updated_at', type: 'string' },
          { name: 'content', type: 'string' }
        ]
      },
      'status-intelligence': {
        url: 'https://status.render.com',
        fields: [
          { name: 'status', required: true, type: 'string' },
          { name: 'incidents', type: 'array' },
          { name: 'timestamp', type: 'string' }
        ]
      },
      'civic-data': {
        url: 'https://data.cityofchicago.org/api/views/example',
        fields: [
          { name: 'rows', type: 'array' },
          { name: 'columns', type: 'array' },
          { name: 'metadata', type: 'object' }
        ]
      },
      'job-feed': {
        url: 'https://jobs.example.com',
        fields: [
          { name: 'jobs', type: 'array' },
          { name: 'total_count', type: 'number' },
          { name: 'last_updated', type: 'string' }
        ]
      }
    };

    if (!scenario || !scenarios[scenario as keyof typeof scenarios]) {
      return NextResponse.json(
        { error: 'Invalid scenario', available: Object.keys(scenarios) },
        { status: 400 }
      );
    }

    const config = scenarios[scenario as keyof typeof scenarios];
    const result = await extract(config.url, config.fields as ScoutSchema);
    
    return NextResponse.json({
      scenario,
      config,
      result
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Scenario test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

const OAA_BASE_URL = process.env.NEXT_PUBLIC_OAA_BASE || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${OAA_BASE_URL}/dev/quality/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OAA API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quality metrics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch quality metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    let endpoint = '';
    switch (action) {
      case 'record-output':
        endpoint = '/dev/quality/record-output';
        break;
      case 'record-copilot-overlap':
        endpoint = '/dev/quality/record-copilot-overlap';
        break;
      case 'record-rollback':
        endpoint = '/dev/quality/record-rollback';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const response = await fetch(`${OAA_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`OAA API error: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error recording quality metric:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record quality metric',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
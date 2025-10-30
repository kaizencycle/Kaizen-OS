import { NextRequest, NextResponse } from 'next/server'
import { codexDeliberate } from '../../../lib/codex-stub'
import type { CodexRequest } from '../../../lib/codex-stub'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<CodexRequest>

    // Validate required fields
    if (!body.input) {
      return NextResponse.json(
        { error: 'Missing required field: input' },
        { status: 400 }
      )
    }

    // Force AUREA agent for this site
    const codexRequest: CodexRequest = {
      agent: 'AUREA',
      input: body.input,
      context: body.context,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      tags: body.tags,
    }

    // Execute deliberation
    const proof = await codexDeliberate(codexRequest)

    return NextResponse.json(proof)
  } catch (error: any) {
    console.error('[API] Codex query error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Create a TransformStream for SSE
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Helper to send SSE message
  const send = (event: string, data: any) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    writer.write(encoder.encode(message))
  }

  // Start streaming
  ;(async () => {
    try {
      // Send hello
      send('hello', {
        message: 'Connected to AUREA GI stream',
        timestamp: new Date().toISOString(),
      })

      // Heartbeat loop (every 5 seconds)
      const heartbeatInterval = setInterval(() => {
        // TODO: Fetch real GI metrics from ledger or monitoring service
        const mockGI = 0.993 - Math.random() * 0.003 // 0.990-0.993 range

        send('heartbeat', {
          gi: parseFloat(mockGI.toFixed(3)),
          timestamp: new Date().toISOString(),
        })
      }, 5000)

      // Keep connection alive
      await new Promise((resolve) => {
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval)
          resolve(null)
        })
      })
    } catch (error) {
      console.error('[SSE] Error:', error)
    } finally {
      writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

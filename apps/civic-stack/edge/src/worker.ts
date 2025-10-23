export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/status.json') {
      return new Response(JSON.stringify({ healthy: true, ts: Date.now() }), {
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
      })
    }
    if (url.pathname === '/replay' && request.method === 'POST') {
      const body = await request.json().catch(()=>({}))
      const idk = request.headers.get('x-idempotency-key') || 'none'
      await env.ALERTS_KV.put(`replay:${idk}`, JSON.stringify({ body, ts: Date.now() }))
      return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' }})
    }
    return new Response('ok')
  }
}

import 'dotenv/config'
import { connect, StringCodec } from 'nats'
import axios from 'axios'
import { v4 as uuid } from 'uuid'

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222'
const PRIMARY_API_BASE = process.env.PRIMARY_API_BASE || 'http://localhost:8787'
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''

async function main() {
  const nc = await connect({ servers: NATS_URL })
  console.log('[replay] connected to', NATS_URL)
  const sc = StringCodec()
  const sub = nc.subscribe('civic.writes')
  for await (const m of sub) {
    const payload = JSON.parse(sc.decode(m.data))
    try {
      await axios.post(`${PRIMARY_API_BASE}/replay`, payload, {
        headers: { 'authorization': AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : '', 'x-idempotency-key': uuid() }, timeout: 10000
      })
      console.log('[replay] ok', payload.type)
    } catch (e) {
      console.warn('[replay] failed; retry later', e.message)
    }
  }
}
main().catch(e => { console.error(e); process.exit(1) })

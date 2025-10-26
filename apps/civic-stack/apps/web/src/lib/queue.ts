import { openDB } from 'idb'
import { v4 as uuid } from 'uuid'
import axios from 'axios'

const DB_NAME = 'civic-queue'
const STORE = 'writes'

async function db() {
  return openDB(DB_NAME, 1, { upgrade(d) { d.createObjectStore(STORE, { keyPath: 'id' }) } })
}

export async function queueWrite(body: any) {
  const d = await db()
  const item = { id: uuid(), ts: Date.now(), body, idempotencyKey: uuid() }
  await d.put(STORE, item)
  return item.id
}

export async function getQueueSize() {
  const d = await db()
  let c = 0; let cursor = await d.transaction(STORE).store.openCursor()
  while (cursor) { c++; cursor = await cursor.continue() }
  return c
}

export async function drainQueue() {
  const endpoint = process.env.NEXT_PUBLIC_PRIMARY_API || 'http://localhost:8787/replay'
  const d = await db()
  let drained = 0; let cursor = await d.transaction(STORE, 'readwrite').store.openCursor()
  while (cursor) {
    try {
      await axios.post(endpoint, cursor.value.body, { headers: { 'x-idempotency-key': cursor.value.idempotencyKey } })
      await cursor.delete(); drained++
    } catch(e) { break }
    cursor = await cursor.continue()
  }
  return drained
}


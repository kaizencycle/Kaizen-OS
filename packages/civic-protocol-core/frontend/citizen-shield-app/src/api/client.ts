export const BASE_URL = import.meta.env.VITE_LAB6_API || 'https://lab6-proof-api.onrender.com'

async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  onboard: (payload: { agent: string; accepted: boolean; note?: string }) =>
    http('/onboard', { method: 'POST', body: JSON.stringify(payload) }),

  enroll: (payload: { name: string; citizenId: string; pubkey?: string }) =>
    http('/enroll', { method: 'POST', body: JSON.stringify(payload) }),

  verifyReflection: (payload: { reflection_hash: string }) =>
    http('/zk/verify-reflection', { method: 'POST', body: JSON.stringify(payload) }),

  groupStatus: () => http('/group/status'),
}


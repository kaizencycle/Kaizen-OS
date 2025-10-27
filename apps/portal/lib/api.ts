import { HealthStatus, Companion, GIResponse, Reflection, DomainPreview, OnboardApplication } from './types';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { 
      'Content-Type': 'application/json', 
      ...(init.headers || {}) 
    },
    cache: 'no-store',
    ...init,
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(`API Error ${r.status}: ${errorText}`);
  }
  
  return r.json() as Promise<T>;
}

export const api = {
  status: () => req<HealthStatus>('/v1/status'),
  
  companions: () => req<Companion[]>('/v1/companions'),
  
  meGI: (jwt?: string) => req<GIResponse>('/v1/gi/me', { 
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} 
  }),
  
  reflections: {
    list: (jwt: string) => req<Reflection[]>('/v1/reflections/me', { 
      headers: { Authorization: `Bearer ${jwt}` } 
    }),
    create: (jwt: string, body: { content: string; domain_id?: string }) => req<Reflection>('/v1/reflections', {
      method: 'POST', 
      headers: { Authorization: `Bearer ${jwt}` }, 
      body: JSON.stringify(body)
    }),
  },
  
  domains: {
    preview: (jwt: string, cfg: any) => req<DomainPreview>('/v1/domains/preview', {
      method: 'POST', 
      headers: { Authorization: `Bearer ${jwt}` }, 
      body: JSON.stringify(cfg)
    }),
    seal: (jwt: string, cfg: any) => req<{ success: boolean; domain: string; tx_hash?: string }>('/v1/domains/seal', {
      method: 'POST', 
      headers: { Authorization: `Bearer ${jwt}` }, 
      body: JSON.stringify(cfg)
    }),
  },
  
  onboard: (data: OnboardApplication) => req<{ success: boolean; application_id: string }>('/v1/onboard/apply', {
    method: 'POST', 
    body: JSON.stringify(data)
  }),
};
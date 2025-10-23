import type { Request, Response } from 'express';

export function healthHandler(_req: Request, res: Response) {
  return res.status(200).json({ ok: true, service: 'thought-broker', ts: new Date().toISOString() });
}
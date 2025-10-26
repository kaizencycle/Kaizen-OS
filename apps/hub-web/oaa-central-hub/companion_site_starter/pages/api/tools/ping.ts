import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyHmac } from '../../../lib/verifyHmac';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'method_not_allowed' });
  const raw = JSON.stringify(req.body || {});
  const sig = req.headers['x-citizen-sig'] as string | undefined;
  const ok = process.env.GATEWAY_HMAC_SECRET ? verifyHmac(raw, sig, process.env.GATEWAY_HMAC_SECRET) : true;
  if (!ok) return res.status(401).json({ ok:false, error:'invalid_signature' });
  const text = (req.body?.text || '').toString();
  return res.status(200).json({ ok:true, echo:text });
}



import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_req: NextApiRequest, res: NextApiResponse){
  return res.status(200).json({
    ok: true,
    name: process.env.COMPANION_NAME || 'Companion',
    ts: new Date().toISOString()
  });
}


import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const guardPath = path.join(process.cwd(), 'dev', 'loop_guard.json');
    const data = fs.readFileSync(guardPath, 'utf8');
    const guard = JSON.parse(data);
    
    res.status(200).json(guard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read loop guard file' });
  }
}


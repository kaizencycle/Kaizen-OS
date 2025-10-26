import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cooldownPath = path.join(process.cwd(), 'dev', 'agent_cooldown.json');
    const data = fs.readFileSync(cooldownPath, 'utf8');
    const cooldown = JSON.parse(data);
    
    res.status(200).json(cooldown);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read agent cooldown file' });
  }
}

import type { Request, Response } from 'express';
import { listRegions } from '../services/region.service.js';

export async function getRegions(_req: Request, res: Response) {
  const regions = await listRegions();
  res.json({ data: regions });
}

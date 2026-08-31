import type { Request, Response } from 'express';
import { getSecuritySummary, listSecurityEvents } from '../services/security.service.js';

/** GET /api/security/events - recent security-relevant events (admin only). */
export async function getEvents(_req: Request, res: Response) {
  res.json({ data: await listSecurityEvents() });
}

/** GET /api/security/summary - 24h counts per event type (admin only). */
export async function getSummary(_req: Request, res: Response) {
  res.json({ data: await getSecuritySummary() });
}

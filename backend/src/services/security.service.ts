import { prisma } from '../lib/prisma.js';

/** Most recent security events (failed auth, invalid tokens, etc.), newest first. */
export function listSecurityEvents(limit = 100) {
  return prisma.securityEvent.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
}

/** Quick counts per event type in the last 24h, for an at-a-glance admin summary. */
export async function getSecuritySummary() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const events = await prisma.securityEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { type: true },
  });
  const byType: Record<string, number> = {};
  for (const e of events) byType[e.type] = (byType[e.type] ?? 0) + 1;
  return { total24h: events.length, byType };
}

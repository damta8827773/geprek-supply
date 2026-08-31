import crypto from 'node:crypto';
import type { ChatSession } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { getBotReply } from '../lib/chatBot.js';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

// Rough average time an admin spends per queued chat, used only for the
// visitor-facing wait estimate - not a promised SLA.
const AVG_MINUTES_PER_QUEUE_SLOT = 5;

/** Starts a new chat session and returns the raw token (shown once). */
export async function startChatSession(name?: string) {
  const token = crypto.randomBytes(24).toString('hex');
  const session = await prisma.chatSession.create({
    data: { clientToken: sha256(token), name: name?.trim() || null },
  });
  const greeting = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      sender: 'BOT',
      text: 'Halo! Saya asisten Geprek-Supply. Ada yang bisa saya bantu?',
    },
  });
  return { session, token, messages: [greeting] };
}

/**
 * Posts a visitor message. If the session is still bot-handled, the bot
 * replies inline immediately (no human involved). If a human has already
 * joined (QUEUED/WITH_ADMIN), the message just waits for the admin - the bot
 * stays silent so it doesn't talk over a real person.
 */
export async function postVisitorMessage(session: ChatSession, text: string) {
  if (session.status === 'CLOSED') {
    throw ApiError.badRequest('Sesi chat ini sudah ditutup.');
  }

  const userMsg = await prisma.chatMessage.create({
    data: { sessionId: session.id, sender: 'USER', text: text.trim() },
  });

  if (session.status !== 'BOT') {
    // A human is already (or about to be) involved - let them answer.
    return { messages: [userMsg], suggestEscalate: false };
  }

  const bot = getBotReply(text);
  const botMsg = await prisma.chatMessage.create({
    data: { sessionId: session.id, sender: 'BOT', text: bot.reply },
  });
  return { messages: [userMsg, botMsg], suggestEscalate: bot.suggestEscalate };
}

/**
 * Explicit hand-off to a human admin - only ever called from a visitor
 * clicking "Sambungkan ke Admin", never automatically by the bot. Assigns a
 * permanent queue ticket number and records the escalation time for the
 * position/estimate calculation.
 */
export async function escalateToAdmin(session: ChatSession) {
  if (session.status === 'QUEUED' || session.status === 'WITH_ADMIN') {
    return session; // already escalated; idempotent
  }
  if (session.status === 'CLOSED') {
    throw ApiError.badRequest('Sesi chat ini sudah ditutup.');
  }

  const last = await prisma.chatSession.findFirst({
    where: { queueNumber: { not: null } },
    orderBy: { queueNumber: 'desc' },
    select: { queueNumber: true },
  });
  const queueNumber = (last?.queueNumber ?? 0) + 1;

  const updated = await prisma.chatSession.update({
    where: { id: session.id },
    data: { status: 'QUEUED', queueNumber, escalatedAt: new Date() },
  });
  await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      sender: 'BOT',
      text: `Baik, saya sambungkan ke admin. Nomor antrianmu #${queueNumber}. Mohon tunggu ya.`,
    },
  });
  return updated;
}

/** Visitor-facing queue position (1 = next) and a rough wait estimate. */
export async function getQueueStatus(session: ChatSession) {
  if (session.status !== 'QUEUED' || !session.escalatedAt) return null;
  const ahead = await prisma.chatSession.count({
    where: { status: 'QUEUED', escalatedAt: { lt: session.escalatedAt } },
  });
  const position = ahead + 1;
  return {
    queueNumber: session.queueNumber,
    position,
    estimatedMinutes: position * AVG_MINUTES_PER_QUEUE_SLOT,
  };
}

/** All messages in a session, oldest first. */
export function getMessages(sessionId: number) {
  return prisma.chatMessage.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' } });
}

/** Marks all ADMIN messages in a session as read by the visitor. */
export async function markAdminMessagesRead(sessionId: number) {
  await prisma.chatMessage.updateMany({
    where: { sessionId, sender: 'ADMIN', readAt: null },
    data: { readAt: new Date() },
  });
}

/** Marks all USER messages in a session as read by the admin. */
export async function markUserMessagesRead(sessionId: number) {
  await prisma.chatMessage.updateMany({
    where: { sessionId, sender: 'USER', readAt: null },
    data: { readAt: new Date() },
  });
}

/**
 * Admin-facing queue/inbox: sessions needing attention (QUEUED, ordered by
 * wait time) followed by ones already being handled (WITH_ADMIN), each with
 * an unread-from-visitor count and the last message preview.
 */
export async function listAdminInbox() {
  const sessions = await prisma.chatSession.findMany({
    where: { status: { in: ['QUEUED', 'WITH_ADMIN'] } },
    orderBy: [{ status: 'asc' }, { escalatedAt: 'asc' }],
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { messages: { where: { sender: 'USER', readAt: null } } } },
    },
  });
  return sessions.map((s, i) => ({
    id: s.id,
    name: s.name,
    status: s.status,
    queueNumber: s.queueNumber,
    position: s.status === 'QUEUED' ? i + 1 : null,
    lastMessage: s.messages[0]?.text ?? null,
    lastMessageAt: s.messages[0]?.createdAt ?? s.createdAt,
    unreadFromUser: s._count.messages,
    createdAt: s.createdAt,
    escalatedAt: s.escalatedAt,
  }));
}

/** Admin replies in a session; auto-claims it (BOT/QUEUED -> WITH_ADMIN). */
export async function postAdminReply(sessionId: number, text: string) {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session) throw ApiError.notFound('Sesi chat tidak ditemukan.');
  if (session.status === 'CLOSED') throw ApiError.badRequest('Sesi chat ini sudah ditutup.');

  if (session.status !== 'WITH_ADMIN') {
    await prisma.chatSession.update({ where: { id: sessionId }, data: { status: 'WITH_ADMIN' } });
  }
  return prisma.chatMessage.create({ data: { sessionId, sender: 'ADMIN', text: text.trim() } });
}

/** Admin closes a session. */
export async function closeSession(sessionId: number) {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session) throw ApiError.notFound('Sesi chat tidak ditemukan.');
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: { status: 'CLOSED', closedAt: new Date() },
  });
}

/** Count of visitors currently waiting for a human - drives the admin badge. */
export async function getQueueCount() {
  return prisma.chatSession.count({ where: { status: 'QUEUED' } });
}

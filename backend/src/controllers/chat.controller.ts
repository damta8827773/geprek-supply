import type { ChatSession } from '@prisma/client';
import type { Request, Response } from 'express';
import {
  closeSession,
  escalateToAdmin,
  getMessages,
  getQueueCount,
  getQueueStatus,
  listAdminInbox,
  markAdminMessagesRead,
  markUserMessagesRead,
  postAdminReply,
  postVisitorMessage,
  startChatSession,
} from '../services/chat.service.js';
import type { AdminReplyInput, PostMessageInput, StartChatInput } from '../schemas/chat.schema.js';

/** POST /api/chat/sessions - visitor starts a new conversation. */
export async function postStartSession(req: Request, res: Response) {
  const { name } = req.body as StartChatInput;
  const { session, token, messages } = await startChatSession(name);
  res.status(201).json({ data: { sessionId: session.id, token, status: session.status, messages } });
}

/** GET /api/chat/sessions/me - visitor polls their own thread + queue status. */
export async function getMySession(_req: Request, res: Response) {
  const session = res.locals.chatSession as ChatSession;
  await markAdminMessagesRead(session.id);
  const [messages, queue] = await Promise.all([getMessages(session.id), getQueueStatus(session)]);
  res.json({ data: { status: session.status, queueNumber: session.queueNumber, queue, messages } });
}

/** POST /api/chat/sessions/message - visitor sends a message. */
export async function postMyMessage(req: Request, res: Response) {
  const session = res.locals.chatSession as ChatSession;
  const { text } = req.body as PostMessageInput;
  const result = await postVisitorMessage(session, text);
  res.status(201).json({ data: result });
}

/** POST /api/chat/sessions/escalate - visitor explicitly asks for a human admin. */
export async function postEscalate(_req: Request, res: Response) {
  const session = res.locals.chatSession as ChatSession;
  const updated = await escalateToAdmin(session);
  const queue = await getQueueStatus(updated);
  res.json({ data: { status: updated.status, queueNumber: updated.queueNumber, queue } });
}

/** GET /api/chat/admin/queue-count - lightweight count for the admin nav badge. */
export async function getAdminQueueCount(_req: Request, res: Response) {
  res.json({ data: { count: await getQueueCount() } });
}

/** GET /api/chat/admin/inbox - admin's list of sessions needing attention. */
export async function getAdminInbox(_req: Request, res: Response) {
  res.json({ data: await listAdminInbox() });
}

/** GET /api/chat/admin/:id - admin opens one thread. */
export async function getAdminSession(req: Request, res: Response) {
  const { id } = req.params as unknown as { id: number };
  await markUserMessagesRead(id);
  res.json({ data: await getMessages(id) });
}

/** POST /api/chat/admin/:id/reply - admin replies. */
export async function postAdminSessionReply(req: Request, res: Response) {
  const { id } = req.params as unknown as { id: number };
  const { text } = req.body as AdminReplyInput;
  res.status(201).json({ data: await postAdminReply(id, text) });
}

/** POST /api/chat/admin/:id/close - admin closes the session. */
export async function postAdminClose(req: Request, res: Response) {
  const { id } = req.params as unknown as { id: number };
  res.json({ data: await closeSession(id) });
}

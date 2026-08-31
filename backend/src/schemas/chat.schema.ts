import { z } from 'zod';

/** `POST /api/chat/sessions` - starts a new visitor chat. */
export const startChatSchema = z.object({
  name: z.string().max(80).optional(),
});

/** `POST /api/chat/sessions/message` - visitor sends a message; bot replies inline. */
export const postMessageSchema = z.object({
  text: z.string().min(1).max(1000),
});

/** `POST /api/chat/admin/:id/reply` - admin replies in a session. */
export const adminReplySchema = z.object({
  text: z.string().min(1).max(2000),
});

export const sessionIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type StartChatInput = z.infer<typeof startChatSchema>;
export type PostMessageInput = z.infer<typeof postMessageSchema>;
export type AdminReplyInput = z.infer<typeof adminReplySchema>;

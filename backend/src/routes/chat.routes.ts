import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getAdminInbox,
  getAdminQueueCount,
  getAdminSession,
  getMySession,
  postAdminClose,
  postAdminSessionReply,
  postEscalate,
  postMyMessage,
  postStartSession,
} from '../controllers/chat.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireChatSession } from '../middleware/chatAuth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  adminReplySchema,
  postMessageSchema,
  sessionIdParamsSchema,
  startChatSchema,
} from '../schemas/chat.schema.js';

const router = Router();

// Generous but bounded - a chat widget can legitimately send several messages
// per minute; this just blunts scripted abuse.
const chatLimiter = rateLimit({
  windowMs: 60_000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Visitor-facing (session-token gated).
router.post('/sessions', chatLimiter, validate(startChatSchema), asyncHandler(postStartSession));
router.get('/sessions/me', requireChatSession, asyncHandler(getMySession));
router.post(
  '/sessions/message',
  chatLimiter,
  requireChatSession,
  validate(postMessageSchema),
  asyncHandler(postMyMessage),
);
router.post('/sessions/escalate', requireChatSession, asyncHandler(postEscalate));

// Admin-facing (admin-gated).
router.get('/admin/queue-count', requireAdmin, asyncHandler(getAdminQueueCount));
router.get('/admin/inbox', requireAdmin, asyncHandler(getAdminInbox));
router.get(
  '/admin/:id',
  requireAdmin,
  validate(sessionIdParamsSchema, 'params'),
  asyncHandler(getAdminSession),
);
router.post(
  '/admin/:id/reply',
  requireAdmin,
  validate(sessionIdParamsSchema, 'params'),
  validate(adminReplySchema),
  asyncHandler(postAdminSessionReply),
);
router.post(
  '/admin/:id/close',
  requireAdmin,
  validate(sessionIdParamsSchema, 'params'),
  asyncHandler(postAdminClose),
);

export default router;

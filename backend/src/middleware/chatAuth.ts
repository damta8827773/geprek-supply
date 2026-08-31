import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { logSecurityEvent } from '../lib/security.js';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/**
 * Gate for visitor chat endpoints. The raw session token lives only in the
 * visitor's browser (localStorage) and is sent as `x-chat-token`; only its
 * sha256 hash is stored server-side, so no one else can read or post into
 * another visitor's conversation by guessing a session id.
 */
export async function requireChatSession(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header('x-chat-token')?.trim();
    if (!token) throw ApiError.unauthorized('Sesi chat tidak ditemukan.');
    const session = await prisma.chatSession.findUnique({ where: { clientToken: sha256(token) } });
    if (!session) {
      logSecurityEvent('CHAT_SESSION_INVALID', 'Unrecognized chat session token presented', req);
      throw ApiError.unauthorized('Sesi chat tidak valid.');
    }
    res.locals.chatSession = session;
    next();
  } catch (err) {
    next(err);
  }
}

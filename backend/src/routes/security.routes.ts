import { Router } from 'express';
import { getEvents, getSummary } from '../controllers/security.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/events', requireAdmin, asyncHandler(getEvents));
router.get('/summary', requireAdmin, asyncHandler(getSummary));

export default router;

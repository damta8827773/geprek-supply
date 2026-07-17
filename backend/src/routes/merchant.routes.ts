import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { postLogin, postRegister } from '../controllers/merchant.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, registerSchema } from '../schemas/merchant.schema.js';

const router = Router();

// Throttle auth endpoints to blunt abuse / credential-guessing.
const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(postRegister));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(postLogin));

export default router;

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  deleteMerchantById,
  deleteMyProduct,
  getMerchants,
  getMyProducts,
  patchMyProduct,
  patchMyProfile,
  postChangePassword,
  postForgot,
  postGoogle,
  postLogin,
  postMyProduct,
  postRegister,
  postReset,
} from '../controllers/merchant.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireMerchant } from '../middleware/merchantAuth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  changePasswordSchema,
  forgotSchema,
  googleSchema,
  loginSchema,
  merchantIdParamsSchema,
  registerSchema,
  resetSchema,
  updateProfileSchema,
} from '../schemas/merchant.schema.js';
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from '../schemas/product.schema.js';

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
router.post('/google', authLimiter, validate(googleSchema), asyncHandler(postGoogle));
router.post('/forgot-password', authLimiter, validate(forgotSchema), asyncHandler(postForgot));
router.post('/reset-password', authLimiter, validate(resetSchema), asyncHandler(postReset));

// Admin: list / remove registered merchants.
router.get('/', requireAdmin, asyncHandler(getMerchants));
router.delete('/:id', requireAdmin, validate(merchantIdParamsSchema, 'params'), asyncHandler(deleteMerchantById));

// Merchant self-service: own profile + password (gated by x-merchant-token session).
router.patch('/me', requireMerchant, validate(updateProfileSchema), asyncHandler(patchMyProfile));
router.post(
  '/me/change-password',
  requireMerchant,
  authLimiter,
  validate(changePasswordSchema),
  asyncHandler(postChangePassword),
);

// Merchant self-service product management.
router.get('/me/products', requireMerchant, asyncHandler(getMyProducts));
router.post('/me/products', requireMerchant, validate(createProductSchema), asyncHandler(postMyProduct));
router.patch(
  '/me/products/:id',
  requireMerchant,
  validate(productIdSchema, 'params'),
  validate(updateProductSchema),
  asyncHandler(patchMyProduct),
);
router.delete(
  '/me/products/:id',
  requireMerchant,
  validate(productIdSchema, 'params'),
  asyncHandler(deleteMyProduct),
);

export default router;

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  deleteMyProduct,
  getMerchants,
  getMyProducts,
  patchMyProduct,
  postLogin,
  postMyProduct,
  postRegister,
} from '../controllers/merchant.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireMerchant } from '../middleware/merchantAuth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, registerSchema } from '../schemas/merchant.schema.js';
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

// Admin: list every registered merchant.
router.get('/', requireAdmin, asyncHandler(getMerchants));

// Merchant self-service product management (gated by x-merchant-email).
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

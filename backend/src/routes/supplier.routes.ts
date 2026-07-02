import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getAllSuppliers, patchSupplierStock } from '../controllers/supplier.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { supplierIdParamsSchema, updateStockSchema } from '../schemas/supplier.schema.js';

const router = Router();

// Tighter limit on the sensitive mutation endpoint than the global API limiter,
// to blunt credential-guessing / abuse against admin writes.
const adminLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.get('/', asyncHandler(getAllSuppliers));

router.patch(
  '/:id',
  adminLimiter,
  requireAdmin,
  validate(supplierIdParamsSchema, 'params'),
  validate(updateStockSchema, 'body'),
  asyncHandler(patchSupplierStock),
);

export default router;

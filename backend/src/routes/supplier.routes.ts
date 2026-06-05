import { Router } from 'express';
import { getAllSuppliers, patchSupplierStock } from '../controllers/supplier.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { supplierIdParamsSchema, updateStockSchema } from '../schemas/supplier.schema.js';

const router = Router();

router.get('/', asyncHandler(getAllSuppliers));

router.patch(
  '/:id',
  requireAdmin,
  validate(supplierIdParamsSchema, 'params'),
  validate(updateStockSchema, 'body'),
  asyncHandler(patchSupplierStock),
);

export default router;

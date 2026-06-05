import { Router } from 'express';
import { getRegions } from '../controllers/region.controller.js';
import { getRegionSuppliers } from '../controllers/supplier.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { radiusQuerySchema, regionKeyParamsSchema } from '../schemas/supplier.schema.js';

const router = Router();

router.get('/', asyncHandler(getRegions));

router.get(
  '/:key/suppliers',
  validate(regionKeyParamsSchema, 'params'),
  validate(radiusQuerySchema, 'query'),
  asyncHandler(getRegionSuppliers),
);

export default router;

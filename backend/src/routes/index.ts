import { Router } from 'express';
import regionRoutes from './region.routes.js';
import supplierRoutes from './supplier.routes.js';
import { getNearby } from '../controllers/supplier.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nearbyQuerySchema } from '../schemas/supplier.schema.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'geprek-supply-api', timestamp: new Date().toISOString() });
});

router.get('/nearby', validate(nearbyQuerySchema, 'query'), asyncHandler(getNearby));
router.use('/regions', regionRoutes);
router.use('/suppliers', supplierRoutes);

export default router;

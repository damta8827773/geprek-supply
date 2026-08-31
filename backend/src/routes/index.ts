import { Router } from 'express';
import regionRoutes from './region.routes.js';
import supplierRoutes from './supplier.routes.js';
import merchantRoutes from './merchant.routes.js';
import chatRoutes from './chat.routes.js';
import securityRoutes from './security.routes.js';
import { getNearby, getNearbyByPlace, getShopProducts } from '../controllers/supplier.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nearbyPlaceQuerySchema, nearbyQuerySchema } from '../schemas/supplier.schema.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'geprek-supply-api', timestamp: new Date().toISOString() });
});

router.get('/nearby', validate(nearbyQuerySchema, 'query'), asyncHandler(getNearby));
router.get('/nearby-place', validate(nearbyPlaceQuerySchema, 'query'), asyncHandler(getNearbyByPlace));
router.get('/shop-products', validate(nearbyQuerySchema, 'query'), asyncHandler(getShopProducts));
router.use('/regions', regionRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/merchants', merchantRoutes);
router.use('/chat', chatRoutes);
router.use('/security', securityRoutes);

export default router;

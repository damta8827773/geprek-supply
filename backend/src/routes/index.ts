import { Router } from 'express';
import regionRoutes from './region.routes.js';
import supplierRoutes from './supplier.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'geprek-supply-api', timestamp: new Date().toISOString() });
});

router.use('/regions', regionRoutes);
router.use('/suppliers', supplierRoutes);

export default router;

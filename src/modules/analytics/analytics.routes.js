import { Router } from 'express';
import { z } from 'zod';
import { AnalyticsController } from './analytics.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { requireMinRole } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';

const router = Router();
const controller = new AnalyticsController();

const logActivitySchema = z.object({
  action: z.string().min(1).max(255),
  entityType: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

router.post('/log', authenticate, validate(logActivitySchema), (req, res, next) =>
  controller.logActivity(req, res, next),
);
router.get('/user/:userId', authenticate, (req, res, next) =>
  controller.getUserActivity(req, res, next),
);
router.get('/dashboard', authenticate, requireMinRole('admin'), (req, res, next) =>
  controller.getDashboardStats(req, res, next),
);
router.get('/system', authenticate, requireMinRole('admin'), (req, res, next) =>
  controller.getSystemStats(req, res, next),
);

export default router;

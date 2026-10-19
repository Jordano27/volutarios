import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', authenticate, requireRole('admin', 'user'), asyncHandler(getDashboard));

export default router;

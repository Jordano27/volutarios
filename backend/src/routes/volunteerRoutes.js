import { Router } from 'express';
import * as controller from '../controllers/volunteerController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { validate, validateId } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createVolunteerSchema,
  updateOwnVolunteerSchema,
  updateVolunteerSchema,
  volunteerQuerySchema,
} from '../validators/volunteerSchemas.js';

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole('admin', 'user'),
  validate(volunteerQuerySchema, 'query'),
  asyncHandler(controller.list),
);
router.get('/me', authenticate, requireRole('volunteer'), asyncHandler(controller.getOwn));
router.get('/:id', authenticate, requireRole('admin', 'user'), validateId, asyncHandler(controller.getById));
router.post('/', authenticate, requireRole('admin'), validate(createVolunteerSchema), asyncHandler(controller.create));
router.put(
  '/me',
  authenticate,
  requireRole('volunteer'),
  validate(updateOwnVolunteerSchema),
  asyncHandler(controller.updateOwn),
);
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  validateId,
  validate(updateVolunteerSchema),
  asyncHandler(controller.update),
);
router.delete('/:id', authenticate, requireRole('admin'), validateId, asyncHandler(controller.remove));

export default router;

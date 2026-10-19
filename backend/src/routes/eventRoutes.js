import { Router } from 'express';
import * as controller from '../controllers/eventController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { validate, validateId } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createEventSchema, eventQuerySchema, updateEventSchema } from '../validators/eventSchemas.js';

const router = Router();

router.get('/', authenticate, validate(eventQuerySchema, 'query'), asyncHandler(controller.list));
router.get(
  '/:id/volunteers',
  authenticate,
  requireRole('admin', 'user'),
  validateId,
  asyncHandler(controller.listVolunteers),
);
router.post('/:id/register', authenticate, requireRole('volunteer'), validateId, asyncHandler(controller.registerSelf));
router.delete(
  '/:id/register',
  authenticate,
  requireRole('volunteer'),
  validateId,
  asyncHandler(controller.unregisterSelf),
);
router.post(
  '/:id/volunteers/:volunteerId',
  authenticate,
  requireRole('admin'),
  validateId,
  asyncHandler(controller.registerVolunteer),
);
router.delete(
  '/:id/volunteers/:volunteerId',
  authenticate,
  requireRole('admin'),
  validateId,
  asyncHandler(controller.unregisterVolunteer),
);
router.get('/:id', authenticate, validateId, asyncHandler(controller.getById));
router.post('/', authenticate, requireRole('admin'), validate(createEventSchema), asyncHandler(controller.create));
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  validateId,
  validate(updateEventSchema),
  asyncHandler(controller.update),
);
router.delete('/:id', authenticate, requireRole('admin'), validateId, asyncHandler(controller.remove));

export default router;

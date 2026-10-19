import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema } from '../validators/authSchemas.js';

const router = Router();

/** POST /auth/login - autentica usuários fictícios e retorna JWT. */
router.post('/login', validate(loginSchema), asyncHandler(login));

export default router;

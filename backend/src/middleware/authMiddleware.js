import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, _res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null;

  if (!token) return next(new AppError('Token de autenticação não informado.', 401));

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new AppError('Token inválido ou expirado.', 401));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Você não possui permissão para esta operação.', 403));
    }
    return next();
  };
}

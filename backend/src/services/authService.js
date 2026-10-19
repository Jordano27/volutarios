import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserByEmail } from '../models/userModel.js';
import { findVolunteerByEmail } from '../models/volunteerModel.js';
import { verifyPassword } from '../utils/password.js';
import { AppError } from '../utils/AppError.js';

/**
 * Autentica um usuário e cria um JWT com email e role.
 * @param {string} email e-mail informado no login
 * @param {string} password senha informada no login
 * @returns {Promise<{token: string, user: {id: number, name: string, email: string, role: string}}>} sessão autenticada
 * @throws {AppError} quando o usuário não existe ou a senha é inválida
 */
export async function login(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);

  if (user && verifyPassword(password, user.password_hash)) {
    const token = jwt.sign({ email: user.email, role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  const volunteer = await findVolunteerByEmail(normalizedEmail);
  if (!volunteer || !verifyPassword(password, volunteer.password_hash)) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const token = jwt.sign({ email: volunteer.email, role: 'volunteer', volunteerId: volunteer.id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  return {
    token,
    user: { id: volunteer.id, name: volunteer.name, email: volunteer.email, role: 'volunteer' },
  };
}

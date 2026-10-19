import crypto from 'node:crypto';

const KEY_LENGTH = 64;

/**
 * Gera um hash de senha usando scrypt, disponível nativamente no Node.js.
 * @param {string} password senha em texto puro
 * @returns {string} hash serializado com algoritmo, salt e digest
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

/**
 * Compara uma senha com um hash scrypt serializado.
 * @param {string} password senha informada pelo usuário
 * @param {string} storedHash hash salvo no banco
 * @returns {boolean} true quando a senha é válida
 */
export function verifyPassword(password, storedHash) {
  const [, salt, storedDigest] = String(storedHash).split('$');
  if (!salt || !storedDigest) return false;

  const calculated = crypto.scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(storedDigest, 'hex');
  return expected.length === calculated.length && crypto.timingSafeEqual(calculated, expected);
}

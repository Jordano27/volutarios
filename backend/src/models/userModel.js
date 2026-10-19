import { pool } from '../config/database.js';

/**
 * Busca um usuário pelo e-mail usado no login.
 * @param {string} email e-mail normalizado do usuário
 * @returns {Promise<Object|null>} usuário encontrado ou null
 */
export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role, password_hash
       FROM users
      WHERE email = ?
      LIMIT 1`,
    [email],
  );
  return rows[0] || null;
}

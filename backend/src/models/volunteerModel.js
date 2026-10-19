import { pool } from '../config/database.js';

const volunteerFields = ['name', 'email', 'phone', 'status'];

/**
 * Lista voluntários usando busca textual e status.
 * @param {Object} [filters={}] filtros de busca e status
 * @returns {Promise<Array<Object>>} voluntários persistidos
 */
export async function findAllVolunteers(filters = {}) {
  const conditions = [];
  const params = [];
  if (filters.search) {
    conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
    const search = `%${filters.search}%`;
    params.push(search, search, search);
  }
  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(
    `SELECT id, name, email, phone, status, created_at, updated_at
       FROM volunteers ${where}
      ORDER BY name`,
    params,
  );
  return rows;
}

/**
 * Busca um voluntário pelo identificador.
 * @param {number|string} id identificador do voluntário
 * @returns {Promise<Object|null>} voluntário encontrado ou null
 */
export async function findVolunteerById(id) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, phone, status, created_at, updated_at
       FROM volunteers
      WHERE id = ?`,
    [id],
  );
  return rows[0] || null;
}

/**
 * Busca um voluntário pelo e-mail usado no login.
 * @param {string} email e-mail normalizado do voluntário
 * @returns {Promise<Object|null>} voluntário encontrado ou null
 */
export async function findVolunteerByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, phone, password_hash, status
       FROM volunteers
      WHERE email = ? AND status = 'active'
      LIMIT 1`,
    [email],
  );
  return rows[0] || null;
}

/**
 * Cria um voluntário.
 * @param {Object} data dados do voluntário a persistir
 * @returns {Promise<Object|null>} voluntário criado
 */
export async function createVolunteer(data) {
  const [result] = await pool.execute(
    `INSERT INTO volunteers (name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.email, data.phone, data.password_hash, data.status || 'active'],
  );
  return findVolunteerById(result.insertId);
}

/**
 * Atualiza um voluntário.
 * @param {number|string} id identificador do voluntário
 * @param {Object} data campos a atualizar
 * @returns {Promise<Object|null>} voluntário atualizado
 */
export async function updateVolunteer(id, data) {
  const entries = Object.entries(data).filter(([key, value]) => volunteerFields.includes(key) && value !== undefined);
  if (entries.length === 0) return findVolunteerById(id);
  const assignments = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  await pool.execute(`UPDATE volunteers SET ${assignments} WHERE id = ?`, [...values, id]);
  return findVolunteerById(id);
}

/**
 * Remove um voluntário e suas inscrições.
 * @param {number|string} id identificador do voluntário
 * @returns {Promise<boolean>} true quando algum registro foi removido
 */
export async function deleteVolunteer(id) {
  const [result] = await pool.execute('DELETE FROM volunteers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

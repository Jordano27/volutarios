import { pool } from '../config/database.js';

const eventFields = ['title', 'description', 'event_date', 'location', 'max_volunteers', 'status'];

/**
 * Lista eventos com filtros opcionais e total de voluntários inscritos.
 * @param {Object} [filters={}] filtros de busca, status e período
 * @param {Object} [viewer={}] usuário autenticado que consulta os eventos
 * @returns {Promise<Array<Object>>} eventos persistidos
 */
export async function findAllEvents(filters = {}, viewer = {}) {
  const conditions = [];
  const viewerId = viewer.role === 'volunteer' ? Number(viewer.volunteerId) || 0 : 0;
  const params = [viewerId];

  if (filters.search) {
    conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)');
    const search = `%${filters.search}%`;
    params.push(search, search, search);
  }
  if (filters.status) {
    conditions.push('e.status = ?');
    params.push(filters.status);
  }
  if (filters.from) {
    conditions.push('e.event_date >= ?');
    params.push(filters.from);
  }
  if (filters.to) {
    conditions.push('e.event_date <= ?');
    params.push(filters.to);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(
    `SELECT e.id, e.title, e.description, e.event_date, e.location,
            e.max_volunteers, e.status, e.created_at, e.updated_at,
            COUNT(ev.volunteer_id) AS volunteer_count,
            MAX(CASE WHEN ev.volunteer_id = ? THEN 1 ELSE 0 END) AS is_registered
       FROM events e
       LEFT JOIN event_volunteers ev ON ev.event_id = e.id
       ${where}
      GROUP BY e.id
      ORDER BY e.event_date ASC, e.id DESC`,
    params,
  );
  return rows;
}

/**
 * Busca um evento pelo identificador.
 * @param {number|string} id identificador do evento
 * @param {Object} [viewer={}] usuário autenticado que consulta o evento
 * @returns {Promise<Object|null>} evento encontrado ou null
 */
export async function findEventById(id, viewer = {}) {
  const viewerId = viewer.role === 'volunteer' ? Number(viewer.volunteerId) || 0 : 0;
  const [rows] = await pool.execute(
    `SELECT e.id, e.title, e.description, e.event_date, e.location,
            e.max_volunteers, e.status, e.created_at, e.updated_at,
            COUNT(ev.volunteer_id) AS volunteer_count,
            MAX(CASE WHEN ev.volunteer_id = ? THEN 1 ELSE 0 END) AS is_registered
       FROM events e
       LEFT JOIN event_volunteers ev ON ev.event_id = e.id
      WHERE e.id = ?
      GROUP BY e.id`,
    [viewerId, id],
  );
  return rows[0] || null;
}

/**
 * Insere um evento no banco.
 * @param {Object} data dados do evento a persistir
 * @returns {Promise<Object|null>} evento criado
 */
export async function createEvent(data) {
  const [result] = await pool.execute(
    `INSERT INTO events (title, description, event_date, location, max_volunteers, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.title, data.description, data.event_date, data.location, data.max_volunteers, data.status || 'active'],
  );
  return findEventById(result.insertId);
}

/**
 * Atualiza apenas os campos permitidos de um evento.
 * @param {number|string} id identificador do evento
 * @param {Object} data campos a atualizar
 * @returns {Promise<Object|null>} evento atualizado
 */
export async function updateEvent(id, data) {
  const entries = Object.entries(data).filter(([key, value]) => eventFields.includes(key) && value !== undefined);
  if (entries.length === 0) return findEventById(id);

  const assignments = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  await pool.execute(`UPDATE events SET ${assignments} WHERE id = ?`, [...values, id]);
  return findEventById(id);
}

/**
 * Remove um evento e suas inscrições relacionadas.
 * @param {number|string} id identificador do evento
 * @returns {Promise<boolean>} true quando algum registro foi removido
 */
export async function deleteEvent(id) {
  const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Lista os voluntários inscritos em um evento.
 * @param {number|string} eventId identificador do evento
 * @returns {Promise<Array<Object>>} voluntários inscritos
 */
export async function findEventVolunteers(eventId) {
  const [rows] = await pool.execute(
    `SELECT v.id, v.name, v.email, v.phone, v.status, ev.registered_at
       FROM event_volunteers ev
       INNER JOIN volunteers v ON v.id = ev.volunteer_id
      WHERE ev.event_id = ?
      ORDER BY v.name`,
    [eventId],
  );
  return rows;
}

/**
 * Conta inscrições e tenta criar uma nova inscrição atomicamente.
 * @param {number|string} eventId identificador do evento
 * @param {number|string} volunteerId identificador do voluntário
 * @returns {Promise<{type: string}>} resultado da operação
 */
export async function registerVolunteer(eventId, volunteerId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [eventRows] = await connection.execute(
      `SELECT status,
              max_volunteers,
              (SELECT COUNT(*) FROM event_volunteers WHERE event_id = e.id) AS volunteer_count
         FROM events e
        WHERE e.id = ?
        FOR UPDATE`,
      [eventId],
    );
    if (!eventRows[0]) {
      await connection.rollback();
      return { type: 'event-not-found' };
    }
    if (eventRows[0].status !== 'active') {
      await connection.rollback();
      return { type: 'event-closed' };
    }
    if (Number(eventRows[0].volunteer_count) >= Number(eventRows[0].max_volunteers)) {
      await connection.rollback();
      return { type: 'capacity' };
    }

    const [volunteerRows] = await connection.execute("SELECT id FROM volunteers WHERE id = ? AND status = 'active'", [
      volunteerId,
    ]);
    if (!volunteerRows[0]) {
      await connection.rollback();
      return { type: 'volunteer-not-found' };
    }

    await connection.execute('INSERT INTO event_volunteers (event_id, volunteer_id) VALUES (?, ?)', [
      eventId,
      volunteerId,
    ]);
    await connection.commit();
    return { type: 'ok' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Remove uma inscrição de evento.
 * @param {number|string} eventId identificador do evento
 * @param {number|string} volunteerId identificador do voluntário
 * @returns {Promise<boolean>} true quando algum vínculo foi removido
 */
export async function unregisterVolunteer(eventId, volunteerId) {
  const [result] = await pool.execute('DELETE FROM event_volunteers WHERE event_id = ? AND volunteer_id = ?', [
    eventId,
    volunteerId,
  ]);
  return result.affectedRows > 0;
}
